'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const QUICK_ACTIONS = [
  { href: '/dashboard/images', icon: '🖼️', title: 'Gerar Imagem de Produto', desc: 'Fotos realistas com GPT-Image e Gemini', color: '#8B5CF6' },
  { href: '/dashboard/videos', icon: '🎬', title: 'Criar Vídeo UGC', desc: 'Avatar IA com voz e movimento', color: '#06B6D4' },
  { href: '/dashboard/agents', icon: '🤖', title: 'Agente de Conversão', desc: 'Escreve prompts que vendem', color: '#F59E0B' },
  { href: '/dashboard/guru', icon: '🔥', title: 'Analisar Viral', desc: 'Destrinche por que viralizou', color: '#EF4444' },
  { href: '/dashboard/voice', icon: '🎙️', title: 'Gerar Narração', desc: 'Voz IA para seus vídeos', color: '#10B981' },
  { href: '/dashboard/prompts', icon: '📚', title: 'Biblioteca de Prompts', desc: 'Prompts validados por nicho', color: '#A78BFA' },
];

const TOOLS = [
  { href: '/dashboard/upscale', icon: '🔮', title: 'Upscale 4K', desc: 'Melhore qualidade de imagens' },
  { href: '/dashboard/captions', icon: '📝', title: 'Legendas Automáticas', desc: 'Transcrição e SRT/VTT' },
  { href: '/dashboard/accounts', icon: '📊', title: 'Gestão de Contas', desc: 'Dashboard financeiro' },
  { href: '/dashboard/settings', icon: '⚙️', title: 'Configurações', desc: 'API keys e preferências' },
];

export default function DashboardHome() {
  const [user, setUser] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const greeting = time.getHours() < 12 ? 'Bom dia' : time.getHours() < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div>
      {/* HERO HEADER */}
      <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(109,40,217,0.05))', borderBottom: '1px solid var(--border)', padding: '40px 32px 36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
            {time.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            {greeting}, {user?.name?.split(' ')[0] || 'usuário'}! 👋
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>Pronto para criar conteúdo com IA hoje?</p>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        {/* STATS */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { label: 'Gerações hoje', value: '0', icon: '⚡', color: 'var(--violet2)' },
            { label: 'Este mês', value: '0', icon: '📈', color: 'var(--green)' },
            { label: 'Prompts salvos', value: '0', icon: '📚', color: 'var(--gold)' },
            { label: 'Contas ativas', value: '0', icon: '📊', color: 'var(--ember)' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--raised)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>⚡</span> Ações rápidas
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {QUICK_ACTIONS.map((a, i) => (
              <Link key={i} href={a.href} style={{ textDecoration: 'none', display: 'block' }}>
                <div className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14, padding: 20, transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = a.color + '60'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: a.color + '20', border: `1px solid ${a.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{a.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>{a.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* MORE TOOLS */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>🛠️</span> Mais ferramentas
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {TOOLS.map((t, i) => (
              <Link key={i} href={t.href} style={{ textDecoration: 'none' }}>
                <div className="card card-glow" style={{ textAlign: 'center', padding: 20, cursor: 'pointer' }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{t.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 5 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* TIPS */}
        <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(109,40,217,0.06))', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 20, padding: 24, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 28, flexShrink: 0 }}>💡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--glow)' }}>Dica do dia</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65 }}>
              Use o <b style={{ color: 'var(--text)' }}>Agente de Conversão</b> para gerar prompts otimizados antes de criar qualquer conteúdo. 
              Basta descrever seu produto e o agente escreve um prompt que já inclui o estilo, iluminação, modelo e contexto ideal para conversão.
            </div>
            <Link href="/dashboard/agents" className="btn btn-secondary btn-sm" style={{ marginTop: 14, display: 'inline-flex' }}>
              🤖 Abrir agente
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
