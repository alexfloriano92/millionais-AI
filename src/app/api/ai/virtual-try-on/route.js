import { NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

export async function POST(request) {
  try {
    const { humanImage, garmentImage, category = 'upper_body' } = await request.json();

    if (!humanImage || !garmentImage) {
      return NextResponse.json({ error: 'As imagens da pessoa e da roupa são obrigatórias.' }, { status: 400 });
    }

    // Hardcoding the key temporarily since the user is having trouble with Vercel env vars
    const cleanFalKey = "50ee10a1-d0be-4e4e-900b-ceaf78896fb1:6a5dcb3ac8ba189903720277d7f56382";
    
    // Explicitly configure just to be safe
    fal.config({ credentials: cleanFalKey });

    // Helper: convert base64 data URL to a File/Blob and upload via fal SDK
    async function toPublicUrl(dataUrlOrUrl) {
      if (!dataUrlOrUrl.startsWith('data:')) return dataUrlOrUrl; // already a URL

      const match = dataUrlOrUrl.match(/^data:([a-zA-Z0-9+/.-]+);base64,(.+)$/);
      if (!match) throw new Error('Formato de imagem inválido');

      const mimeType = match[1];
      const ext = mimeType.split('/')[1] || 'png';
      
      // Use Buffer in Node.js
      const buffer = Buffer.from(match[2], 'base64');
      const file = new File([buffer], `image.${ext}`, { type: mimeType });

      const url = await fal.storage.upload(file);
      return url;
    }

    // Upload images to Fal CDN to get public URLs
    const [humanImageUrl, garmentImageUrl] = await Promise.all([
      toPublicUrl(humanImage),
      toPublicUrl(garmentImage),
    ]);

    // Call Fal.ai IDM-VTON
    const result = await fal.subscribe('fal-ai/idm-vton', {
      input: {
        human_image_url: humanImageUrl,
        garment_image_url: garmentImageUrl,
        category,
      },
    });

    const resultUrl = result?.data?.image?.url || result?.data?.images?.[0]?.url;
    if (!resultUrl) {
      console.error('Unexpected Fal.ai response:', JSON.stringify(result));
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
