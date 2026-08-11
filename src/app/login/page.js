'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao fazer login');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(60% 60% at 50% -10%, rgba(124,58,237,0.25), transparent 60%)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(139,147,172,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,147,172,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }}></div>

      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px', position: 'relative', zIndex: 1 }}>
        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 22, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 10px 24px -6px rgba(124,58,237,0.7)' }}>✦</div>
            Millionais<span style={{ color: 'var(--glow)' }}>.AI</span>
          </Link>
          <p style={{ color: 'var(--muted)', fontSize: 14.5, marginTop: 12 }}>Acesse sua plataforma de criação com IA</p>
        </div>

        {/* CARD */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border2)', borderRadius: 24, padding: 36 }}>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Entrar</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>Bem-vindo de volta!</p>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13.5, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="input-group">
              <label className="input-label">E-mail</label>
              <input className="input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Senha</label>
              <input className="input" type="password" placeholder="Sua senha" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: 4 }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }}></span> Entrando...</> : 'Entrar →'}
            </button>
          </form>

          <div className="divider" style={{ margin: '24px 0' }}></div>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
            Não tem conta?{' '}
            <Link href="/signup" style={{ color: 'var(--glow)', fontWeight: 600 }}>Criar conta</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12.5, color: 'var(--faint)' }}>
          <Link href="/">← Voltar para o início</Link>
        </p>
      </div>
    </div>
  );
}
