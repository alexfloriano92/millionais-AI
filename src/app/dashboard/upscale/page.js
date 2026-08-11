'use client';
import { useState, useRef } from 'react';

export default function UpscalePage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(URL.createObjectURL(droppedFile));
      setResult(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(URL.createObjectURL(selectedFile));
      setResult(false);
    }
  };

  const processUpscale = () => {
    if (!file) return;
    setLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      setLoading(false);
      setResult(true);
      setSliderPos(50);
    }, 2500);
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Upscale 4K</h1>
        <p className="page-subtitle">Melhore a qualidade e a resolução de qualquer imagem em segundos usando IA.</p>
      </div>

      <div className="grid-2">
        {/* INPUT SECTION */}
        <div className="card">
          <div className="input-group" style={{ marginBottom: 24 }}>
            <label className="input-label">Imagem Original</label>
            
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileSelect}
            />
            
            <div 
              className="drop-zone"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove('drag-over'); }}
              onDrop={(e) => { e.currentTarget.classList.remove('drag-over'); handleDrop(e); }}
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div style={{ position: 'relative', width: '100%', height: 200 }}>
                  <img src={file} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 0.2s', ':hover': { opacity: 1 } }}>
                    <span className="btn btn-secondary btn-sm">Trocar imagem</span>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📤</div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>Clique ou arraste uma imagem aqui</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>PNG, JPG ou WEBP (Max 5MB)</div>
                </>
              )}
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', background: 'linear-gradient(135deg, #A78BFA, #8B5CF6)' }}
            onClick={processUpscale}
            disabled={loading || !file}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16 }}></span> Melhorando imagem...</>
            ) : (
              '🔮 Fazer Upscale 4K (1 Crédito)'
            )}
          </button>
        </div>

        {/* RESULT SECTION */}
        <div>
          <div className="card" style={{ height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="input-label" style={{ margin: 0 }}>Resultado (Comparação)</div>
              {result && (
                <button className="btn btn-secondary btn-sm">📥 Baixar 4K</button>
              )}
            </div>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', borderRadius: 16, border: '1px dashed var(--border2)', overflow: 'hidden' }}>
              {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px', borderTopColor: 'var(--glow)' }}></div>
                  <div style={{ fontSize: 14 }}>Redesenhando pixels e removendo ruído...</div>
                </div>
              ) : result && file ? (
                <div className="compare-wrapper" style={{ width: '100%', height: '100%', position: 'relative' }}>
                  {/* Original Image (Background) */}
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${file})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', filter: 'blur(2px) contrast(0.8)' }}></div>
                  
                  {/* Upscaled Image (Foreground, clipped) */}
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${file})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}></div>
                  
                  {/* Slider Control */}
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'col-resize' }}
                  />
                  
                  {/* Visual Slider Line */}
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sliderPos}%`, width: 2, background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.5)', pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '2px solid var(--violet)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 2, height: 12, background: 'var(--violet)' }}></div>
                    </div>
                  </div>
                  
                  {/* Labels */}
                  <div className="compare-label" style={{ left: 16 }}>ANTES</div>
                  <div className="compare-label" style={{ right: 16 }}>DEPOIS (4K)</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--faint)', fontSize: 14 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
                  Sua imagem em 4K aparecerá aqui
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
