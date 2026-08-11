import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 });
    }

    // Call Pollinations AI (completely free image generator)
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&private=true&seed=${Math.floor(Math.random() * 100000)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao baixar imagem da IA gratuita');

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

    return NextResponse.json({ url: base64Image });

  } catch (error) {
    console.error('Erro na geração gratuita de imagem:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar imagem com a IA gratuita' },
      { status: 500 }
    );
  }
}
