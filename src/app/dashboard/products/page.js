'use client';
import { useState, useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Import by link
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  // Manual form
  const [showManual, setShowManual] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    name: '',
    niche: 'Geral',
    url: '',
    description: '',
    image: ''
  });

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
      if (res.ok) setProducts(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ========= IMPORT FROM LINK =========
  const handleImportFromLink = async (e) => {
    e.preventDefault();
    if (!importUrl.trim() || !user) return;
    setImporting(true);
    setImportError('');

    try {
      // 1. Scrape product data
      const scrapeRes = await fetch('/api/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl }),
      });
      const scraped = await scrapeRes.json();
      if (!scrapeRes.ok) throw new Error(scraped.error || 'Falha ao importar');

      // 2. Save directly to the database
      const saveRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scraped.title,
          niche: scraped.niche,
          url: scraped.sourceUrl,
          description: scraped.description,
          image: scraped.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&auto=format&fit=crop',
          price: scraped.price || '',
          images: scraped.images || [],
          userId: user.id
        }),
      });

      if (saveRes.ok) {
        const newProd = await saveRes.json();
        setProducts(prev => [newProd, ...prev]);
        setImportUrl('');
      } else {
        const saveData = await saveRes.json();
        throw new Error(saveData.error || 'Falha ao salvar');
      }
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImporting(false);
    }
  };

  // ========= MANUAL ADD =========
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm(f => ({ ...f, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !user) return;
    setAdding(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userId: user.id }),
      });
      if (res.ok) {
        const np = await res.json();
        setProducts(prev => [np, ...prev]);
        setForm({ name: '', niche: 'Geral', url: '', description: '', image: '' });
        setShowManual(false);
      }
    } catch (err) { console.error(err); }
    finally { setAdding(false); }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Inventário de Produtos</h1>
          <p className="page-subtitle">Importe produtos pelo link do TikTok Shop, Shopee, Amazon ou cadastre manualmente.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowManual(!showManual)}>
          {showManual ? '✕ Fechar' : '＋ Cadastrar manualmente'}
        </button>
      </div>

      {/* ===== IMPORT BY LINK (HERO CARD) ===== */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(109,40,217,0.03))', borderColor: 'rgba(124,58,237,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 22 }}>🔗</span>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Importar Produto pelo Link</h2>
            <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>Cole o link direto do produto no TikTok Shop, Shopee, Amazon ou qualquer loja online.</p>
          </div>
        </div>

        <form onSubmit={handleImportFromLink} style={{ display: 'flex', gap: 12 }}>
          <input
            className="input"
            placeholder="https://www.tiktok.com/shop/product/..."
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            style={{ flex: 1 }}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={importing || !importUrl.trim()}>
            {importing ? (
              <><span className="spinner" style={{ width: 14, height: 14 }}></span> Importando...</>
            ) : (
              '📦 Importar Produto'
            )}
          </button>
        </form>

        {importError && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, fontSize: 13, color: 'var(--red)' }}>
            ⚠️ {importError}
          </div>
        )}

        <div style={{ marginTop: 12, display: 'flex', gap: 20, fontSize: 11.5, color: 'var(--faint)' }}>
          <span>✓ TikTok Shop</span>
          <span>✓ Shopee</span>
          <span>✓ Amazon</span>
          <span>✓ Mercado Livre</span>
          <span>✓ Qualquer loja online</span>
        </div>
      </div>

      {/* ===== MANUAL FORM (COLLAPSIBLE) ===== */}
      {showManual && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Cadastro Manual</h2>
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Nome do Produto</label>
                <input className="input" placeholder="Ex: Smartwatch FitPro 5" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Nicho</label>
                <select className="input" value={form.niche} onChange={e => setForm({...form, niche: e.target.value})}>
                  <option value="Geral">Geral</option>
                  <option value="Beleza/Skincare">Beleza / Skincare</option>
                  <option value="Moda">Moda</option>
                  <option value="Eletrônicos">Eletrônicos</option>
                  <option value="Casa">Casa</option>
                  <option value="Fitness">Fitness</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Descrição para a IA</label>
              <textarea className="input" placeholder="Descreva detalhes como benefícios, público-alvo..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ minHeight: 60 }} />
            </div>
            <div className="input-group">
              <label className="input-label">Foto do Produto (Upload)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: 12, color: 'var(--muted)' }} />
              {form.image && (
                <div style={{ marginTop: 8, height: 60, width: 60, border: '1px solid var(--border2)', borderRadius: 8, overflow: 'hidden' }}>
                  <img src={form.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary" disabled={adding}>
              {adding ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </form>
        </div>
      )}

      {/* ===== PRODUCTS GRID ===== */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <span className="spinner" style={{ margin: '0 auto' }}></span>
        </div>
      ) : products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 64, color: 'var(--muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>Nenhum produto cadastrado</div>
          <div style={{ maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
            Cole o link de um produto do TikTok Shop acima para importar automaticamente — com nome, foto e descrição prontos para usar.
          </div>
        </div>
      ) : (
        <div className="grid-3">
          {products.map(p => (
            <div key={p.id} className="card card-glow" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
              {/* Product Image */}
              <div style={{ height: 180, background: 'var(--raised)', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={p.image}
                  alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'; }}
                />
                <div style={{ position: 'absolute', top: 10, left: 10 }}>
                  <span className="badge badge-violet">{p.niche}</span>
                </div>
                {p.price && (
                  <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 8, fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>
                    R$ {p.price}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: '16px 20px', flex: 1 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</h3>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5, marginBottom: 12 }}>
                  {p.description || 'Sem descrição.'}
                </p>
                {p.url && (
                  <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--glow)', fontWeight: 600 }}>
                    Ver na loja ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
