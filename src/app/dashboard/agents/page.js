'use client';
import { useState, useRef, useEffect } from 'react';

const SYSTEM_INSTRUCTION = `Você é um Agente de Conversão Especialista em E-commerce e Criação de Conteúdo Viral.
Seu objetivo é ajudar o usuário a criar PROMPTS ALTAMENTE OTIMIZADOS para geração de imagens (Midjourney/DALL-E) ou vídeos.
Quando o usuário falar sobre um produto, você deve:
1. Analisar os pontos fortes do produto.
2. Fornecer 3 opções de "ângulos" ou estilos de conteúdo (ex: UGC, Estúdio luxuoso, Lifestyle natural).
3. Escrever o prompt exato em INGLÊS que ele pode copiar e colar no gerador de imagens para obter o melhor resultado possível. O prompt deve incluir câmera, lente, iluminação, e humor.
Seja direto, profissional e use formatação markdown.`;

export default function AgentsPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Olá! Sou seu Agente de Conversão. Me diga qual produto você quer divulgar hoje e eu criarei os prompts perfeitos para suas imagens ou vídeos.' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          systemInstruction: SYSTEM_INSTRUCTION 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na API');
      
      setMessages(prev => [...prev, { role: 'model', content: data.text }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: '⚠️ Ocorreu um erro ao conectar com o Gemini: ' + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body" style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', paddingTop: 24, paddingBottom: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title">Agente de Conversão</h1>
        <p className="page-subtitle">Converse com a IA especialista em criar prompts que vendem (Powered by Gemini 1.5 Pro).</p>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* CHAT AREA */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.role}`}>
              <div className={`chat-avatar ${msg.role}`}>
                {msg.role === 'model' ? '🤖' : '👤'}
              </div>
              <div className={`chat-bubble ${msg.role}`} style={{ whiteSpace: 'pre-wrap' }}>
                {/* Simple Markdown Rendering for demo purposes */}
                {msg.content.split('**').map((text, idx) => idx % 2 === 1 ? <strong key={idx}>{text}</strong> : text)}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="chat-msg model">
              <div className="chat-avatar model">🤖</div>
              <div className="chat-bubble model" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px' }}>
                <span className="spinner" style={{ width: 14, height: 14, borderTopColor: 'var(--glow)' }}></span>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>Agente pensando...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'var(--raised)' }}>
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: 12 }}>
            <input 
              type="text" 
              className="input" 
              placeholder="Ex: Quero vender um fone de ouvido bluetooth com cancelamento de ruído branco minimalista..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
              Enviar <span>↑</span>
            </button>
          </form>
          <div style={{ fontSize: 11, color: 'var(--faint)', textAlign: 'center', marginTop: 12 }}>
            O Agente de Conversão usa o modelo Gemini 1.5 Pro para análise avançada e criação de prompts.
          </div>
        </div>
      </div>
    </div>
  );
}
