'use client';
import { useState } from 'react';

const SYSTEM_INSTRUCTION = `Você é o GURU, o analista chefe de conteúdo viral.
O usuário vai colar o link (ou descrever detalhadamente) um vídeo que viralizou no TikTok ou Reels.
Sua missão é destrinchar a anatomia desse viral e criar um plano de ação para o usuário replicar o sucesso no nicho dele.

Sua resposta deve SEMPRE ter esta estrutura:
## 1. O Gancho (Hook)
Por que as pessoas pararam para assistir os primeiros 3 segundos?

## 2. Retenção
O que manteve as pessoas assistindo até o final? (Cortes rápidos, história, curiosidade, b-roll?)

## 3. Apelo Emocional / Gatilho Mental
O que fez as pessoas quererem compartilhar, salvar ou comentar?

## 4. Como Replicar (O Blueprint)
Um roteiro passo-a-passo e um script de exemplo de como o usuário pode fazer a própria versão desse vídeo adaptado ao produto dele.`;

export default function GuruPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const analyzeViral = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: `Analise este vídeo viral:\n\n${input}` }],
          systemInstruction: SYSTEM_INSTRUCTION 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao analisar');
      
      setAnalysis(data.text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32 }}>🔥</span> GURU: Analisador de Virais
        </h1>
        <p className="page-subtitle">Desconstrua vídeos que estão bombando e descubra a fórmula exata para replicar.</p>
      </div>

      <div className="grid-2">
        {/* INPUT SECTION */}
        <div className="card">
          <form onSubmit={analyzeViral}>
            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">Qual vídeo viralizou?</label>
              <textarea 
                className="input" 
                placeholder="Cole o link do TikTok/Reels aqui ou descreva o vídeo em detalhes (ex: É um vídeo onde uma pessoa começa jogando água na câmera e depois fala sobre como o skincare...)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ minHeight: 180 }}
              />
            </div>

            <button 
              type="submit"
              className="btn btn-danger" 
              style={{ width: '100%' }}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16 }}></span> O GURU está analisando...</>
              ) : (
                '🔥 Destrinchar Viral (1 Crédito)'
              )}
            </button>
            
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16, lineHeight: 1.6 }}>
              <b>Nota:</b> Como a IA não pode assistir ao vídeo diretamente pelo link, para obter melhores resultados, adicione uma breve descrição do que acontece no vídeo junto com o link.
            </div>

            {error && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, fontSize: 13, color: 'var(--red)' }}>
                {error}
              </div>
            )}
          </form>
        </div>

        {/* RESULT SECTION */}
        <div>
          {analysis ? (
            <div className="card" style={{ background: 'var(--raised)', borderColor: 'var(--glow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Análise do GURU</h2>
                <button className="copy-btn" onClick={() => navigator.clipboard.writeText(analysis)}>
                  📋 Copiar
                </button>
              </div>
              
              <div style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--text)' }}>
                {analysis.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) return <h3 key={i} style={{ fontSize: 17, color: 'var(--glow)', marginTop: 24, marginBottom: 12 }}>{line.replace('## ', '')}</h3>;
                  if (line.startsWith('# ')) return <h2 key={i} style={{ fontSize: 20, color: 'var(--glow)', marginTop: 24, marginBottom: 12 }}>{line.replace('# ', '')}</h2>;
                  if (line.startsWith('- ')) return <li key={i} style={{ marginLeft: 16, marginBottom: 4 }}>{line.replace('- ', '')}</li>;
                  if (line.includes('**')) return <p key={i} style={{ marginBottom: 12 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>;
                  return <p key={i} style={{ marginBottom: 12 }}>{line}</p>;
                })}
              </div>
            </div>
          ) : (
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5, filter: 'grayscale(1)' }}>🔥</div>
              <div style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500 }}>A análise do GURU aparecerá aqui</div>
              <div style={{ fontSize: 13, color: 'var(--faint)', marginTop: 8, maxWidth: 260, textAlign: 'center' }}>
                Descubra os ganchos, retenção e gatilhos emocionais por trás do sucesso.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
