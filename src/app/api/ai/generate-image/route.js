import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ── Pollinations AI fallback (completely free, no API key) ──
async function generateWithPollinations(prompt) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&private=true&seed=${Math.floor(Math.random() * 100000)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erro ao baixar imagem da IA gratuita (Pollinations)');

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;
  return base64Image;
}

export async function POST(request) {
  try {
    const { prompt, provider } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 });
    }

    // ── Route: Free provider (Pollinations AI) ──
    if (provider === 'free') {
      const imageUrl = await generateWithPollinations(prompt);
      return NextResponse.json({ 
        url: imageUrl,
        provider: 'pollinations',
        warning: 'Imagem gerada com IA gratuita (Pollinations AI).'
      });
    }

    // ── Route: OpenAI DALL-E (premium) ──
    if (!process.env.OPENAI_API_KEY) {
      // No key — auto-fallback
      console.log('OpenAI key missing, falling back to Pollinations AI');
      const imageUrl = await generateWithPollinations(prompt);
      return NextResponse.json({ 
        url: imageUrl,
        provider: 'pollinations-fallback',
        warning: 'Chave OpenAI não configurada. Imagem gerada com IA gratuita (Pollinations AI).'
      });
    }

    try {
      // Call the OpenAI API to generate the image
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });

      const imageUrl = response.data[0].url;
      return NextResponse.json({ url: imageUrl, provider: 'openai' });

    } catch (openaiError) {
      // Auto-fallback to Pollinations on any OpenAI error (429, billing, model not found, etc.)
      console.error('OpenAI Image falhou, usando Pollinations como fallback:', openaiError.message);
      const imageUrl = await generateWithPollinations(prompt);
      return NextResponse.json({ 
        url: imageUrl,
        provider: 'pollinations-fallback',
        warning: `OpenAI indisponível (${openaiError.message?.substring(0, 60)}). Imagem gerada com IA gratuita (Pollinations AI).`
      });
    }

  } catch (error) {
    console.error('Erro na API de geração de imagem:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar imagem' },
      { status: 500 }
    );
  }
}
