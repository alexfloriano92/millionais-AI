import { NextResponse } from 'next/server';

// Helper: upload a base64 image to Fal.ai storage to get a public URL
async function uploadBase64ToFal(base64DataUrl, falKey) {
  // Extract mime type and raw base64
  const match = base64DataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!match) throw new Error('Formato de imagem inválido');

  const mimeType = match[1];
  const base64Data = match[2];
  const binaryBuffer = Buffer.from(base64Data, 'base64');

  // Upload to Fal.ai storage
  const uploadRes = await fetch('https://fal.run/fal-ai/storage/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${falKey}`,
      'Content-Type': mimeType,
    },
    body: binaryBuffer,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    console.error('Fal storage upload error:', err);
    throw new Error('Falha ao fazer upload da imagem para o servidor');
  }

  const uploadData = await uploadRes.json();
  // Fal storage returns { url: "https://..." }
  return uploadData.url;
}

export async function POST(request) {
  try {
    const { humanImage, garmentImage, category = 'upper_body' } = await request.json();

    if (!humanImage || !garmentImage) {
      return NextResponse.json({ error: 'As imagens da pessoa e da roupa são obrigatórias.' }, { status: 400 });
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: 'Chave do Fal.ai (FAL_KEY) não configurada no servidor.' }, { status: 500 });
    }

    const falKey = process.env.FAL_KEY;

    // Upload human image if it's base64
    let humanImageUrl = humanImage;
    if (humanImage.startsWith('data:')) {
      humanImageUrl = await uploadBase64ToFal(humanImage, falKey);
    }

    // Garment image may be a URL already (from product), but handle base64 too
    let garmentImageUrl = garmentImage;
    if (garmentImage && garmentImage.startsWith('data:')) {
      garmentImageUrl = await uploadBase64ToFal(garmentImage, falKey);
    }

    // Call Fal.ai IDM-VTON API with public URLs
    const response = await fetch('https://fal.run/fal-ai/idm-vton', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        human_image_url: humanImageUrl,
        garment_image_url: garmentImageUrl,
        category: category,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Fal.ai error:', errorData);
      throw new Error(errorData.detail || errorData.error || JSON.stringify(errorData));
    }

    const data = await response.json();

    // Fal.ai returns the image in data.image.url
    const resultUrl = data?.image?.url || data?.images?.[0]?.url;
    if (!resultUrl) {
      console.error('Unexpected Fal.ai response:', JSON.stringify(data));
      throw new Error('Formato de resposta inesperado do Fal.ai');
    }

    return NextResponse.json({ url: resultUrl });

  } catch (error) {
    console.error('Erro no Virtual Try-On (Fal.ai):', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar provador virtual' },
      { status: 500 }
    );
  }
}
