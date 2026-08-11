'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

const FEATURES = [
  { icon: '🖼️', title: 'Imagens de Produto com IA', desc: 'Fotos realistas de produtos geradas por IA com GPT-Image e Gemini. Indistinguível de uma foto real de estúdio.' },
  { icon: '🎬', title: 'Vídeos UGC sem Câmera', desc: 'Avatares IA com voz, cena e movimento realistas em segundos. Nenhuma câmera necessária.' },
  { icon: '🔮', title: 'Upscale 4K', desc: 'Melhore qualquer imagem para 4K com IA. Antes/depois em segundos.' },
  { icon: '🎙️', title: 'Voz e Narração IA', desc: 'Narrações realistas em português para seus vídeos. Vozes masculinas e femininas.' },
  { icon: '📝', title: 'Legendas Automáticas', desc: 'Transcrição e legendagem automática com IA. Exporte em SRT ou VTT.' },
  { icon: '📚', title: 'Biblioteca de Prompts', desc: 'Prompts validados organizados por nicho e tipo de conteúdo. Copie, adapte e gere.' },
  { icon: '🤖', title: 'Agentes de Conversão', desc: 'IA especializada que escreve prompts otimizados para venda baseados no seu produto.' },
  { icon: '🔥', title: 'GURU — Analisador de Virais', desc: 'Cole um vídeo viral e o GURU destrincha por que funcionou e como replicar.' },
  { icon: '📊', title: 'Gestão de Contas', desc: 'Acompanhe faturamento e lucro de todas as suas contas em um painel só.' },
];

const STEPS = [
  { n: 1, title: 'Descreva ou escolha', desc: 'Diga o que quer criar, pegue um prompt validado da biblioteca ou deixe o agente escrever pra você.' },
  { n: 2, title: 'A IA cria por você', desc: 'Avatar, cena, movimento e voz — realistas, em segundos, sem câmera nem estúdio.' },
  { n: 3, title: 'Poste e acompanhe', desc: 'Exporte em alta resolução, publique e veja faturamento e lucro no painel.' },
];

export default function LandingPage() {
  const heroRef = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.rv').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .rv { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .rv.in { opacity: 1; transform: none; }
        .hero-badge .dot { animation: pulse 2s infinite; }
        .feat-card { background: var(--panel); border: 1px solid var(--border); border-radius: 20px; padding: 26px; transition: border-color 0.25s, transform 0.25s; }
        .feat-card:hover { border-color: var(--glow); transform: translateY(-4px); }
        .step-num { width: 54px; height: 54px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-family: Space Grotesk, sans-serif; font-weight: 700; font-size: 22px; color: #fff; background: linear-gradient(135deg, #8B5CF6, #6D28D9); box-shadow: 0 12px 30px -10px rgba(124,58,237,0.7); margin: 0 auto 18px; }
        section { padding: 96px 0; }
        @media(max-width:860px) { section { padding: 64px 0; } }
        .nav-links a { color: var(--muted); font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .nav-links a:hover { color: var(--text); }
        .hero-stats { display: flex; gap: 38px; margin-top: 40px; padding-top: 28px; border-top: 1px solid var(--border); }
        .hstat b { display: block; font-family: Space Grotesk, sans-serif; font-size: 26px; font-weight: 700; letter-spacing: -0.02em; }
        .hstat span { font-size: 12.5px; color: var(--faint); }
        .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; max-width: 900px; margin: 56px auto 0; }
        @media(max-width:720px) { .steps-grid { grid-template-columns: 1fr; } }
        .feats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-top: 52px; }
        @media(max-width:960px) { .feats-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:600px) { .feats-grid { grid-template-columns: 1fr; } }
        .final-cta { position: relative; text-align: center; border: 1px solid var(--border2); border-radius: 28px; padding: 80px 34px; overflow: hidden; background: var(--panel); }
        .final-cta::before { content: ''; position: absolute; inset: 0; background: radial-gradient(60% 90% at 50% -10%, rgba(124,58,237,0.3), transparent 65%); }
        .final-cta > * { position: relative; }
        h2.title { font-family: Space Grotesk, sans-serif; font-size: clamp(28px,4vw,42px); font-weight: 700; letter-spacing: -0.025em; line-height: 1.12; text-align: center; margin-top: 16px; }
        .sub { text-align: center; color: var(--muted); font-size: 17px; max-width: 640px; margin: 16px auto 0; }
      ` }} />

      {/* NAV */}
      <nav className="landing-nav">
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 19 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 8px 20px -6px rgba(124,58,237,0.6)' }}>✦</div>
            Millionais<span style={{ color: 'var(--glow)' }}>.AI</span>
          </div>
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <a href="#como">Como funciona</a>
            <a href="#arsenal">Recursos</a>
            <Link href="/login" style={{ color: 'var(--muted)' }}>Entrar</Link>
            <Link href="/login" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: 14, borderRadius: 11 }}>Acessar plataforma →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="landing-hero">
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 56, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <div className="hero-badge rv in" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 12.5, fontWeight: 700, color: 'var(--ember)', background: 'rgba(255,122,69,0.09)', border: '1px solid rgba(255,122,69,0.28)', padding: '8px 16px', borderRadius: 999 }}>
              <span className="dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ember)' }}></span>
              Plataforma de criação com IA · Uso pessoal
            </div>
            <h1 ref={heroRef} style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,4.6vw,56px)', lineHeight: 1.04, letterSpacing: '-0.03em', marginTop: 22 }}>
              Crie conteúdo de produto{' '}
              <span className="grad">sem gravar um único vídeo.</span>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 18, marginTop: 20, maxWidth: 500, lineHeight: 1.65 }}>
              A Millionais AI cria os vídeos e as fotos de produto por você — com IA tão real que <b style={{ color: 'var(--text)' }}>ninguém percebe que não é gravação</b>. E ainda te entrega os prompts validados e o painel de lucro.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 34 }}>
              <Link href="/login" className="btn btn-primary btn-lg">Acessar minha plataforma →</Link>
              <a href="#arsenal" className="btn btn-secondary">Ver recursos</a>
            </div>
            <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--faint)' }}>Acesso imediato · Uso pessoal gratuito · APIs do Gemini + OpenAI integradas</div>
            <div className="hero-stats">
              <div className="hstat"><b className="grad">30s</b><span>da ideia ao criativo</span></div>
              <div className="hstat"><b className="grad">9+</b><span>ferramentas de IA</span></div>
              <div className="hstat"><b className="grad">0</b><span>câmeras necessárias</span></div>
            </div>
          </div>
          <div className="rv in" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(60% 60% at 50% 50%, rgba(124,58,237,0.22), transparent 70%)', zIndex: -1 }}></div>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border2)', borderRadius: 24, padding: 24, boxShadow: '0 40px 90px -34px rgba(0,0,0,0.9)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {['🖼️ Imagem de Produto', '🎬 Vídeo UGC', '🎙️ Narração IA', '🔥 Análise Viral'].map((item, i) => (
                  <div key={i} style={{ background: 'var(--raised)', border: '1px solid var(--border2)', borderRadius: 14, padding: '14px 16px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>{item}</div>
                ))}
              </div>
              <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(109,40,217,0.1))', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Agente gerando prompt...</div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--glow)', lineHeight: 1.6 }}>
                  "Close-up de skincare com bolhas<br/>de ar, luz difusa suave, fundo<br/>branco minimalista, 4K, UGC style"
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 10px var(--green)' }}></div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>Pronto em 28s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* COMO FUNCIONA */}
      <section id="como" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="wrap">
          <div style={{ textAlign: 'center' }}><span className="eyebrow rv">A solução</span></div>
          <h2 className="title rv">Em 3 passos, seu conteúdo <span className="grad">está pronto.</span></h2>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={i} className="rv" style={{ textAlign: 'center', transitionDelay: `${i * 0.1}s` }}>
                <div className="step-num">{s.n}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 240, margin: '0 auto', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARSENAL */}
      <section id="arsenal">
        <div className="wrap">
          <div style={{ textAlign: 'center' }}><span className="eyebrow rv">O arsenal</span></div>
          <h2 className="title rv">Não é só um gerador de vídeo.<br /><span className="grad">É a operação inteira num lugar só.</span></h2>
          <p className="sub rv">Ferramenta de IA todo mundo tem. O que vende é saber o que gerar, com qual prompt — e medir o que dá lucro.</p>
          <div className="feats-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feat-card rv" style={{ transitionDelay: `${i * 0.07}s` }}>
                <div className="feat-icon">{f.icon}</div>
                <b style={{ display: 'block', fontSize: 15.5, marginBottom: 6, letterSpacing: '-0.01em' }}>{f.title}</b>
                <span style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section>
        <div className="wrap">
          <div className="final-cta rv">
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(26px,3.6vw,40px)', fontWeight: 700, letterSpacing: '-0.025em' }}>
              Sua plataforma pessoal de IA está <span className="grad">pronta para usar.</span>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 16.5, maxWidth: 520, margin: '16px auto 32px', lineHeight: 1.65 }}>
              Sem mensalidade, sem limite de uso. Gemini + OpenAI integrados. Seu primeiro criativo pode sair em menos de 1 minuto.
            </p>
            <Link href="/login" className="btn btn-primary btn-lg">Acessar a plataforma agora →</Link>
            <div style={{ marginTop: 18, fontSize: 12.5, color: 'var(--faint)' }}>Acesso imediato · Uso pessoal · APIs Gemini + OpenAI</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 0', color: 'var(--faint)', fontSize: 13 }}>
        <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16 }}>
            ✦ Millionais<span style={{ color: 'var(--glow)' }}>.AI</span>
          </div>
          <div>© 2026 Millionais.AI · Uso pessoal · Powered by Gemini + OpenAI</div>
        </div>
      </footer>
    </>
  );
}
