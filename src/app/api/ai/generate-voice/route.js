import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ── Google Translate TTS (Free, no API key needed) ──
// Splits text into chunks under 200 chars and fetches audio from Google's public TTS endpoint.
async function generateWithGoogleTTS(text, lang = 'pt-BR') {
  const chunks = [];
  let currentChunk = '';

  // Split by sentences first, then by words if a sentence is too long
  const sentences = text.replace(/([.!?])\s+/g, '$1|||').split('|||');

  for (const sentence of sentences) {
    if ((currentChunk + ' ' + sentence).trim().length > 190) {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      // If a single sentence is > 190 chars, split by words
      if (sentence.length > 190) {
        const words = sentence.split(' ');
        currentChunk = '';
        for (const word of words) {
          if ((currentChunk + ' ' + word).trim().length > 190) {
            if (currentChunk.trim()) chunks.push(currentChunk.trim());
            currentChunk = word;
          } else {
            currentChunk = currentChunk ? (currentChunk + ' ' + word) : word;
          }
        }
      } else {
        currentChunk = sentence;
      }
    } else {
      currentChunk = currentChunk ? (currentChunk + ' ' + sentence) : sentence;
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim());

  const buffers = [];
  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${lang}&client=tw-ob`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!res.ok) {
      throw new Error(`Google TTS falhou no chunk: ${res.status} ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    buffers.push(Buffer.from(arrayBuffer));
  }

  return Buffer.concat(buffers);
}

export async function POST(request) {
  try {
    const { text, voice, provider } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });
    }

    // ── Route: Google TTS (free) ──
    if (provider === 'google') {
      const buffer = await generateWithGoogleTTS(text);
      return new Response(buffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length.toString(),
          'X-TTS-Provider': 'google',
        },
      });
    }

    // ── Route: OpenAI TTS (premium) ──
    if (!process.env.OPENAI_API_KEY) {
      // No key configured — auto-fallback to Google TTS
      console.log('OpenAI key missing, falling back to Google TTS');
      const buffer = await generateWithGoogleTTS(text);
      return new Response(buffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length.toString(),
          'X-TTS-Provider': 'google-fallback',
        },
      });
    }

    try {
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice || "alloy",
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());

      return new Response(buffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length.toString(),
          'X-TTS-Provider': 'openai',
        },
      });
    } catch (openaiError) {
      // Auto-fallback to Google TTS on any OpenAI error (429, billing, etc.)
      console.error('OpenAI TTS falhou, usando Google TTS como fallback:', openaiError.message);
      const buffer = await generateWithGoogleTTS(text);
      return new Response(buffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length.toString(),
          'X-TTS-Provider': 'google-fallback',
        },
      });
    }

  } catch (error) {
    console.error('Erro na geração de voz TTS:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao sintetizar voz' },
      { status: 500 }
    );
  }
}
