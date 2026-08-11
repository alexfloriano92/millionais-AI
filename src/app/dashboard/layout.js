'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  { group: 'Principal', items: [
    { href: '/dashboard', icon: '🏠', label: 'Início' },
  ]},
  { group: 'Estúdio / Criar', items: [
    { href: '/dashboard/videos', icon: '🎬', label: 'Vídeos UGC (Direção)' },
    { href: '/dashboard/images', icon: '🖼️', label: 'Imagens de Produto' },
    { href: '/dashboard/upscale', icon: '🔮', label: 'Upscale 4K' },
    { href: '/dashboard/voice', icon: '🎙️', label: 'Voz & Narração' },
    { href: '/dashboard/captions', icon: '📝', label: 'Legendas Auto' },
  ]},
  { group: 'Ativos', items: [
    { href: '/dashboard/elenco', icon: '👥', label: 'Meu Elenco (Avatares)' },
    { href: '/dashboard/products', icon: '📦', label: 'Inventário de Produtos' },
  ]},
  { group: 'Inteligência', items: [
    { href: '/dashboard/prompts', icon: '📚', label: 'Biblioteca de Prompts' },
    { href: '/dashboard/agents', icon: '🤖', label: 'Agentes de Conversão' },
    { href: '/dashboard/guru', icon: '🔥', label: 'GURU — Virais', badge: 'Novo' },
  ]},
  { group: 'Negócio', items: [
    { href: '/dashboard/accounts', icon: '📊', label: 'Gestão de Contas' },
    { href: '/dashboard/settings', icon: '⚙️', label: 'Configurações' },
  ]},
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { router.push('/login'); return; }
    if (userData) setUser(JSON.parse(userData));
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* OVERLAY mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49, display: 'none' }} className="sidebar-overlay"></div>
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* LOGO */}
        <div className="sidebar-logo">
          <div className="logo-icon">✦</div>
          <span>Millionais<span style={{ color: 'var(--glow)' }}>.AI</span></span>
        </div>

        {/* NAV */}
        {NAV.map((group) => (
          <div key={group.group} className="sidebar-section">
            <div className="sidebar-section-label">{group.group}</div>
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && <span className="sidebar-badge badge badge-violet">{item.badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}

        {/* FOOTER */}
        <div className="sidebar-footer">
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '10px 12px', background: 'var(--raised)', borderRadius: 12, border: '1px solid var(--border2)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ fontSize: 11, color: 'var(--faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="sidebar-link" style={{ color: 'var(--red)', width: '100%' }}>
            <span>🚪</span> Sair
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content" style={{ flex: 1 }}>
        {/* TOP BAR (mobile) */}
        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', position: 'sticky', top: 0, zIndex: 45 }} className="mobile-topbar">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>☰</button>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16 }}>Millionais<span style={{ color: 'var(--glow)' }}>.AI</span></span>
          <div style={{ width: 32 }}></div>
        </div>

        <style>{`
          @media(max-width:900px) {
            .sidebar { transform: translateX(-100%); }
            .sidebar.open { transform: translateX(0); }
            .mobile-topbar { display: flex !important; }
            .main-content { margin-left: 0 !important; }
          }
        `}</style>

        {children}
      </main>
    </div>
  );
}
