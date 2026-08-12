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
  const [presetType, setPresetType] = useState('fullbody');
  const [appearanceStyle, setAppearanceStyle] = useState('auto');
  
  // Tab 2: Upload File & Virtual Try On
  const [uploadBase64, setUploadBase64] = useState('');
  const [useVirtualTryOn, setUseVirtualTryOn] = useState(false);
  const [vtonProductId, setVtonProductId] = useState('');
  
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

  // ── Appearance presets (beauty standards commonly used in UGC/fashion) ──
  const APPEARANCE_PRESETS = [
    { id: 'auto', label: '🎲 Aleatório (Padrão)', descriptions: [
      'beautiful young woman, light skin, long brown hair, subtle makeup, warm smile',
      'attractive young woman, olive skin, dark wavy hair, natural makeup, confident expression',
      'stunning young woman, tan skin, straight black hair, elegant look, soft smile',
      'gorgeous young woman, fair skin, blonde highlights, light makeup, friendly expression',
      'beautiful young woman, medium skin, auburn curly hair, glowing skin, bright smile',
    ]},
    { id: 'latina', label: '🌺 Latina', descriptions: [
      'beautiful young latina woman, tan skin, long dark wavy hair, natural makeup, warm radiant smile',
      'attractive latina model, olive skin, brown eyes, dark flowing hair, confident elegant pose',
    ]},
    { id: 'european', label: '🌸 Europeia', descriptions: [
      'beautiful young european woman, fair skin, light brown hair, blue eyes, subtle elegant makeup, soft smile',
      'stunning european model, porcelain skin, blonde hair, green eyes, natural beauty, gentle expression',
    ]},
    { id: 'african', label: '✨ Africana', descriptions: [
      'beautiful young black woman, dark skin, natural curly hair, glowing complexion, radiant confident smile',
      'stunning african model, rich dark skin, short natural hair, bold elegant look, warm expression',
    ]},
    { id: 'asian', label: '🌷 Asiática', descriptions: [
      'beautiful young asian woman, fair skin, straight black hair, minimal makeup, graceful soft smile',
      'attractive asian model, light skin, dark silky hair, elegant natural beauty, serene expression',
    ]},
    { id: 'masculine', label: '🧔 Masculino', descriptions: [
      'handsome young man, medium skin, short dark hair, well-groomed, confident charming smile',
      'attractive male model, light skin, styled brown hair, clean shaven, professional look',
    ]},
  ];

  const generateFashionPrompt = () => {
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;
    setError('');

    // Pick appearance
    const preset = APPEARANCE_PRESETS.find(a => a.id === appearanceStyle) || APPEARANCE_PRESETS[0];
    const descriptions = preset.descriptions;
    const appearance = descriptions[Math.floor(Math.random() * descriptions.length)];

    // Build product description
    const productDesc = prod.name || 'stylish clothing piece';

    // Framing
    let framing = '';
    if (presetType === 'headshot') {
      framing = 'close-up headshot portrait, shoulders visible';
    } else if (presetType === 'mediumshot') {
      framing = 'medium shot from waist up, showcasing the outfit and styling';
    } else {
      framing = 'full body shot, showing the complete outfit from head to toe, natural standing pose';
    }

    // Randomize pose and setting
    const poses = [
      'posing naturally', 'standing with one hand on hip', 'walking confidently',
      'slight turn showing the outfit details', 'casual relaxed pose', 'elegant standing pose'
    ];
    const settings = [
      'modern minimalist studio with soft lighting', 'clean white studio background',
      'urban lifestyle setting with blurred city background', 'bright airy studio with natural window light',
      'neutral beige studio with warm soft lighting'
    ];
    const pose = poses[Math.floor(Math.random() * poses.length)];
    const setting = settings[Math.floor(Math.random() * settings.length)];

    const generatedPrompt = `${appearance}, wearing ${productDesc}, ${pose}, ${framing}, ${setting}, professional fashion photography, realistic, high quality, 8k, sharp focus`;

    setPrompt(generatedPrompt);
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
        if (!prompt.trim()) throw new Error('Clique em "🪄 Criar Prompt" ou descreva a aparência manualmente.');

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
        
        if (useVirtualTryOn && vtonProductId) {
          const prod = products.find(p => p.id === vtonProductId);
          if (!prod) throw new Error('Produto selecionado não encontrado.');
          
          const vtonRes = await fetch('/api/ai/virtual-try-on', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              imageBase64: uploadBase64, 
              productDesc: prod.name + (prod.description ? ' - ' + prod.description : '') 
            }),
          });
          
          const vtonData = await vtonRes.json();
          if (!vtonRes.ok) throw new Error(vtonData.error || 'Falha ao processar Provador Virtual');
          finalImageUrl = vtonData.url;
        } else {
          finalImageUrl = uploadBase64;
        }

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

  const handleDeleteAvatar = async (avatarId) => {
    if (!user) return;
    if (!window.confirm('Tem certeza que deseja excluir este avatar?')) return;
    
    try {
      const res = await fetch('/api/avatars', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: avatarId, userId: user.id })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao excluir avatar');
      }
      
      // Update local state
      setAvatars(prev => prev.filter(av => av.id !== avatarId));
    } catch (err) {
      alert(err.message);
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
                {/* Appearance Style Preset */}
                <div className="input-group">
                  <label className="input-label">Aparência da Modelo</label>
                  <select 
                    className="input" 
                    value={appearanceStyle} 
                    onChange={e => setAppearanceStyle(e.target.value)}
                  >
                    {APPEARANCE_PRESETS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                </div>

                {/* Framing Preset */}
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

                {/* Product-based prompt generator */}
                {products.length > 0 && (
                  <div className="input-group">
                    <label className="input-label">👗 Produto para Exibir (Opcional)</label>
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
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        🪄 Criar Prompt
                      </button>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                      Gera automaticamente um prompt profissional de moda com base no produto, aparência e enquadramento.
                    </span>
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Prompt Final (editável)</label>
                  <textarea 
                    className="input" 
                    placeholder="Clique em 'Criar Prompt' acima ou descreva manualmente..." 
                    value={prompt} 
                    onChange={e => setPrompt(e.target.value)}
                    style={{ minHeight: 100 }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                    Dica: Descreva em inglês para obter imagens melhores e mais realistas. O prompt acima é 100% editável.
                  </span>
                </div>
              </>
            )}

            {/* TAB 2: UPLOAD IMAGE & VIRTUAL TRY ON */}
            {activeTab === 'upload' && (
              <>
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

                {uploadBase64 && products.length > 0 && (
                  <div className="card" style={{ background: 'var(--raised)', padding: 12, marginBottom: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={useVirtualTryOn} 
                        onChange={e => {
                          setUseVirtualTryOn(e.target.checked);
                          if (e.target.checked && !vtonProductId) setVtonProductId(products[0].id);
                        }}
                      />
                      ✨ Usar Provador Virtual (IA Grátis)
                    </label>
                    
                    {useVirtualTryOn && (
                      <div style={{ marginTop: 12 }}>
                        <label className="input-label" style={{ fontSize: 11 }}>Selecione o produto para vestir na foto:</label>
                        <select 
                          className="input" 
                          value={vtonProductId} 
                          onChange={e => setVtonProductId(e.target.value)}
                        >
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <span style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                          A IA vai analisar a pessoa na foto e gerar um novo avatar com a mesma aparência vestindo este produto.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
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
                <div key={av.id} className="card" style={{ position: 'relative', textAlign: 'center', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {!av.isDefault && (
                    <button
                      onClick={() => handleDeleteAvatar(av.id)}
                      style={{
                        position: 'absolute', top: 12, right: 12,
                        background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)',
                        border: 'none', borderRadius: '50%', width: 28, height: 28,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: '0.2s'
                      }}
                      title="Excluir avatar"
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                      🗑️
                    </button>
                  )}
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
