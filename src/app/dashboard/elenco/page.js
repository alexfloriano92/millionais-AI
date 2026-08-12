'use client';
import { useState, useEffect } from 'react';

const DEFAULT_AVATARS = [
  { id: 'av1', name: 'Sofia', type: 'Feminino, 20s, Casual', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', isDefault: true },
  { id: 'av2', name: 'Lucas', type: 'Masculino, 20s, Creator', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop', isDefault: true },
  { id: 'av3', name: 'Marina', type: 'Feminino, 30s, Profissional', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop', isDefault: true },
  { id: 'av4', name: 'Pedro', type: 'Masculino, 30s, Especialista', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', isDefault: true },
];

export default function ElencoPage() {
  const [avatars, setAvatars] = useState(DEFAULT_AVATARS);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [activeTab, setActiveTab] = useState('ai'); // 'ai', 'upload', 'link'
  const [name, setName] = useState('');
  
  // Tab 1: AI Prompt
  const [prompt, setPrompt] = useState('');
  
  // UGC & Fashion model prompt generator states
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [presetType, setPresetType] = useState('headshot');
  const [promptGenerating, setPromptGenerating] = useState(false);
  
  // Tab 2: Upload File
  const [uploadBase64, setUploadBase64] = useState('');
  
  // Tab 3: Paste Link
  const [pastedLink, setPastedLink] = useState('');

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsedUser = JSON.parse(u);
      setUser(parsedUser);
      loadAvatars(parsedUser.id);
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
    } catch (e) { console.error(e); }
  };

  const generateFashionPrompt = async () => {
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;
    setPromptGenerating(true);
    setError('');

    const systemPrompt = `Você é um Engenheiro de Prompts especialista em geração de imagens de moda realista (DALL-E 3 / Flux).
Escreva um prompt em inglês altamente descritivo para gerar uma foto de uma modelo vestindo o seguinte produto:
Nome do produto: "${prod.name}"
Nicho: "${prod.niche}"
Descrição: "${prod.description}"

O prompt deve:
1. Descrever uma modelo profissional posando em estúdio ou cenário externo natural.
2. Descrever a modelo usando o produto de forma natural e realista, destacando os detalhes do tecido e estilo.
3. Ser em inglês.
4. Retornar APENAS o texto do prompt em inglês, sem aspas, explicações ou notas.`;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Gere o prompt de imagem.' }],
          systemInstruction: systemPrompt
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar prompt');
      setPrompt(data.text);
    } catch (err) {
      setError('Erro ao gerar prompt: ' + err.message);
    } finally {
      setPromptGenerating(false);
    }
  };

  const loadAvatars = async (userId) => {
    try {
      const res = await fetch(`/api/avatars?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const custom = data.filter(a => !a.isDefault);
        setAvatars([...DEFAULT_AVATARS, ...custom]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAvatar = async (e) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    setProcessing(true);
    setError('');

    let finalImageUrl = '';

    try {
      if (activeTab === 'ai') {
        if (!prompt.trim()) throw new Error('O prompt da IA é obrigatório.');

        // Determine the suffix based on presetType
        let suffix = '';
        if (presetType === 'headshot') {
          suffix = '. Close-up headshot portrait, looking directly at camera, professional photography, studio lighting, clean solid color background';
        } else if (presetType === 'fullbody') {
          suffix = '. Full body fashion model photography, showing the complete outfit and styling, looking at camera, realistic, studio lighting, clean solid color background';
        } else if (presetType === 'mediumshot') {
          suffix = '. Medium shot fashion modeling portrait, showcasing the clothes, looking at camera, realistic, studio lighting, clean solid color background';
        }

        // Call free AI generator route
        const genRes = await fetch('/api/ai/generate-free-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: `${prompt}${suffix}` }),
        });
        const genData = await genRes.json();
        if (!genRes.ok) throw new Error(genData.error || 'Falha ao gerar com IA Grátis');
        finalImageUrl = genData.url;

      } else if (activeTab === 'upload') {
        if (!uploadBase64) throw new Error('Escolha um arquivo de imagem para fazer upload.');
        finalImageUrl = uploadBase64;

      } else if (activeTab === 'link') {
        if (!pastedLink.trim()) throw new Error('Cole uma URL de imagem válida.');
        finalImageUrl = pastedLink;
      }

      // Save the avatar in the database
      const saveRes = await fetch('/api/avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          image: finalImageUrl,
          userId: user.id
        }),
      });

      if (!saveRes.ok) {
        const saveData = await saveRes.json();
        throw new Error(saveData.error || 'Erro ao salvar avatar');
      }

      const newAvatar = await saveRes.json();
      setAvatars(prev => [...prev, newAvatar]);
      
      // Reset Form
      setName('');
      setPrompt('');
      setUploadBase64('');
      setPastedLink('');

    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Meu Elenco (Avatares)</h1>
        <p className="page-subtitle">Gerencie e adicione rostos reais ou gerados por IA para o seu estúdio de vídeo.</p>
      </div>

      <div className="grid-3" style={{ alignItems: 'flex-start' }}>
        {/* AVATAR CREATION WIDGET */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Adicionar Apresentador</h2>
          
          {/* Tabs header */}
          <div className="tabs" style={{ width: '100%', marginBottom: 20 }}>
            <button 
              className={`tab ${activeTab === 'ai' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('ai'); setError(''); }}
              style={{ flex: 1, padding: '8px 4px', fontSize: 11.5 }}
            >
              🤖 IA Grátis
            </button>
            <button 
              className={`tab ${activeTab === 'upload' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('upload'); setError(''); }}
              style={{ flex: 1, padding: '8px 4px', fontSize: 11.5 }}
            >
              📤 Upload
            </button>
            <button 
              className={`tab ${activeTab === 'link' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('link'); setError(''); }}
              style={{ flex: 1, padding: '8px 4px', fontSize: 11.5 }}
            >
              🔗 Link URL
            </button>
          </div>

          <form onSubmit={handleCreateAvatar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Nome do Apresentador</label>
              <input 
                className="input" 
                placeholder="Ex: Julia" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>

            {/* TAB 1: AI GENERATION */}
            {activeTab === 'ai' && (
              <>
                {products.length > 0 && (
                  <div className="input-group">
                    <label className="input-label">💡 Assistente de Moda UGC (Opcional)</label>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <select 
                        className="input" 
                        value={selectedProductId} 
                        onChange={e => setSelectedProductId(e.target.value)}
                        style={{ flex: 1 }}
                      >
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm" 
                        onClick={generateFashionPrompt} 
                        disabled={promptGenerating}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {promptGenerating ? '...' : '🪄 Criar Prompt'}
                      </button>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                      Gera um prompt de modelo vestindo e exibindo o produto selecionado.
                    </span>
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Estilo de Enquadramento</label>
                  <select 
                    className="input" 
                    value={presetType} 
                    onChange={e => setPresetType(e.target.value)}
                  >
                    <option value="headshot">👤 Rosto (Close-up Headshot)</option>
                    <option value="mediumshot">🧍 Meio Corpo (Showcase de Roupa)</option>
                    <option value="fullbody">💃 Corpo Inteiro (Modelo de Moda)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Descreva a aparência física (ou use o assistente)</label>
                  <textarea 
                    className="input" 
                    placeholder="Ex: young smiling woman, light brown hair, wearing a white blazer, looking at camera..." 
                    value={prompt} 
                    onChange={e => setPrompt(e.target.value)}
                    style={{ minHeight: 100 }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                    Dica: Descreva em inglês para obter imagens melhores e mais realistas.
                  </span>
                </div>
              </>
            )}

            {/* TAB 2: UPLOAD IMAGE */}
            {activeTab === 'upload' && (
              <div className="input-group">
                <label className="input-label">Selecionar Foto</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  style={{ fontSize: 12, color: 'var(--muted)' }} 
                />
                {uploadBase64 && (
                  <div style={{ marginTop: 12, height: 100, width: 100, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border2)', alignSelf: 'center' }}>
                    <img src={uploadBase64} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: IMAGE LINK */}
            {activeTab === 'link' && (
              <div className="input-group">
                <label className="input-label">URL Direta da Imagem</label>
                <input 
                  className="input" 
                  placeholder="https://site.com/foto.jpg" 
                  value={pastedLink} 
                  onChange={e => setPastedLink(e.target.value)} 
                />
                {pastedLink && (
                  <div style={{ marginTop: 12, height: 100, width: 100, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border2)', alignSelf: 'center' }}>
                    <img 
                      src={pastedLink} 
                      alt="Link preview" 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'; }} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={processing || !name.trim()}>
              {processing ? (
                <><span className="spinner" style={{ width: 16, height: 16 }}></span> Criando Apresentador...</>
              ) : activeTab === 'ai' ? (
                '🤖 Gerar com IA Grátis'
              ) : (
                '💾 Salvar Apresentador'
              )}
            </button>

            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, fontSize: 13, color: 'var(--red)', wordBreak: 'break-all' }}>
                ⚠️ {error}
              </div>
            )}
          </form>
        </div>

        {/* LISTING MEU ELENCO */}
        <div style={{ gridColumn: 'span 2' }}>
          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <span className="spinner" style={{ margin: '0 auto' }}></span>
            </div>
          ) : (
            <div className="grid-3">
              {avatars.map(av => (
                <div key={av.id} className="card" style={{ textAlign: 'center', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 90, height: 90, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border2)', marginBottom: 12, background: 'var(--raised)' }}>
                    <img src={av.image} alt={av.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{av.name}</h3>
                  <span className="badge badge-violet" style={{ fontSize: 9 }}>
                    {av.isDefault ? 'Padrão da Plataforma' : 'Criado por Você'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
