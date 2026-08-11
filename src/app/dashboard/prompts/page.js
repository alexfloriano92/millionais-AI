'use client';
import { useState } from 'react';

const CATEGORIES = ['Todos', 'Moda', 'Beleza/Skincare', 'Eletrônicos', 'Casa', 'Fitness'];

const PROMPTS = [
  { id: 1, cat: 'Beleza/Skincare', title: 'Close-up Textura de Creme', prompt: "Macro shot of white skincare cream texture, glowing soft morning light, hyperrealistic, 8k resolution, photorealistic, clean minimalist background, commercial photography --ar 16:9" },
  { id: 2, cat: 'Beleza/Skincare', title: 'Modelo Natural com Produto', prompt: "UGC style photo, young beautiful woman holding a skincare serum bottle next to her glowing face, natural sunlight, no makeup makeup look, shot on iPhone 14 Pro, realistic, unedited feel --ar 9:16" },
  { id: 3, cat: 'Eletrônicos', title: 'Gadget Futurista em Mesa', prompt: "Sleek wireless headphones resting on a dark walnut wooden desk, moody cinematic lighting, neon purple and blue subtle backglow, depth of field, 85mm lens, product photography --ar 16:9" },
  { id: 4, cat: 'Moda', title: 'Look Urbano Streetwear', prompt: "Street style photography, model wearing oversized vintage hoodie and cargo pants, walking down a neon-lit Tokyo street at night, dynamic pose, shot on 35mm film, grainy, cinematic --ar 9:16" },
  { id: 5, cat: 'Casa', title: 'Sala Aconchegante (Minimalista)', prompt: "Interior design photography, modern cozy living room, beige boucle sofa, warm sunlight casting shadows through blinds, neutral color palette, architectural digest style, hyperrealistic --ar 16:9" },
  { id: 6, cat: 'Fitness', title: 'Suplemento Pré-treino (Ação)', prompt: "Dynamic product shot, black pre-workout tub splashing into water, high speed photography, water droplets frozen in air, dramatic gym lighting, black background, commercial energy --ar 1:1" },
];

export default function PromptsPage() {
  const [activeCat, setActiveCat] = useState('Todos');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(null);

  const filteredPrompts = PROMPTS.filter(p => {
    const matchCat = activeCat === 'Todos' || p.cat === activeCat;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.prompt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Biblioteca de Prompts</h1>
        <p className="page-subtitle">Prompts validados e prontos para usar. Copie, cole no gerador de imagens e obtenha resultados profissionais.</p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <input 
          type="text" 
          className="input" 
          placeholder="🔍 Buscar prompt..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <div className="tabs">
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={`tab ${activeCat === cat ? 'active' : ''}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-3">
        {filteredPrompts.map(p => (
          <div key={p.id} className="prompt-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span className="badge badge-violet">{p.cat}</span>
              <button 
                className="copy-btn" 
                onClick={() => handleCopy(p.id, p.prompt)}
                style={{ borderColor: copied === p.id ? 'var(--green)' : '', color: copied === p.id ? 'var(--green)' : '' }}
              >
                {copied === p.id ? '✅ Copiado!' : '📋 Copiar'}
              </button>
            </div>
            
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{p.title}</h3>
            
            <div style={{ 
              background: 'var(--raised)', 
              padding: 12, 
              borderRadius: 12, 
              border: '1px solid var(--border2)', 
              fontSize: 13, 
              color: 'var(--muted)',
              fontFamily: 'IBM Plex Mono, monospace',
              flex: 1,
              overflowWrap: 'break-word'
            }}>
              {p.prompt}
            </div>
          </div>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Nenhum prompt encontrado</div>
          Tente ajustar sua busca ou categoria.
        </div>
      )}
    </div>
  );
}
