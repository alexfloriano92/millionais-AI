'use client';
import { useState, useEffect } from 'react';

export default function ImagesPage() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('ugc');
  const [loading, setLoading] = useState(false);
  const [promptGenerating, setPromptGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [imageProvider, setImageProvider] = useState('free');

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsedUser = JSON.parse(u);
      setUser(parsedUser);
      loadProducts(parsedUser.id);
    }
  }, []);

  const loadProducts = async (userId) => {
    try {
      const res = await fetch(`/api/products?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        if (data.length > 0) setSelectedProductId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const generatePromptWithIA = async () => {
    const selectedProd = products.find(p => p.id === selectedProductId);
    if (!selectedProd) return;
    
    setPromptGenerating(true);
    setError('');

    const systemPrompt = `Você é uma IA especialista em engenharia de prompt para o DALL-E 3 / Midjourney.
O usuário quer gerar uma imagem profissional para vender o produto abaixo:
Nome: ${selectedProd.name}
Nicho: ${selectedProd.niche}
Descrição: ${selectedProd.description}

Escreva um único parágrafo de PROMPT em INGLÊS, altamente descritivo e comercial. Foque na iluminação, texturas do produto, ângulo da câmera (close-up ou macro) e o estilo visual ideal para conversão (redes sociais/anúncios). Não inclua nenhuma outra introdução ou explicação, responda APENAS com o prompt em inglês.`;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: 'Gere o prompt para o meu produto.' }],
          systemInstruction: systemPrompt 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar prompt');
      setPrompt(data.text);
    } catch (err) {
      setError('Erro ao sugerir prompt: ' + err.message);
    } finally {
      setPromptGenerating(false);
    }
  };

  const generateImage = async () => {
    if (!prompt) return;
    setLoading(true);
    setError('');
    setWarning('');
    
    let finalPrompt = prompt;
    if (style === 'ugc') finalPrompt += ". UGC style photo, shot on iPhone, natural lighting, realistic, unsplash.";
    if (style === 'studio') finalPrompt += ". Studio photography, professional lighting, clean solid background, 85mm lens, highly detailed.";
    if (style === 'lifestyle') finalPrompt += ". Lifestyle photography, natural environment, depth of field, cinematic lighting.";

    try {
      const endpoint = imageProvider === 'free' ? '/api/ai/generate-free-image' : '/api/ai/generate-image';
      const bodyPayload = imageProvider === 'free'
        ? { prompt: finalPrompt }
        : { prompt: finalPrompt, provider: 'openai' };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar imagem');
      
      setResult(data.url);
      if (data.warning) {
        setWarning(data.warning);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Estúdio de Imagens</h1>
        <p className="page-subtitle">Gere fotos realistas integradas ao seu Inventário de Produtos usando Inteligência Artificial.</p>
      </div>

      <div className="grid-2">
        {/* INPUT SECTION */}
        <div className="card">
          {products.length > 0 ? (
            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">1. Escolha o Produto do Inventário</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <select 
                  className="input" 
                  value={selectedProductId} 
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  style={{ flex: 1 }}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.niche})</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={generatePromptWithIA}
                  disabled={promptGenerating}
                >
                  {promptGenerating ? 'Gerando...' : '🪄 Sugerir Prompt IA'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,122,69,0.05)', border: '1px solid rgba(255,122,69,0.2)', borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 13, color: 'var(--ember)' }}>
              ⚠️ Você não possui produtos cadastrados. Cadastre um produto no <b>Inventário de Produtos</b> para poder gerar prompts automáticos baseados nele.
            </div>
          )}

          <div className="input-group" style={{ marginBottom: 20 }}>
            <label className="input-label">2. Prompt / Descrição da Imagem</label>
            <textarea 
              className="input" 
              placeholder="Digite o prompt ou clique em 'Sugerir Prompt IA' acima para preencher automaticamente..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ minHeight: 140 }}
            />
          </div>

          <div className="input-group" style={{ marginBottom: 24 }}>
            <label className="input-label">3. Estilo Direção de Arte</label>
            <select className="input" value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="ugc">📱 UGC / Natural (Ideal para criativos rápidos)</option>
              <option value="studio">📸 Estúdio / Fundo Limpo (Ideal para site/catálogo)</option>
              <option value="lifestyle">🌿 Lifestyle / Contexto Real (Ideal para Instagram)</option>
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: 24 }}>
            <label className="input-label">4. Motor de Geração</label>
            <select className="input" value={imageProvider} onChange={(e) => setImageProvider(e.target.value)}>
              <option value="free">🆓 Pollinations AI (Gratuito - Sem Limites)</option>
              <option value="openai">💎 OpenAI DALL-E 3 (Premium - Requer Créditos)</option>
            </select>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            onClick={generateImage}
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16 }}></span> {imageProvider === 'free' ? 'Gerando com IA Gratuita...' : 'Processando com DALL-E...'}</>
            ) : (
              imageProvider === 'free' ? '✨ Gerar Imagem (Gratuito)' : '✨ Gerar Imagem Real (1 Crédito)'
            )}
          </button>
          
          {error && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, fontSize: 13, color: 'var(--red)' }}>
              {error}
            </div>
          )}
        </div>

        {/* RESULT SECTION */}
        <div>
          <div className="card" style={{ minHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="input-label" style={{ margin: 0 }}>Resultado Final</div>
              {result && (
                <a href={result} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" download="imagem-produto.png">
                  📥 Baixar Alta Resolução
                </a>
              )}
            </div>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', borderRadius: 16, border: '1px dashed var(--border2)', overflow: 'hidden', position: 'relative' }}>
              {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px', borderTopColor: 'var(--glow)' }}></div>
                  <div style={{ fontSize: 14 }}>Desenhando imagem com IA...</div>
                </div>
              ) : result ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src={result} alt="Imagem de Produto gerada" style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: 380 }} />
                  {warning && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.85)', padding: 12, fontSize: 12, color: 'var(--gold)', textAlign: 'center' }}>
                      💡 {warning}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--faint)', fontSize: 14 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
                  Sua imagem aparecerá aqui
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
