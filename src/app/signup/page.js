'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignup(e) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('As senhas não coincidem.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar conta');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(60% 60% at 50% -10%, rgba(124,58,237,0.25), transparent 60%)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(139,147,172,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,147,172,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }}></div>

      <div style={{ width: '100%', maxWidth: 440, padding: '0 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 22, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 10px 24px -6px rgba(124,58,237,0.7)' }}>✦</div>
            Millionais<span style={{ color: 'var(--glow)' }}>.AI</span>
          </Link>
          <p style={{ color: 'var(--muted)', fontSize: 14.5, marginTop: 12 }}>Crie sua conta gratuita</p>
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--border2)', borderRadius: 24, padding: 36 }}>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 28 }}>Criar conta</h1>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13.5, color: 'var(--red)' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Nome completo</label>
              <input className="input" type="text" placeholder="Seu nome" value={form.name} onChange={set('name')} required />
            </div>
            <div className="input-group">
              <label className="input-label">E-mail</label>
              <input className="input" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="input-group">
              <label className="input-label">Senha</label>
              <input className="input" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={set('password')} minLength={6} required />
            </div>
            <div className="input-group">
              <label className="input-label">Confirmar senha</label>
              <input className="input" type="password" placeholder="Repita a senha" value={form.confirm} onChange={set('confirm')} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14, marginTop: 8 }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }}></span> Criando conta...</> : 'Criar conta →'}
            </button>
          </form>

          <div className="divider"></div>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
            Já tem conta?{' '}
            <Link href="/login" style={{ color: 'var(--glow)', fontWeight: 600 }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
