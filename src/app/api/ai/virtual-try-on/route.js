import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { humanImage, garmentImage, category = 'upper_body' } = await request.json();

    if (!humanImage || !garmentImage) {
      return NextResponse.json({ error: 'As imagens da pessoa e da roupa são obrigatórias.' }, { status: 400 });
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: 'Chave do Fal.ai (FAL_KEY) não configurada no servidor.' }, { status: 500 });
    }

    // Call Fal.ai IDM-VTON API
    const response = await fetch('https://fal.run/fal-ai/idm-vton', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        human_image_url: humanImage,
        garment_image_url: garmentImage,
        category: category,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Fal.ai error:', errorData);
      throw new Error(errorData.detail || 'Erro na API do Fal.ai');
    }

    const data = await response.json();
    
    // Fal.ai usually returns the generated image in data.image.url
    if (!data.image || !data.image.url) {
      throw new Error('Formato de resposta inesperado do Fal.ai');
    }

    return NextResponse.json({ 
      url: data.image.url
    });

  } catch (error) {
    console.error('Erro no Virtual Try-On (Fal.ai):', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar provador virtual' },
      { status: 500 }
    );
  }
}
