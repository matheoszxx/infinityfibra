/* =========================================================
   Infinity Fibra — protótipo imersivo
   - Ignição (pré-carregamento) → voo do foguete com looping → repouso
   - Chama/rastro em partículas (canvas) presa ao bocal do foguete
   - Campo de estrelas com "warp", parallax do mouse, turbo ao clicar
   - Calculadora de velocidade, órbita de serviços, montador de combo
   ========================================================= */
(() => {
  'use strict';

  // ---------- Configuração de negócio (trocar pelos valores oficiais) ----------
  const WHATSAPP = '5575981842131';
  const VIABILIDADE = 'https://sistema.infinityfibra.com/viability/index?campaignId=1&channelId=1&employeeId=1';

  // Valores de DEMONSTRAÇÃO — substituir pela tabela oficial da Infinity.
  const PLANS = [
    { id: '300', speed: '300', unit: 'Mega', price: 79.9 },
    { id: '500', speed: '500', unit: 'Mega', price: 99.9, tag: 'Mais escolhido' },
    { id: '1g', speed: '1', unit: 'Giga', price: 129.9 },
    { id: '10g', speed: '10', unit: 'Giga', price: null }, // sob consulta
  ];

  const ICONS = {
    wifi: '<path d="M2 8.8a15 15 0 0 1 20 0"/><path d="M5 12.4a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.4" r="1"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    heart: '<path d="M20.4 5.6a5.2 5.2 0 0 0-7.4 0L12 6.6l-1-1a5.2 5.2 0 0 0-7.4 7.4L12 21.4l8.4-8.4a5.2 5.2 0 0 0 0-7.4z"/><path d="M6 11.5h3l1.5-2.5 2.5 5 1.5-2.5H18"/>',
    tv: '<rect x="2.5" y="6.5" width="19" height="13" rx="2.5"/><path d="M8 2.5l4 4 4-4"/>',
    apps: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
    router: '<rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 13V8M17 13V8"/><path d="M9.5 6.5a4 4 0 0 1 5 0"/><path d="M7.5 4.2a7 7 0 0 1 9 0"/><path d="M7 16.5h.01M10.5 16.5h.01"/>',
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;

  const ADDONS = [
    { id: 'wifi', icon: 'router', name: 'Wi-Fi Premium', desc: 'Wi-Fi 6 cobrindo a casa toda', price: 19.9 },
    { id: 'tv', icon: 'tv', name: 'App de TV', desc: 'Centenas de canais no app', price: 24.9 },
    { id: 'apps', icon: 'apps', name: 'Combo de Apps', desc: 'Disney+, HBO, Deezer, PlayKids…', price: 29.9 },
    { id: 'medico', icon: 'heart', name: 'Médico 24h', desc: 'Pra você e sua família', price: 19.9 },
    { id: 'rastreador', icon: 'pin', name: 'Rastreador', desc: 'Carro, moto ou frota', price: 39.9 },
  ];

  const SERVICES = [
    { id: 'internet', icon: 'wifi', label: 'Internet', c1: '#c7a1ff', c2: '#5a1fd1', ring: 0,
      kicker: 'Conexão', title: 'Internet ilimitada',
      text: 'Fibra óptica até a sua casa, sem franquia e sem redução de velocidade. Planos de até 10.000 Mega.',
      list: ['Sem limite de dados', 'Wi-Fi 6 disponível', 'Home office, jogos e streaming sem travar'], cta: ['Montar combo →', '#combo'] },
    { id: 'solar', icon: 'sun', label: 'Solar', c1: '#ffe48a', c2: '#d97a00', ring: 1,
      kicker: 'Energia', title: 'Energia solar',
      text: 'Time de engenharia especializado para o seu projeto. Produza sua própria energia e economize na conta de luz.',
      list: ['Projetos on-grid, off-grid ou híbridos', 'Engenharia própria', 'Para casa ou empresa'], cta: ['Pedir cotação →', 'wa:Olá! Quero uma cotação de energia solar.'] },
    { id: 'rastreador', icon: 'pin', label: 'Rastreador', c1: '#8ff5dc', c2: '#0f7f6b', ring: 0,
      kicker: 'Segurança', title: 'Rastreador veicular',
      text: 'Monitore seu veículo ou sua frota com uma plataforma completa de gestão.',
      list: ['Para um veículo ou frota inteira', 'Plataforma de gestão completa'], cta: ['Adicionar ao combo →', '#combo'] },
    { id: 'medico', icon: 'heart', label: 'Médico 24h', c1: '#ffadbd', c2: '#c4204c', ring: 1,
      kicker: 'Saúde', title: 'Médico 24 horas',
      text: 'Emergência ou rotina? Conte com médico disponível a qualquer hora para você e sua família.',
      list: ['Disponível 24h', 'Para toda a família'], cta: ['Adicionar ao combo →', '#combo'] },
    { id: 'tv', icon: 'tv', label: 'App TV', c1: '#a3c2ff', c2: '#2445c4', ring: 0,
      kicker: 'Entretenimento', title: 'App de TV',
      text: 'Um aplicativo de TV exclusivo para clientes, com acesso a centenas de canais.',
      list: ['Centenas de canais', 'Na TV, no celular ou no tablet'], cta: ['Adicionar ao combo →', '#combo'] },
    { id: 'apps', icon: 'apps', label: 'Apps', c1: '#ffaaf3', c2: '#9b1c96', ring: 1,
      kicker: 'Streaming', title: 'Combo de Apps',
      text: 'Escolha os aplicativos que combinam com o seu perfil: Deezer, Disney+, HBO, PlayKids e outros.',
      list: ['Música, filmes, séries e infantil', 'Você escolhe o que entra'], cta: ['Adicionar ao combo →', '#combo'] },
  ];

  // ---------- Utilidades ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, t) => { const x = clamp((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  const brl = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const wa = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  if (G && ST) G.registerPlugin(ST);

  const view = { w: innerWidth, h: innerHeight, dpr: Math.min(devicePixelRatio || 1, 2) };
  addEventListener('resize', () => { view.w = innerWidth; view.h = innerHeight; sizeCanvases(); });

  const mouse = { x: 0, y: 0, nx: 0, ny: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    mouse.nx = (e.clientX / view.w) * 2 - 1;
    mouse.ny = (e.clientY / view.h) * 2 - 1;
  }, { passive: true });

  // a intro acontece no topo: não restaurar a rolagem anterior ao recarregar
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) scrollTo(0, 0);

  // ---------- Rolagem suave ----------
  let lenis = null;
  if (window.Lenis && !REDUCED) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (G && ST) {
      lenis.on('scroll', ST.update);
      G.ticker.add((t) => lenis.raf(t * 1000));
      G.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = $(id); if (!el) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(el, { offset: -70 }) : el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
  }));

  // =========================================================
  // Canvas: estrelas (hero) e efeitos (chama/rastro, tela toda)
  // =========================================================
  const starsCv = $('#stars'), starsCx = starsCv.getContext('2d');
  const fxCv = $('#fx'), fxCx = fxCv.getContext('2d');
  const hero = $('.hero');

  function sizeCanvases() {
    view.dpr = Math.min(devicePixelRatio || 1, 2);
    const r = hero.getBoundingClientRect();
    starsCv.width = r.width * view.dpr; starsCv.height = r.height * view.dpr;
    fxCv.width = view.w * view.dpr; fxCv.height = view.h * view.dpr;
    starsCx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    fxCx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  }
  sizeCanvases();

  // estrelas em 3 profundidades
  const STARS = Array.from({ length: Math.round(clamp(view.w * view.h / 5500, 90, 320)) }, () => ({
    x: Math.random(), y: Math.random(), z: Math.random() ** 2 * 0.9 + 0.1, tw: Math.random() * Math.PI * 2,
  }));
  const space = { warp: 0, speed: 0.00012 };
  let heroVisible = true;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);

  function drawStars(t) {
    if (!heroVisible) return;
    const W = starsCv.width / view.dpr, H = starsCv.height / view.dpr;
    starsCx.clearRect(0, 0, W, H);
    const v = space.speed * (1 + space.warp * 40);
    for (const s of STARS) {
      s.x -= v * s.z * 4;
      if (s.x < -0.05) { s.x = 1.05; s.y = Math.random(); }
      const px = s.x * W - mouse.sx * 30 * s.z, py = s.y * H - mouse.sy * 20 * s.z;
      const a = (0.35 + 0.65 * s.z) * (0.75 + 0.25 * Math.sin(t * 0.002 + s.tw));
      const len = space.warp * 160 * s.z;
      if (len > 2) {
        const g = starsCx.createLinearGradient(px, py, px + len, py);
        g.addColorStop(0, `rgba(230,215,255,${a})`); g.addColorStop(1, 'rgba(230,215,255,0)');
        starsCx.strokeStyle = g; starsCx.lineWidth = s.z * 1.6;
        starsCx.beginPath(); starsCx.moveTo(px, py); starsCx.lineTo(px + len, py); starsCx.stroke();
      } else {
        starsCx.fillStyle = s.z > 0.75 ? `rgba(255,224,150,${a})` : `rgba(230,215,255,${a})`;
        starsCx.fillRect(px, py, s.z * 2.2, s.z * 2.2);
      }
    }
  }

  // sprites de partícula pré-renderizados (quente, laranja, fumaça roxa)
  const sprite = (stops) => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    stops.forEach(([o, col]) => g.addColorStop(o, col));
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return c;
  };
  const SPR = {
    hot: sprite([[0, 'rgba(255,255,240,1)'], [0.25, 'rgba(255,236,150,.9)'], [0.6, 'rgba(255,170,40,.35)'], [1, 'rgba(255,120,20,0)']]),
    warm: sprite([[0, 'rgba(255,190,80,.9)'], [0.4, 'rgba(255,110,30,.5)'], [1, 'rgba(200,40,80,0)']]),
    smoke: sprite([[0, 'rgba(180,110,255,.45)'], [0.5, 'rgba(124,44,255,.18)'], [1, 'rgba(60,10,120,0)']]),
  };
  const PARTS = [];
  const MAX_PARTS = REDUCED ? 120 : 900;

  function emit(x, y, dx, dy, power, smokeBias) {
    if (PARTS.length >= MAX_PARTS) return;
    const sp = (2.5 + Math.random() * 3.5) * (0.6 + power * 0.8);
    const j = 0.9 + power * 0.6;
    const smoke = Math.random() < smokeBias;
    PARTS.push({
      x, y,
      vx: dx * sp + (Math.random() - 0.5) * j,
      vy: dy * sp + (Math.random() - 0.5) * j,
      life: 0,
      max: smoke ? 50 + Math.random() * 60 : 16 + Math.random() * 18 * (0.7 + power * 0.5),
      size: smoke ? 18 + Math.random() * 22 : 16 + Math.random() * 20 * (0.8 + power * 0.4),
      smoke,
    });
  }

  function drawFx(dt) {
    fxCx.clearRect(0, 0, view.w, view.h);
    fxCx.globalCompositeOperation = 'lighter';
    for (let i = PARTS.length - 1; i >= 0; i--) {
      const p = PARTS[i];
      p.life += dt;
      if (p.life >= p.max) { PARTS.splice(i, 1); continue; }
      const k = p.life / p.max;
      const drag = p.smoke ? 0.94 : 0.9;
      p.vx *= drag ** dt; p.vy *= drag ** dt;
      if (p.smoke) p.vy -= 0.02 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      let img, alpha, size;
      if (p.smoke) { img = SPR.smoke; alpha = (1 - k) * 0.9; size = p.size * (0.6 + k * 1.6); }
      else if (k < 0.3) { img = SPR.hot; alpha = 1; size = p.size * (1 - k * 0.5); }
      else { img = SPR.warm; alpha = 1 - k; size = p.size * (1.1 - k * 0.6); }
      fxCx.globalAlpha = alpha;
      fxCx.drawImage(img, p.x - size / 2, p.y - size / 2, size, size);
    }
    // jato contínuo no bocal (dá corpo à chama; as partículas fazem o rastro)
    const j = R.jet;
    if (j && R.visible) {
      const flick = 0.85 + Math.random() * 0.3;
      const len = j.len * flick, th = j.th * (0.9 + Math.random() * 0.2);
      fxCx.save();
      fxCx.translate(j.x, j.y);
      fxCx.rotate(j.angle);
      fxCx.globalAlpha = 0.9;
      fxCx.drawImage(SPR.warm, -len * 0.15, -th * 0.9, len * 1.25, th * 1.8);
      fxCx.drawImage(SPR.hot, -len * 0.1, -th / 2, len, th);
      fxCx.drawImage(SPR.hot, -len * 0.05, -th * 0.28, len * 0.55, th * 0.56);
      fxCx.restore();
    }
    fxCx.globalAlpha = 1;
    fxCx.globalCompositeOperation = 'source-over';
  }

  // =========================================================
  // O foguete
  // =========================================================
  const rocketEl = $('#rocket');
  // geometria da arte (890×614, já com a chama pintada):
  // JET_FROM = meio da chama pintada (o jato animado reforça e estende a chama),
  // NOZZLE = ponta da chama pintada (de onde saem faíscas e fumaça).
  const IMG_RATIO = 614 / 890;
  const JET_FROM = { x: 0.2, y: 0.8 };
  const NOZZLE = { x: 0.06, y: 0.9 };
  const EXHAUST = { x: -0.928, y: 0.371 };     // direção da chama na arte
  const HEADING_OFFSET = 9.9;                  // a arte já aponta ~10° para cima

  const R = {
    mode: 'hidden',     // hidden | intro | hero | flyby
    x: -500, y: -500, rot: 0, s: 1,
    introT: 0, flyT: 0, spin: 0, boost: 0, power: 0.4,
    prevTail: null, rotCont: 0, visible: false,
  };

  // no celular o foguete pousa logo abaixo dos botões do hero (sem cobrir o clique)
  const ctasEl = $('.hero__ctas');
  let ctasBottom = 0;
  const measureCtas = () => { ctasBottom = ctasEl.getBoundingClientRect().bottom + scrollY; };
  measureCtas();
  addEventListener('resize', measureCtas);
  addEventListener('load', measureCtas);
  const restPos = () => {
    if (view.w > 760) return { x: view.w * 0.75, y: view.h * 0.52 };
    const h = rocketEl.offsetWidth * IMG_RATIO;
    // posição na página (não na tela): sobe junto com o conteúdo ao rolar
    return { x: view.w * 0.55, y: Math.max(ctasBottom + h / 2 + 24, view.h * 0.6) - scrollY };
  };

  // Catmull-Rom: posição e tangente
  function spline(pts, t) {
    const n = pts.length - 1;
    const seg = Math.min(Math.floor(t * n), n - 1);
    const u = t * n - seg;
    const p0 = pts[Math.max(seg - 1, 0)], p1 = pts[seg], p2 = pts[seg + 1], p3 = pts[Math.min(seg + 2, n)];
    const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    const df = (a, b, c, d) => 0.5 * ((-a + c) + 2 * (2 * a - 5 * b + 4 * c - d) * u + 3 * (-a + 3 * b - 3 * c + d) * u * u);
    return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y), dx: df(p0.x, p1.x, p2.x, p3.x), dy: df(p0.y, p1.y, p2.y, p3.y) };
  }

  function introPath() {
    const W = view.w, H = view.h, rest = restPos();
    const wide = W > 760;
    const C = wide ? { x: W * 0.56, y: H * 0.42 } : { x: W * 0.5, y: H * 0.5 };
    const r = Math.min(W, H) * (wide ? 0.17 : 0.24);
    return [
      { x: -W * 0.3, y: H * 1.2 },
      { x: W * 0.12, y: H * 0.85 },
      { x: C.x, y: C.y + r },
      { x: C.x + r, y: C.y },
      { x: C.x, y: C.y - r },
      { x: C.x - r, y: C.y },
      { x: C.x + r * 0.1, y: C.y + r * 1.05 },
      { x: lerp(C.x, rest.x, 0.6), y: lerp(C.y + r, rest.y, 0.6) + 10 },
      rest,
    ];
  }

  function flybyPath() {
    const W = view.w, H = view.h;
    return [
      { x: -W * 0.3, y: H * 0.95 },
      { x: W * 0.25, y: H * 0.7 },
      { x: W * 0.55, y: H * 0.5 },
      { x: W * 0.85, y: H * 0.25 },
      { x: W * 1.35, y: -H * 0.1 },
    ];
  }

  const unwrap = (a, prev) => { while (a - prev > 180) a -= 360; while (a - prev < -180) a += 360; return a; };
  const headingRot = (dx, dy) => (Math.atan2(dy, dx) * 180) / Math.PI + HEADING_OFFSET;

  function updateRocket(t, dt) {
    const w = rocketEl.offsetWidth, h = w * IMG_RATIO;
    mouse.sx = lerp(mouse.sx, mouse.nx, 0.06 * dt);
    mouse.sy = lerp(mouse.sy, mouse.ny, 0.06 * dt);
    let x, y, rot, s = 1, power = 0.45, smokeBias = 0.06, visible = true;

    if (R.mode === 'hidden') { visible = false; x = -999; y = -999; rot = 0; }
    else if (R.mode === 'intro') {
      const p = spline(introPath(), R.introT);
      x = p.x; y = p.y - scrollY; // o looping acontece "no hero", rola junto com a página
      visible = y > -view.h * 0.6;
      const hd = unwrap(headingRot(p.dx, p.dy), R.rotCont);
      R.rotCont = hd;
      const idle = -3 + 360 * Math.round((hd + 3) / 360);
      rot = lerp(hd, idle, smooth(0.86, 1, R.introT));
      s = lerp(0.75, 1, smooth(0, 0.5, R.introT));
      power = lerp(1.4, 0.6, smooth(0.6, 1, R.introT));
      smokeBias = lerp(0.35, 0.08, smooth(0.5, 1, R.introT));
    } else if (R.mode === 'flyby') {
      const p = spline(flybyPath(), R.flyT);
      x = p.x; y = p.y;
      rot = headingRot(p.dx, p.dy);
      s = 1.05; power = 1.6; smokeBias = 0.3;
    } else {
      // repouso no hero + saída com a rolagem
      const rest = restPos();
      const bob = Math.sin(t * 0.0016) * 10;
      const sway = Math.sin(t * 0.0011) * 2;
      const heroH = hero.offsetHeight || view.h;
      const sp = clamp(scrollY / (heroH * 0.85), 0, 1);
      const e = sp ** 1.6;
      x = rest.x + mouse.sx * 26 + e * view.w * 0.75;
      y = rest.y + bob + mouse.sy * 18 - e * view.h * 1.1;
      rot = -3 + sway + mouse.sy * 5 - e * 22;
      s = 1 + e * 0.25;
      power = 0.5 + e * 1.4;
      smokeBias = 0.05 + e * 0.3;
      visible = sp < 1;
    }

    rot += R.spin;
    s *= 1 + R.boost * 0.12;
    power += R.boost * 1.5;

    R.x = x; R.y = y; R.rot = rot; R.s = s;
    if (visible !== R.visible) {
      R.visible = visible;
      rocketEl.classList.toggle('is-hidden', !visible);
      R.prevTail = null;
    }
    if (!visible) return;

    rocketEl.style.transform = `translate3d(${x - w / 2}px, ${y - h / 2}px, 0) rotate(${rot}deg) scale(${s})`;

    // bocal no mundo
    const a = (rot * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
    const lx = (NOZZLE.x - 0.5) * w * s, ly = (NOZZLE.y - 0.5) * h * s;
    const tail = { x: x + lx * ca - ly * sa, y: y + lx * sa + ly * ca };
    const ex = EXHAUST.x * ca - EXHAUST.y * sa, ey = EXHAUST.x * sa + EXHAUST.y * ca;
    const jx = (JET_FROM.x - 0.5) * w * s, jy = (JET_FROM.y - 0.5) * h * s;
    R.jet = {
      x: x + jx * ca - jy * sa, y: y + jx * sa + jy * ca, angle: Math.atan2(ey, ex),
      len: w * s * 0.24 * (0.7 + power * 0.45), th: w * s * 0.09 * (0.85 + power * 0.2),
    };

    // emite partículas interpolando entre o bocal anterior e o atual (rastro contínuo)
    const prev = R.prevTail || tail;
    const dist = Math.hypot(tail.x - prev.x, tail.y - prev.y);
    const count = Math.round(clamp((REDUCED ? 1 : 5) * power * dt + dist / 5, 1, 45));
    for (let i = 0; i < count; i++) {
      const k = (i + Math.random()) / count;
      emit(lerp(prev.x, tail.x, k), lerp(prev.y, tail.y, k), ex, ey, power, smokeBias);
    }
    R.prevTail = tail;
  }

  // turbo ao clicar no mascote
  rocketEl.addEventListener('click', () => {
    if (R.mode !== 'hero' || !G) return;
    G.timeline()
      .to(R, { boost: 1, duration: 0.25, ease: 'power2.out' })
      .to(R, { spin: '-=360', duration: 0.9, ease: 'power3.inOut' }, 0)
      .to(space, { warp: 0.9, duration: 0.3, ease: 'power2.out' }, 0)
      .to(space, { warp: 0, duration: 1.2, ease: 'power2.out' }, 0.5)
      .to(R, { boost: 0, duration: 0.8, ease: 'power2.inOut' }, 0.6)
      .add(() => { R.spin = 0; });
  });

  // =========================================================
  // Laço principal
  // =========================================================
  let last = performance.now();
  let lastScrollFx = scrollY;
  function frame(t) {
    const dt = clamp((t - last) / 16.667, 0.2, 3);
    last = t;
    // o rastro pertence à página: acompanha a rolagem em vez de ficar grudado na tela
    const sdy = scrollY - lastScrollFx;
    lastScrollFx = scrollY;
    if (sdy) for (const p of PARTS) p.y -= sdy;
    if (sdy && R.prevTail) R.prevTail.y -= sdy;
    drawStars(t);
    updateRocket(t, dt);
    drawFx(dt);
    updateOrbit(dt);
    updateCursor(dt);
    requestAnimationFrame(frame);
  }

  // =========================================================
  // Ignição + intro
  // =========================================================
  const ign = $('#ignition');
  async function boot() {
    const img = rocketEl.querySelector('img');
    const ready = img.decode ? img.decode().catch(() => {}) : Promise.resolve();

    if (!G || REDUCED) {
      await ready;
      ign.remove();
      document.documentElement.classList.remove('js');
      rocketEl.style.opacity = 1;
      R.mode = 'hero';
      initScrollBits();
      requestAnimationFrame(frame);
      return;
    }

    // contagem 3-2-1 enquanto a imagem carrega
    const countEl = $('#ignitionCount'), bar = $('#ignitionBar');
    const tl = G.timeline();
    [3, 2, 1].forEach((n, i) => {
      tl.call(() => { countEl.textContent = n; }, null, i * 0.42)
        .fromTo(countEl, { scale: 1.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'power3.out' }, i * 0.42);
    });
    tl.to(bar, { width: '100%', duration: 1.26, ease: 'none' }, 0);
    await Promise.all([ready, new Promise((r) => tl.eventCallback('onComplete', r))]);

    requestAnimationFrame(frame);
    G.to(ign, { opacity: 0, duration: 0.45, ease: 'power2.out', onComplete: () => ign.remove() });
    launchIntro();
  }

  function launchIntro() {
    R.mode = 'intro'; R.introT = 0; R.rotCont = 0;
    rocketEl.style.opacity = 1;
    initScrollBits();
    const tl = G.timeline({ onComplete: () => { R.mode = 'hero'; } });
    tl.to(space, { warp: 1, duration: 0.5, ease: 'power2.out' }, 0)
      .to(R, { introT: 1, duration: 3.4, ease: 'power1.inOut' }, 0)
      .to(space, { warp: 0, duration: 2.2, ease: 'power2.inOut' }, 1.2)
      .to('.hero__title .word', { y: 0, duration: 1.1, stagger: 0.07, ease: 'expo.out' }, 1.4)
      .to('.hero__eyebrow', { opacity: 1, duration: 0.8 }, 1.6)
      .fromTo('.hero__lead', { y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 2.0)
      .fromTo('.hero__ctas', { y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 2.15)
      .to(['.hud', '.hero__scroll'], { opacity: 1, duration: 0.8 }, 2.4)
      .add(countHud, 2.4);
  }

  function countHud() {
    $$('[data-count]').forEach((el) => {
      const o = { v: 0 }, end = +el.dataset.count;
      if (!G) { el.textContent = end.toLocaleString('pt-BR'); return; }
      G.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('pt-BR'); } });
    });
  }

  // =========================================================
  // Comportamentos de rolagem
  // =========================================================
  const nav = $('#nav');
  let scrollBitsReady = false;
  function initScrollBits() {
    if (scrollBitsReady) return; scrollBitsReady = true;
    if (!G || !ST) { $$('.reveal').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; }); countHud(); return; }

    ST.batch('.reveal', {
      start: 'top 85%',
      onEnter: (els) => G.to(els, { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: 'power3.out', overwrite: true }),
    });

    // trilha de fibra dos passos
    const fill = $('#stepsFill'), steps = $$('.step');
    ST.create({
      trigger: '#steps', start: 'top 75%', end: 'bottom 55%', scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        const vertical = view.w <= 860;
        fill.style.width = vertical ? '100%' : `${p * 100}%`;
        fill.style.height = vertical ? `${p * 100}%` : '100%';
        steps.forEach((s, i) => s.classList.toggle('is-lit', p >= i / (steps.length - 1) - 0.02));
      },
    });

    // título do lançamento
    G.from('.launch__title', { scrollTrigger: { trigger: '.launch', start: 'top 80%', end: 'top 30%', scrub: 1 }, scale: 0.8, opacity: 0.2 });
    ST.refresh();
  }

  let lastY = scrollY;
  const railFill = $('#railFill'), railPct = $('#railPct');
  function onScroll() {
    const y = scrollY;
    nav.classList.toggle('is-solid', y > 40);
    nav.classList.toggle('is-hidden', y > view.h && y > lastY + 2);
    if (y < lastY - 2) nav.classList.remove('is-hidden');
    lastY = y;
    const max = document.documentElement.scrollHeight - view.h;
    const p = max > 0 ? y / max : 0;
    railFill.style.height = `${p * 100}%`;
    railPct.textContent = String(Math.round(p * 100)).padStart(3, '0');
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // =========================================================
  // Velocidade
  // =========================================================
  const range = $('#speedRange');
  let gb = 100;
  const fmtTime = (sec) => {
    if (sec < 60) return `${Math.max(1, Math.round(sec))} s`;
    const m = Math.floor(sec / 60), s = Math.round(sec % 60);
    if (m < 60) return s ? `${m} min ${s} s` : `${m} min`;
    const h = Math.floor(m / 60), mm = m % 60;
    return mm ? `${h} h ${mm} min` : `${h} h`;
  };
  function updateSpeed() {
    const mbps = +range.value;
    const slow = (gb * 8000) / 10, fast = (gb * 8000) / mbps;
    $('#speedValue').textContent = mbps;
    $('#fastLabel').textContent = `· ${mbps} Mega`;
    $('#timeSlow').textContent = fmtTime(slow);
    $('#timeFast').textContent = fmtTime(fast);
    $('#timeSaved').textContent = fmtTime(slow - fast);
    $('#barSlow').style.width = '100%';
    $('#barFast').style.width = `${Math.max((fast / slow) * 100, 1.2)}%`;
    const pct = ((mbps - range.min) / (range.max - range.min)) * 100;
    range.style.setProperty('--p', `${pct}%`);
    $('#dialFill').style.strokeDasharray = `${395.8 * (mbps / 1000)} 527.8`;
  }
  range.addEventListener('input', updateSpeed);
  $$('.speed__tabs .chip').forEach((c) => c.addEventListener('click', () => {
    $$('.speed__tabs .chip').forEach((x) => { x.classList.toggle('is-active', x === c); x.setAttribute('aria-selected', x === c); });
    gb = +c.dataset.gb;
    $('#barFast').style.width = '0%';
    requestAnimationFrame(updateSpeed);
  }));
  updateSpeed();

  // =========================================================
  // Órbita de serviços
  // =========================================================
  const orbit = $('#orbit');
  const planets = SERVICES.map((sv, i) => {
    const b = document.createElement('button');
    b.className = 'planet'; b.type = 'button';
    b.setAttribute('role', 'tab');
    b.style.setProperty('--c1', sv.c1); b.style.setProperty('--c2', sv.c2);
    b.innerHTML = `${svg(sv.icon)}<span class="planet__label">${sv.label}</span>`;
    b.setAttribute('aria-label', sv.title);
    b.addEventListener('click', () => selectService(i));
    orbit.appendChild(b);
    return { el: b, sv, base: (i / SERVICES.length) * Math.PI * 2 };
  });
  const orbitState = { a: 0, hover: false, active: 0 };
  orbit.addEventListener('pointerenter', () => { orbitState.hover = true; });
  orbit.addEventListener('pointerleave', () => { orbitState.hover = false; });

  function updateOrbit(dt) {
    if (!REDUCED && !orbitState.hover) orbitState.a += 0.0016 * dt;
    const size = orbit.offsetWidth;
    planets.forEach((p) => {
      const outer = p.sv.ring === 0;
      const rad = size * (outer ? 0.43 : 0.26);
      const ang = p.base + (outer ? orbitState.a : -orbitState.a * 1.4);
      p.el.style.transform = `translate(${Math.cos(ang) * rad}px, ${Math.sin(ang) * rad}px)`;
    });
  }

  function selectService(i) {
    orbitState.active = i;
    planets.forEach((p, j) => { p.el.classList.toggle('is-active', i === j); p.el.setAttribute('aria-selected', i === j); });
    const sv = SERVICES[i];
    const panel = $('#orbitPanel');
    panel.classList.remove('panel-anim'); void panel.offsetWidth; panel.classList.add('panel-anim');
    $('#panelIcon').innerHTML = svg(sv.icon);
    $('#panelKicker').textContent = sv.kicker;
    $('#panelTitle').textContent = sv.title;
    $('#panelText').textContent = sv.text;
    $('#panelList').innerHTML = sv.list.map((l) => `<li>${l}</li>`).join('');
    const cta = $('#panelCta');
    cta.textContent = sv.cta[0];
    if (sv.cta[1].startsWith('wa:')) { cta.href = wa(sv.cta[1].slice(3)); cta.target = '_blank'; cta.rel = 'noopener'; }
    else { cta.href = sv.cta[1]; cta.removeAttribute('target'); }
  }
  $('#panelCta').addEventListener('click', (e) => {
    const href = e.currentTarget.getAttribute('href');
    if (!href.startsWith('#')) return;
    e.preventDefault();
    const addonId = SERVICES[orbitState.active].id;
    if (ADDONS.some((a) => a.id === addonId)) { combo.addons.add(addonId); renderCombo(); }
    lenis ? lenis.scrollTo('#combo', { offset: -70 }) : $('#combo').scrollIntoView({ behavior: 'smooth' });
  });
  selectService(0);

  // =========================================================
  // Montador de combo
  // =========================================================
  const combo = { plan: '500', addons: new Set() };
  const plansEl = $('#plans'), addonsEl = $('#addons');

  PLANS.forEach((p) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'plan'; b.dataset.id = p.id;
    b.setAttribute('role', 'radio');
    b.innerHTML = `${p.tag ? `<span class="plan__tag">${p.tag}</span>` : ''}
      <div class="plan__speed">${p.speed}</div><div class="plan__unit">${p.unit}</div>
      <div class="plan__price">${p.price ? `R$ ${brl(p.price)}<small>/mês</small>` : 'Sob consulta'}</div>`;
    b.addEventListener('click', () => { combo.plan = p.id; renderCombo(); });
    plansEl.appendChild(b);
  });

  ADDONS.forEach((a) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'addon'; b.dataset.id = a.id;
    b.setAttribute('role', 'switch');
    b.innerHTML = `<span class="addon__icon">${svg(a.icon)}</span>
      <span class="addon__txt"><strong>${a.name}</strong><span>${a.desc}</span></span>
      <span class="addon__price">+${brl(a.price)}</span><span class="addon__toggle"></span>`;
    b.addEventListener('click', () => { combo.addons.has(a.id) ? combo.addons.delete(a.id) : combo.addons.add(a.id); renderCombo(); });
    addonsEl.appendChild(b);
  });

  const totalEl = $('#summaryTotal');
  const shownTotal = { v: 0 };
  function renderCombo() {
    const plan = PLANS.find((p) => p.id === combo.plan);
    $$('.plan', plansEl).forEach((el) => { const on = el.dataset.id === combo.plan; el.classList.toggle('is-active', on); el.setAttribute('aria-checked', on); });
    $$('.addon', addonsEl).forEach((el) => { const on = combo.addons.has(el.dataset.id); el.classList.toggle('is-on', on); el.setAttribute('aria-checked', on); });

    const chosen = ADDONS.filter((a) => combo.addons.has(a.id));
    const items = [[`Internet ${plan.speed} ${plan.unit}`, plan.price ? brl(plan.price) : 'consulta'], ...chosen.map((a) => [a.name, `+${brl(a.price)}`])];
    $('#summaryItems').innerHTML = items.map(([n, v]) => `<li><span>${n}</span><span>${v}</span></li>`).join('');

    const total = plan.price == null ? null : plan.price + chosen.reduce((s, a) => s + a.price, 0);
    if (total == null) totalEl.textContent = 'sob consulta';
    else if (G) G.to(shownTotal, { v: total, duration: 0.6, ease: 'power3.out', onUpdate: () => { totalEl.textContent = brl(shownTotal.v); } });
    else totalEl.textContent = brl(total);

    const msg = `Olá! Montei meu combo no site da Infinity:\n• Internet ${plan.speed} ${plan.unit}${chosen.map((a) => `\n• ${a.name}`).join('')}${total != null ? `\nTotal estimado: R$ ${brl(total)}/mês` : ''}\nQuero contratar!`;
    $('#summaryCta').href = wa(msg);
  }
  renderCombo();

  // =========================================================
  // Cobertura (bairro → WhatsApp)
  // =========================================================
  $('#bairroForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#bairro').value.trim();
    if (!v) return;
    window.open(wa(`Olá! A fibra da Infinity já chega em: ${v}? (Cruz das Almas)`), '_blank', 'noopener');
  });

  // =========================================================
  // Lançamento final
  // =========================================================
  $('#launchBtn').addEventListener('click', () => {
    const url = wa('Olá! Quero decolar com a Infinity Fibra 🚀');
    if (!G || REDUCED) { window.open(url, '_blank', 'noopener'); return; }
    if (R.mode === 'flyby') return;
    R.mode = 'flyby'; R.flyT = 0; R.prevTail = null;
    G.timeline({ onComplete: () => { R.mode = 'hero'; } })
      .to(R, { flyT: 1, duration: 1.7, ease: 'power2.in' })
      .call(() => { const w = window.open(url, '_blank', 'noopener'); if (w === null) location.href = url; }, null, 1.0);
  });

  // =========================================================
  // Cursor + botões magnéticos
  // =========================================================
  const cursor = $('#cursor');
  const cur = { x: -100, y: -100 };
  function updateCursor(dt) {
    if (!FINE) return;
    cur.x = lerp(cur.x, mouse.x, 0.22 * dt); cur.y = lerp(cur.y, mouse.y, 0.22 * dt);
    cursor.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
  }
  if (FINE) {
    addEventListener('pointermove', () => { cursor.style.opacity = 1; }, { once: true });
    document.addEventListener('pointerover', (e) => cursor.classList.toggle('is-hover', !!e.target.closest('a, button, input')));
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  $('#year').textContent = new Date().getFullYear();
  boot();
})();
