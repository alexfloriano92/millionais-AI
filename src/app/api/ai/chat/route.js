import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { messages, systemInstruction } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Mensagens inválidas' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Chave da API do Gemini não configurada' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Configure the model, using gemini-1.5-pro for best chat/reasoning performance
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      systemInstruction: systemInstruction || "Você é um assistente de IA especialista na criação de conteúdo de e-commerce e vídeos virais.",
    });

    // Extract the latest user message
    const latestMessage = messages[messages.length - 1];
    
    if (latestMessage.role !== 'user') {
        return NextResponse.json({ error: 'A última mensagem deve ser do usuário' }, { status: 400 });
    }

    // Format previous messages for history (Gemini format)
    const rawHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Ensure history strictly alternates and starts with 'user'
    const history = [];
    let expectedRole = 'user';
    for (const msg of rawHistory) {
      if (msg.role === expectedRole) {
        history.push(msg);
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      }
    }

    // Start chat session
    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: 0.7,
      },
    });

    // Send the message and get response
    const result = await chat.sendMessage(latestMessage.content);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });

  } catch (error) {
    console.error('Erro na API de chat do Gemini:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar mensagem com a IA' },
      { status: 500 }
    );
  }
}
