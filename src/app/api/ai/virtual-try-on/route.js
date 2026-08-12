import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Note: Uses Gemini to describe the uploaded person, then Pollinations to generate the new image with the product.
export async function POST(request) {
  try {
    const { imageBase64, productDesc } = await request.json();

    if (!imageBase64 || !productDesc) {
      return NextResponse.json({ error: 'Imagem e produto são obrigatórios' }, { status: 400 });
    }

    let personDescription = "beautiful fashion model";

    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const base64Data = imageBase64.split(',')[1];
        const mimeType = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1];

        const imageParts = [{ inlineData: { data: base64Data, mimeType } }];
        const prompt = `Analyze this person's physical appearance. Write a highly detailed physical description in English for an image generation prompt. Include gender, approximate age, skin tone, facial features, hair style/color, and overall vibe. Do NOT describe the clothes or background. Return ONLY the physical description text.`;

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        personDescription = response.text().trim();
      } catch (geminiError) {
        console.error("Erro no Gemini Vision, usando fallback genérico:", geminiError);
      }
    } else {
      console.warn("GEMINI_API_KEY não configurada. Usando fallback para Virtual Try-On.");
    }

    // 2. Generate the final image using Pollinations with the person description + product
    const finalPrompt = `${personDescription}, wearing ${productDesc}, full body fashion photography, realistic, high quality, 8k, sharp focus, modern clean background`;

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=512&height=512&nologo=true&private=true&seed=${Math.floor(Math.random() * 100000)}`;

    const imgResponse = await fetch(url);
    if (!imgResponse.ok) throw new Error('Erro ao baixar imagem final');

    const arrayBuffer = await imgResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const finalBase64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

    return NextResponse.json({ 
      url: finalBase64Image,
      debug: { personDescription, finalPrompt } 
    });

  } catch (error) {
    console.error('Erro no Virtual Try-On:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar provador virtual' },
      { status: 500 }
    );
  }
}
