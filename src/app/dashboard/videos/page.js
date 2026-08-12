'use client';
import { useState, useEffect, useRef } from 'react';

const DEFAULT_AVATARS = [
  { id: 'av1', name: 'Sofia', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' },
  { id: 'av2', name: 'Lucas', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop' },
  { id: 'av3', name: 'Marina', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop' },
  { id: 'av4', name: 'Pedro', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
];

const SCENARIOS = [
  { id: 'gradient-violet', name: '🟣 Gradiente Violeta', color: 'linear-gradient(135deg, #1a0533, #2d0b4e, #1a0533)' },
  { id: 'gradient-dark', name: '⬛ Escuro Profissional', color: 'linear-gradient(180deg, #0f0f0f, #1a1a2e)' },
  { id: 'gradient-warm', name: '🟠 Warm Studio', color: 'linear-gradient(135deg, #1a1008, #2d1b0e, #1a1008)' },
  { id: 'greenscreen', name: '🟢 Chroma Key', color: '#00b140' },
];

const VOICES = [
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

export default function VideosPage() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [avatars, setAvatars] = useState(DEFAULT_AVATARS);

  const [script, setScript] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('av1');
  const [selectedScenarioId, setSelectedScenarioId] = useState('gradient-violet');
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [voiceProvider, setVoiceProvider] = useState('google');
  const [ratio, setRatio] = useState('9:16');
  const [layoutMode, setLayoutMode] = useState('circle'); // 'circle' or 'fullscreen'

  const [loading, setLoading] = useState(false);
  const [scriptGenerating, setScriptGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [user, setUser] = useState(null);

  const canvasRef = useRef(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsedUser = JSON.parse(u);
      setUser(parsedUser);
      loadProducts(parsedUser.id);
      loadAvatars(parsedUser.id);
    }
  }, []);

  const loadProducts = async (userId) => {
    try {
      const res = await fetch(`/api/products?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        if (data.length > 0) setSelectedProductId(data[0].id);
      }
    } catch (e) { console.error(e); }
  };

  const loadAvatars = async (userId) => {
    try {
      const res = await fetch(`/api/avatars?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const custom = data.filter(a => !a.isDefault);
        setAvatars([...DEFAULT_AVATARS, ...custom]);
      }
    } catch (e) { console.error(e); }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const generateScriptWithIA = async () => {
    if (!selectedProduct) return;
    setScriptGenerating(true);
    setError('');

    const systemPrompt = `Você é um Copywriter especialista em roteiros UGC curtos para TikTok Ads e Reels.
Produto: ${selectedProduct.name}
Nicho: ${selectedProduct.niche}
Descrição: ${selectedProduct.description}

Escreva um roteiro em português do Brasil, altamente persuasivo, de no máximo 40 palavras.
Comece com um gancho forte (problema ou provocação) nos primeiros 3 segundos.
Mostre um benefício principal do produto.
Termine com uma CTA (chamada para ação).
Escreva APENAS o texto que o narrador deve falar. Sem rubricas, instruções ou explicações.`;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Gere o roteiro para meu produto.' }],
          systemInstruction: systemPrompt
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar roteiro');
      setScript(data.text);
    } catch (err) {
      setError('Erro no roteiro: ' + err.message);
    } finally {
      setScriptGenerating(false);
    }
  };

  const generateVideo = async () => {
    if (!script.trim()) return;
    setLoading(true);
    setError('');
    setVideoUrl(null);
    setProgress('Gerando narração com IA...');

    try {
      // 1. Generate TTS Audio
      const ttsRes = await fetch('/api/ai/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: script, voice: selectedVoice, provider: voiceProvider }),
      });
      if (!ttsRes.ok) {
        const errData = await ttsRes.json();
        throw new Error(errData.error || 'Erro na geração de voz');
      }
      const audioBlob = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      setProgress('Renderizando vídeo profissional...');

      // 2. Load all assets before rendering
      await renderProfessionalVideo(audioUrl);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loadImage = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  const renderProfessionalVideo = async (audioUrl) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const isVertical = ratio === '9:16';
    const W = isVertical ? 360 : 640;
    const H = isVertical ? 640 : 360;
    canvas.width = W;
    canvas.height = H;

    // Load assets
    const avatarObj = avatars.find(a => a.id === selectedAvatarId);
    const avatarImg = avatarObj ? await loadImage(avatarObj.image) : null;
    const productImg = selectedProduct?.image ? await loadImage(selectedProduct.image) : null;

    const scenario = SCENARIOS.find(s => s.id === selectedScenarioId);

    // Audio setup
    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audio);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Canvas Recording
    const canvasStream = canvas.captureStream(30);
    const dest = audioCtx.createMediaStreamDestination();
    source.connect(dest);
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...dest.stream.getAudioTracks()
    ]);
    const mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9' });
    const chunks = [];
    mediaRecorder.ondataavailable = (e) => { if (e.data?.size > 0) chunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(chunks, { type: 'video/mp4' });
      setVideoUrl(URL.createObjectURL(videoBlob));
      setLoading(false);
      setProgress('');
      audioCtx.close();
    };

    let startTime = 0;
    let lastBlink = 0;
    let isBlinking = false;

    const drawFrame = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      if (audio.paused || audio.ended) {
        if (mediaRecorder.state === 'recording') mediaRecorder.stop();
        return;
      }
      requestAnimationFrame(drawFrame);

      // ─── BACKGROUND ───
      if (scenario.color.startsWith('linear') || scenario.color.startsWith('#')) {
        if (scenario.color.startsWith('#')) {
          ctx.fillStyle = scenario.color;
          ctx.fillRect(0, 0, W, H);
        } else {
          const grad = ctx.createLinearGradient(0, 0, W, H);
          grad.addColorStop(0, '#1a0533');
          grad.addColorStop(0.5, '#2d0b4e');
          grad.addColorStop(1, '#1a0533');
          if (selectedScenarioId === 'gradient-dark') {
            const g2 = ctx.createLinearGradient(0, 0, 0, H);
            g2.addColorStop(0, '#0f0f0f');
            g2.addColorStop(1, '#1a1a2e');
            ctx.fillStyle = g2;
          } else if (selectedScenarioId === 'gradient-warm') {
            const g3 = ctx.createLinearGradient(0, 0, W, H);
            g3.addColorStop(0, '#1a1008');
            g3.addColorStop(0.5, '#2d1b0e');
            g3.addColorStop(1, '#1a1008');
            ctx.fillStyle = g3;
          } else {
            ctx.fillStyle = grad;
          }
          ctx.fillRect(0, 0, W, H);
        }
      }

      // ─── FULLSCREEN AVATAR BACKGROUND (UGC / MODA) ───
      if (layoutMode === 'fullscreen' && avatarImg) {
        ctx.save();
        // Draw the avatar covering the entire canvas (aspect fill)
        const avAspect = avatarImg.width / avatarImg.height;
        const canvasAspect = W / H;
        let drawW = W;
        let drawH = H;
        let drawX = 0;
        let drawY = 0;

        if (avAspect > canvasAspect) {
          drawW = H * avAspect;
          drawX = (W - drawW) / 2;
        } else {
          drawH = W / avAspect;
          drawY = (H - drawH) / 2;
        }

        ctx.drawImage(avatarImg, drawX, drawY, drawW, drawH);
        ctx.restore();
      }

      // ─── GLOW ORB (subtle animated violet glow) ───
      const orbX = W * 0.3 + Math.sin(elapsed * 0.5) * 40;
      const orbY = H * 0.2 + Math.cos(elapsed * 0.3) * 30;
      const orbGrad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, 200);
      orbGrad.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
      orbGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = orbGrad;
      ctx.fillRect(0, 0, W, H);

      // ─── GET AUDIO VOLUME ───
      analyser.getByteFrequencyData(dataArray);
      let vol = 0;
      for (let i = 0; i < bufferLength; i++) vol += dataArray[i];
      vol = vol / bufferLength;

      // ─── PRODUCT IMAGE (Floating Card) ───
      if (productImg) {
        const cardW = isVertical ? W * 0.42 : W * 0.28;
        const cardH = cardW;
        const cardX = isVertical ? W - cardW - 16 : W - cardW - 20;
        const cardY = isVertical ? 100 + Math.sin(elapsed * 1.5) * 6 : 20 + Math.sin(elapsed * 1.5) * 5;
        const cardR = 16;

        // Card shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 8;
        // Rounded rect
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fill();
        ctx.restore();

        // Product image clipped into rounded rect
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cardX + 3, cardY + 3, cardW - 6, cardH - 6, cardR - 2);
        ctx.clip();
        ctx.drawImage(productImg, cardX + 3, cardY + 3, cardW - 6, cardH - 6);
        ctx.restore();

        // Glow border
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.4 + Math.sin(elapsed * 2) * 0.2})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Product name tag
        if (selectedProduct?.name) {
          const tagY = cardY + cardH + 10;
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.beginPath();
          ctx.roundRect(cardX, tagY, cardW, 26, 8);
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.font = '600 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          const name = selectedProduct.name.length > 22 ? selectedProduct.name.slice(0, 22) + '…' : selectedProduct.name;
          ctx.fillText(name, cardX + cardW / 2, tagY + 17);
          ctx.textAlign = 'start';
        }
      }

      // ─── AVATAR (CIRCLE MODE ONLY) ───
      if (avatarImg && layoutMode === 'circle') {
        const avSize = isVertical ? W * 0.55 : H * 0.7;
        const avX = isVertical ? 16 : 20;
        const avY = isVertical ? H - avSize - 60 : H - avSize - 20;

        // Avatar shadow circle
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, avX, avY, avSize, avSize);
        ctx.restore();

        // Avatar ring
        ctx.beginPath();
        ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2 + 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.5 + (vol / 200)})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Speaking indicator (pulsing ring when speaking)
        if (vol > 20) {
          ctx.beginPath();
          ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2 + 6 + (vol / 15), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 + (vol / 500)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Avatar Name Tag
        if (avatarObj) {
          const nameTagX = avX + avSize / 2;
          const nameTagY = avY + avSize + 18;
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.beginPath();
          const nw = ctx.measureText(avatarObj.name).width + 24;
          ctx.roundRect(nameTagX - nw / 2, nameTagY - 10, nw, 22, 6);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = '600 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(avatarObj.name, nameTagX, nameTagY + 5);
          ctx.textAlign = 'start';
        }
      }

      // ─── TOP BAR (Branding) ───
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, 0, W, 40);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '700 13px Inter, sans-serif';
      ctx.fillText('Millionais.AI', 14, 26);

      // ─── BOTTOM CTA BAR ───
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, H - 44, W, 44);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.9)';
      const ctaW = 120;
      ctx.beginPath();
      ctx.roundRect(W / 2 - ctaW / 2, H - 36, ctaW, 28, 14);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Comprar Agora', W / 2, H - 18);
      ctx.textAlign = 'start';

      // ─── BLINKING ───
      const now = Date.now();
      if (now - lastBlink > 4000) { isBlinking = true; lastBlink = now; }
      if (isBlinking && now - lastBlink > 150) isBlinking = false;
    };

    // Start everything
    audio.play();
    mediaRecorder.start();
    requestAnimationFrame(drawFrame);
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Direção de Cena & UGC</h1>
        <p className="page-subtitle">Selecione um produto, escolha o apresentador, a voz e o cenário — a IA cria o vídeo completo.</p>
      </div>

      <div className="grid-2">
        {/* ── LEFT: CONFIGURATION ── */}
        <div className="card">

          {/* Step 1: Product */}
          {products.length > 0 ? (
            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">1. Produto (do seu Inventário)</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <select className="input" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} style={{ flex: 1 }}>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button type="button" className="btn btn-secondary btn-sm" onClick={generateScriptWithIA} disabled={scriptGenerating}>
                  {scriptGenerating ? '...' : '🪄 Roteiro IA'}
                </button>
              </div>
              {/* Product preview mini */}
              {selectedProduct && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12, padding: 12, background: 'var(--raised)', borderRadius: 12, border: '1px solid var(--border2)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border2)' }}>
                    <img src={selectedProduct.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{selectedProduct.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{selectedProduct.niche} • A foto deste produto será usada no vídeo</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: 'rgba(255,122,69,0.05)', border: '1px solid rgba(255,122,69,0.2)', borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 13, color: 'var(--ember)' }}>
              ⚠️ Cadastre um produto no <b>Inventário de Produtos</b> para gerar roteiros automáticos e incluir a foto real no vídeo.
            </div>
          )}

          {/* Step 2: Script */}
          <div className="input-group" style={{ marginBottom: 20 }}>
            <label className="input-label">2. Script (Fala do Narrador)</label>
            <textarea className="input" placeholder="Escreva ou gere com IA o roteiro..." value={script} onChange={e => setScript(e.target.value)} style={{ minHeight: 90 }} />
          </div>

          {/* Steps 3-6: Settings Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div className="input-group">
              <label className="input-label">3. Apresentador</label>
              <select className="input" value={selectedAvatarId} onChange={e => setSelectedAvatarId(e.target.value)}>
                {avatars.map(av => <option key={av.id} value={av.id}>{av.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">4. Cenário</label>
              <select className="input" value={selectedScenarioId} onChange={e => setSelectedScenarioId(e.target.value)}>
                {SCENARIOS.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">5. Voz</label>
              <select className="input" value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}>
                {(voiceProvider === 'google' ? GOOGLE_VOICES : VOICES).map(v => <option key={v.id} value={v.id}>{v.name} ({v.type})</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">6. Formato</label>
              <select className="input" value={ratio} onChange={e => setRatio(e.target.value)}>
                <option value="9:16">📱 Vertical 9:16</option>
                <option value="16:9">🖥️ Horizontal 16:9</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Layout do Vídeo</label>
              <select className="input" value={layoutMode} onChange={e => setLayoutMode(e.target.value)}>
                <option value="circle">⭕ Apresentador em Círculo (Padrão)</option>
                <option value="fullscreen">📺 Modelo Tela Cheia (UGC Moda)</option>
              </select>
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">7. Motor de Voz</label>
              <select className="input" value={voiceProvider} onChange={e => { setVoiceProvider(e.target.value); if (e.target.value === 'google') setSelectedVoice('pt-BR'); else setSelectedVoice('nova'); }}>
                <option value="google">🆓 Google TTS (Gratuito - Sem Limites)</option>
                <option value="openai">💎 OpenAI TTS (Premium - Requer Créditos)</option>
              </select>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={generateVideo} disabled={loading || !script.trim()}>
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16 }}></span> {progress}</>
            ) : (
              '🎬 Renderizar Vídeo Profissional'
            )}
          </button>

          {error && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, fontSize: 13, color: 'var(--red)' }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* ── RIGHT: PREVIEW ── */}
        <div>
          <div className="card" style={{ height: '100%', minHeight: 460, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="input-label" style={{ margin: 0 }}>Preview do Vídeo</div>
              {videoUrl && (
                <a href={videoUrl} download="criativo-ugc.mp4" className="btn btn-secondary btn-sm" style={{ background: 'var(--green)', color: '#111' }}>
                  📥 Baixar MP4
                </a>
              )}
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', borderRadius: 16, border: '1px dashed var(--border2)', overflow: 'hidden' }}>
              <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

              {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px', borderTopColor: 'var(--glow)' }}></div>
                  <div style={{ fontSize: 14 }}>{progress || 'Processando...'}</div>
                </div>
              ) : videoUrl ? (
                <video src={videoUrl} controls autoPlay style={{ maxWidth: '100%', maxHeight: 420, borderRadius: 8 }}></video>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--faint)', fontSize: 14, padding: 24 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Prévia do vídeo aqui</div>
                  <div style={{ maxWidth: 280, margin: '0 auto', lineHeight: 1.5 }}>
                    Configure o produto, roteiro, apresentador, cenário e clique em renderizar.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
