import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    }

    let title = '';
    let description = '';
    let image = '';
    let images = [];
    let price = '';
    let niche = 'Geral';

    // Special handler for mobile TikTok URLs (vt.tiktok.com)
    if (url.includes('tiktok.com')) {
      const redirectRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        redirect: 'manual', // Stop at redirect to extract location
      });

      const location = redirectRes.headers.get('location');
      
      if (location) {
        try {
          const urlObj = new URL(location);
          const ogInfoParam = urlObj.searchParams.get('og_info');
          
          if (ogInfoParam) {
            const decoded = JSON.parse(decodeURIComponent(ogInfoParam));
            title = decoded.title || '';
            image = decoded.image || '';
            if (image) images.push(image);
            
            // Clean title
            title = title.replace(/\s*[-|–]\s*TikTok.*/i, '').trim();
          }
        } catch (e) {
          console.error('Erro ao decodificar og_info do TikTok:', e);
        }
      }
    }

    // Fallback: If not a TikTok redirect, or redirect parsing failed, try direct scraping
    if (!title && !image) {
      const pageRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        },
        redirect: 'follow',
      });

      if (!pageRes.ok) {
        throw new Error(`Não foi possível acessar a página (status ${pageRes.status})`);
      }

      const html = await pageRes.text();

      const getMetaContent = (property) => {
        const ogMatch = html.match(new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']*)["']`, 'i'))
          || html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:${property}["']`, 'i'));
        if (ogMatch) return ogMatch[1];

        const twMatch = html.match(new RegExp(`<meta[^>]*name=["']twitter:${property}["'][^>]*content=["']([^"']*)["']`, 'i'))
          || html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']twitter:${property}["']`, 'i'));
        if (twMatch) return twMatch[1];

        if (property === 'description') {
          const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
            || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
          if (descMatch) return descMatch[1];
        }
        return '';
      };

      const titleTagMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      title = getMetaContent('title') || (titleTagMatch ? titleTagMatch[1].trim() : '');
      description = getMetaContent('description');
      image = getMetaContent('image');
      if (image) images.push(image);

      // JSON-LD structured data parsing
      const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      if (jsonLdMatch) {
        for (const match of jsonLdMatch) {
          try {
            const jsonContent = match.replace(/<\/?script[^>]*>/gi, '');
            const parsed = JSON.parse(jsonContent);
            if (parsed.image) {
              const imgs = Array.isArray(parsed.image) ? parsed.image : [parsed.image];
              imgs.forEach(img => {
                const imgUrl = typeof img === 'string' ? img : img.url;
                if (imgUrl && !images.includes(imgUrl)) images.push(imgUrl);
              });
            }
            if (parsed.name && !title) title = parsed.name;
            if (parsed.description && !description) description = parsed.description;
            if (parsed.offers?.price && !price) price = String(parsed.offers.price);
          } catch (e) {}
        }
      }
    }

    if (!title) {
      return NextResponse.json({ 
        error: 'Não foi possível extrair informações desse link de produto. Verifique se o link está correto.' 
      }, { status: 422 });
    }

    // Clean title
    title = title.replace(/\s*[-|–]\s*TikTok.*/i, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();

    // Use Gemini to write a high-converting e-commerce product description based on the title
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(
          `Escreva uma descrição atraente de e-commerce (máximo 2 sentenças) para vender o seguinte produto: "${title}". Seja persuasivo e foque nos benefícios. Retorne apenas o texto da descrição.`
        );
        const text = result.response.text();
        if (text) description = text.trim();
      } catch (e) {
        console.error('Erro ao gerar descrição com Gemini:', e);
      }
    }

    // Detect niche
    const lowerDesc = (title + ' ' + description).toLowerCase();
    if (/skincare|beleza|maquiagem|cosmetic|beauty|creme|sérum|protetor|hidratante|macaquinho|canelado/i.test(lowerDesc)) niche = 'Beleza/Skincare';
    else if (/roupa|moda|vestido|calça|tênis|sapato|fashion|blusa|camiseta|macaquinho|canelado/i.test(lowerDesc)) niche = 'Moda';
    else if (/fone|relógio|smartwatch|eletrônic|gadget|led|tech|bluetooth|usb/i.test(lowerDesc)) niche = 'Eletrônicos';
    else if (/casa|decoração|cozinha|organiz|móvel|home/i.test(lowerDesc)) niche = 'Casa';
    else if (/fitness|treino|gym|suplemento|whey|academia|protein/i.test(lowerDesc)) niche = 'Fitness';

    return NextResponse.json({
      title,
      description: description || 'Sem descrição.',
      image: images[0] || '',
      images,
      price,
      niche,
      sourceUrl: url,
    });

  } catch (error) {
    console.error('Erro ao importar produto:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao acessar o link do produto' },
      { status: 500 }
    );
  }
}
