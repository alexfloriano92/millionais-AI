'use client';
import { useState, useRef } from 'react';

export default function CaptionsPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type.startsWith('video/') || droppedFile.type.startsWith('audio/'))) {
      setFile(droppedFile.name);
      setResult(null);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile.name);
      setResult(null);
    }
  };

  const processCaptions = () => {
    if (!file) return;
    setLoading(true);
    
    // Simulate speech-to-text processing
    setTimeout(() => {
      setLoading(false);
      setResult(`1\n00:00:00,000 --> 00:00:02,500\nNeste vídeo eu vou te mostrar\n\n2\n00:00:02,500 --> 00:00:05,000\ncomo criar conteúdo viral\n\n3\n00:00:05,000 --> 00:00:08,200\nusando apenas inteligência artificial.`);
    }, 3000);
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Legendas Automáticas</h1>
        <p className="page-subtitle">Transcreva vídeos ou áudios e exporte em SRT ou VTT com sincronização perfeita.</p>
      </div>

      <div className="grid-2">
        {/* INPUT SECTION */}
        <div className="card">
          <div className="input-group" style={{ marginBottom: 24 }}>
            <label className="input-label">Arquivo de Mídia</label>
            
            <input 
              type="file" 
              accept="video/*,audio/*" 
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
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🎥</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', wordBreak: 'break-all' }}>{file}</div>
                  <div style={{ fontSize: 13, color: 'var(--green)', marginTop: 8 }}>Pronto para processar</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📤</div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>Clique ou arraste um vídeo/áudio</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>MP4, MOV ou MP3 (Max 50MB)</div>
                </>
              )}
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}
            onClick={processCaptions}
            disabled={loading || !file}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16 }}></span> Transcrevendo áudio...</>
            ) : (
              '📝 Gerar Legendas (1 Crédito)'
            )}
          </button>
        </div>

        {/* RESULT SECTION */}
        <div>
          <div className="card" style={{ height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="input-label" style={{ margin: 0 }}>Transcrição Gerada</div>
              {result && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm">SRT</button>
                  <button className="btn btn-secondary btn-sm">VTT</button>
                </div>
              )}
            </div>
            
            <div style={{ flex: 1, background: 'var(--raised)', borderRadius: 16, border: '1px solid var(--border2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {loading ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                  <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px', borderTopColor: 'var(--blue)' }}></div>
                  <div style={{ fontSize: 14 }}>Modelo Whisper analisando fala...</div>
                </div>
              ) : result ? (
                <textarea 
                  value={result} 
                  readOnly 
                  style={{ 
                    flex: 1, 
                    width: '100%', 
                    background: 'transparent', 
                    border: 'none', 
                    padding: 20, 
                    color: 'var(--text)', 
                    fontFamily: 'IBM Plex Mono, monospace', 
                    fontSize: 13, 
                    lineHeight: 1.6, 
                    resize: 'none',
                    outline: 'none'
                  }}
                />
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--faint)', fontSize: 14 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                  O texto com timestamps aparecerá aqui
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
