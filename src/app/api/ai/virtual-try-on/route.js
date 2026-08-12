import { NextResponse } from 'next/server';
import { client, handle_file } from '@gradio/client';

export const maxDuration = 60; // Allow maximum serverless time for HF API

export async function POST(request) {
  try {
    const { humanImage, garmentImage, category = 'upper_body' } = await request.json();

    if (!humanImage || !garmentImage) {
      return NextResponse.json({ error: 'As imagens da pessoa e da roupa são obrigatórias.' }, { status: 400 });
    }

    // Helper: convert base64 data URL to a Blob
    async function toBlob(dataUrl) {
      if (!dataUrl.startsWith('data:')) {
        const res = await fetch(dataUrl);
        return await res.blob();
      }
      const match = dataUrl.match(/^data:([a-zA-Z0-9+/.-]+);base64,(.+)$/);
      if (!match) throw new Error('Formato de imagem inválido');
      const mimeType = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      return new Blob([buffer], { type: mimeType });
    }

    const [humanBlob, garmentBlob] = await Promise.all([
      toBlob(humanImage),
      toBlob(garmentImage),
    ]);

    // Conectar ao modelo gratuito da Hugging Face
    const app = await client('yisol/IDM-VTON');
    
    // Executar a IA (pode levar alguns minutos dependendo da fila)
    const result = await app.predict('/tryon', [
      { background: handle_file(humanBlob), layers: [], composite: null }, // Human
      handle_file(garmentBlob), // Garment
      'Fashion garment', // description
      true, // is_checked
      false, // is_checked_crop
      30, // denoise_steps
      42  // seed
    ]);

    // O retorno da API do Gradio geralmente coloca o output no array data
    const resultUrl = result?.data?.[0]?.url || result?.data?.[0]?.path;
    
    if (!resultUrl) {
      console.error('Unexpected Gradio response:', JSON.stringify(result));
      throw new Error('Falha ao receber a imagem do servidor gratuito.');
    }

    return NextResponse.json({ url: resultUrl });

  } catch (error) {
    console.error('Erro no Virtual Try-On (Gradio):', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar provador virtual gratuito' },
      { status: 500 }
    );
  }
}
