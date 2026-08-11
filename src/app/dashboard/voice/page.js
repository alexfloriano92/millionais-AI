'use client';
import { useState, useRef } from 'react';

const OPENAI_VOICES = [
  { id: 'nova', name: 'Nova (Jovem)', type: 'Feminina' },
  { id: 'alloy', name: 'Alloy (Neutra)', type: 'Unissex' },
  { id: 'echo', name: 'Echo (Grave)', type: 'Masculina' },
  { id: 'shimmer', name: 'Shimmer (Profissional)', type: 'Feminina' },
  { id: 'onyx', name: 'Onyx (Autoritária)', type: 'Masculina' },
  { id: 'fable', name: 'Fable (Narrativa)', type: 'Masculina' },
];

const GOOGLE_VOICES = [
  { id: 'pt-BR', name: 'Português BR (Natural)', type: 'Neural' },
];

export default function VoicePage() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('pt-BR');
  const [provider, setProvider] = useState('google');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const generateVoice = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setLoading(true);
    setError('');
    setAudioUrl(null);
    setAudioBlob(null);

    try {
      const res = await fetch('/api/ai/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, provider }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erro ao gerar áudio');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const downloadAudio = (format) => {
    if (!audioBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(audioBlob);
    a.download = `narracao-millionais.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const voices = provider === 'google' ? GOOGLE_VOICES : OPENAI_VOICES;

  return (
    <div className="page-body">
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Voz & Narração IA</h1>
        <p className="page-subtitle">Transforme texto em áudio realista de alta qualidade para narrar seus vídeos.</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <form onSubmit={generateVoice}>
            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">Texto da Narração</label>
              <textarea 
                className="input" 
                placeholder="Insira o texto que você quer transformar em áudio..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ minHeight: 200 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                <span>{text.length} caracteres</span>
                <span>Estimativa: {Math.ceil(text.length / 15)} segundos</span>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">Motor de Voz</label>
              <select className="input" value={provider} onChange={(e) => { setProvider(e.target.value); if (e.target.value === 'google') setVoice('pt-BR'); else setVoice('nova'); }}>
                <option value="google">🆓 Google TTS (Gratuito - Sem Limites)</option>
                <option value="openai">💎 OpenAI TTS (Premium - Requer Créditos)</option>
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: 24 }}>
              <label className="input-label">Voz</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                {voices.map(v => (
                  <div 
                    key={v.id}
                    onClick={() => setVoice(v.id)}
                    style={{ 
                      padding: '12px 16px', 
                      background: 'var(--raised)', 
                      border: `2px solid ${voice === v.id ? 'var(--green)' : 'var(--border2)'}`, 
                      borderRadius: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: 20 }}>{v.type === 'Feminina' ? '👩🏽' : v.type === 'Neural' ? '🤖' : '👨🏻'}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{v.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{v.type}</div>
                      </div>
                    </div>
                    {voice === v.id && (
                      <div style={{ color: 'var(--green)', fontSize: 18 }}>✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              className="btn" 
              style={{ width: '100%', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff' }}
              disabled={loading || !text.trim()}
            >
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16 }}></span> Sintetizando áudio...</>
              ) : (
                provider === 'google' ? '🎙️ Gerar Áudio (Gratuito)' : '🎙️ Gerar Áudio (1 Crédito)'
              )}
            </button>

            {error && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, fontSize: 13, color: 'var(--red)' }}>
                ⚠️ {error}
              </div>
            )}
          </form>
        </div>

        <div>
          <div className="card" style={{ height: '100%', minHeight: 300, display: 'flex', flexDirection: 'column' }}>
            <div className="input-label" style={{ marginBottom: 16 }}>Resultado</div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', borderRadius: 16, border: '1px dashed var(--border2)', padding: 24 }}>
              {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px', borderTopColor: 'var(--green)' }}></div>
                  <div style={{ fontSize: 14 }}>Processando com {provider === 'google' ? 'Google TTS' : 'Engine Neural'}...</div>
                </div>
              ) : audioUrl ? (
                <div style={{ width: '100%' }}>
                  {/* Hidden audio element */}
                  <audio 
                    ref={audioRef} 
                    src={audioUrl} 
                    onEnded={() => setIsPlaying(false)}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    style={{ display: 'none' }}
                  />

                  <div className="audio-player" style={{ marginBottom: 24 }}>
                    <button 
                      type="button"
                      className="btn-icon" 
                      style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '50%', width: 48, height: 48, fontSize: 20, cursor: 'pointer', flexShrink: 0 }}
                      onClick={togglePlayback}
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div className="waveform">
                        {[...Array(30)].map((_, i) => (
                          <div key={i} className="wave-bar" style={{ animationDelay: `${Math.random()}s`, background: 'var(--green)', animationPlayState: isPlaying ? 'running' : 'paused' }}></div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                        <span>0:00</span>
                        <span>~{Math.ceil(text.length / 15)}s</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => downloadAudio('mp3')}>📥 Baixar MP3</button>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => downloadAudio('wav')}>📥 Baixar WAV</button>
                  </div>

                  <div style={{ marginTop: 16, padding: '8px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--green)', textAlign: 'center' }}>
                    ✅ Áudio gerado com sucesso via {provider === 'google' ? 'Google TTS (Gratuito)' : 'OpenAI TTS'}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--faint)', fontSize: 14 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
                  Seu áudio aparecerá aqui
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
