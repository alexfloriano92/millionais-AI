'use client';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle">Gerencie suas chaves de API, conta e preferências do sistema.</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* PROFILE */}
          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Perfil</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff' }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 18 }}>{user?.name || 'Usuário'}</div>
                <div style={{ color: 'var(--muted)', fontSize: 14 }}>{user?.email || 'email@exemplo.com'}</div>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm">Editar Perfil</button>
          </div>

          {/* API KEYS */}
          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Chaves de API</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Para usar a plataforma gratuitamente sem limites, você pode configurar suas próprias chaves de API. Se deixadas em branco, os créditos da plataforma serão usados.
            </p>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>OpenAI API Key (Para DALL-E)</span>
                  <a href="#" style={{ color: 'var(--glow)', fontWeight: 500 }}>Obter chave</a>
                </label>
                <input className="input" type="password" placeholder="sk-..." defaultValue="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx" />
              </div>
              
              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Gemini API Key (Para Agentes/GURU)</span>
                  <a href="#" style={{ color: 'var(--blue)', fontWeight: 500 }}>Obter chave</a>
                </label>
                <input className="input" type="password" placeholder="AIzaSy..." defaultValue="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxx" />
              </div>

              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>ElevenLabs API Key (Para Voz)</span>
                  <a href="#" style={{ color: 'var(--green)', fontWeight: 500 }}>Obter chave</a>
                </label>
                <input className="input" type="password" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              </div>

              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Fal.ai API Key (Para Provador Virtual)</span>
                  <a href="https://fal.ai/dashboard/keys" target="_blank" rel="noopener noreferrer" style={{ color: '#F472B6', fontWeight: 500 }}>Obter chave</a>
                </label>
                <input className="input" type="password" placeholder="Key xxxxxxxx-xxxx..." />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 20, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
                {saved && <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>✅ Configurações salvas!</span>}
                <button type="submit" className="btn btn-primary">Salvar Configurações</button>
              </div>
            </form>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* PLAN */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), transparent)', borderColor: 'rgba(124,58,237,0.3)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--glow)' }}>Plano Atual</h2>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Uso Pessoal PRO</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Você tem acesso a todas as ferramentas usando suas próprias chaves de API.</p>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                <span>Créditos da Plataforma</span>
                <span className="grad">14 / 50 usados</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '28%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
