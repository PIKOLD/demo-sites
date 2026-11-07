// All. — demo concept. Motion: inflate-to-O-silhouette (WebGL), pleat tail, color splits, constructor.
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PHONE = matchMedia('(max-width: 860px), (hover: none) and (pointer: coarse)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ---------- color data (only from captions) ---------- */
const COL = {
  black: ['#121212', '#F3EFE6'], brown: ['#4B2E22', '#CDB99A'], khaki: ['#6F6B52', '#E4E2DE'],
  ivory: ['#EDE6D6', '#4B2E22'], beige: ['#CDB99A', '#4B2E22'], grey: ['#8D8C89', '#121212'], 'dark blue': ['#1E2540', '#F3EFE6']
};
const MODELS = [
  { id: 'bomber', label: 'Бомбер оверсайз', name: 'Бомбер оверсайз', colors: ['black'], img: { black: 'p5' }, note: 'Объёмный крой, широкие рукава со сборкой, лёгкий и тёплый утеплитель.' },
  { id: 'bomberhood', label: 'Бомбер-худи long', name: 'Оверсайз бомбер-худи long', colors: ['black'], img: {}, note: 'Носится как классический бомбер или как оверсайз худи. Матовая ткань с жатым эффектом и водоотталкивающей пропиткой.' },
  { id: 'sport', label: 'Спорт-куртка утеплённая', name: 'Утеплённая оверсайз куртка в спортивном стиле', colors: ['beige', 'brown'], img: { beige: 'p12', brown: 'p3' }, note: 'До −7°С. Материал с водоотталкивающей обработкой, O-образный силуэт.' },
  { id: 'denim', label: 'Куртка из денима', name: 'Утеплённая оверсайз куртка из денима', colors: ['black', 'ivory'], img: { ivory: 'p2' }, note: 'До −7°С. Объёмный укороченный крой, объёмный капюшон.' },
  { id: 'baggy', label: 'Брюки багги', name: 'Брюки багги', colors: ['khaki', 'brown'], img: { khaki: 'p6', brown: 'p14' }, note: 'Хлопковая ткань с peach эффектом, защипы в области колен.' },
  { id: 'velvet', label: 'Джоггеры из вельвета', name: 'Брюки оверсайз из вельвета', colors: ['brown'], img: { brown: 'p8' }, note: 'Хлопковый вельвет в крупный рубчик, пояс на широкой спортивной резинке.' },
  { id: 'relax', label: 'Джоггеры relax', name: 'Джоггеры relax', colors: ['dark blue'], img: { 'dark blue': 'p1' }, note: 'Peach эффект, оверсайз силуэт, скрытые боковые карманы.' },
  { id: 'hoodie', label: 'Худи crop', name: 'Оверсайз худи crop', colors: ['black'], img: { black: 'p10' }, note: 'Объёмный укороченный крой, O-образный силуэт, карман кенгуру.' },
  { id: 'sweater', label: 'Свитер crop', name: 'Вязаный свитер crop', colors: ['grey'], img: { grey: 'p1' }, note: 'Тяжёлый, тёплый, крупной вязки. Укороченный крой.' },
  { id: 'tee', label: 'Футболка relax', name: 'Футболка relax', colors: ['brown'], img: { brown: 'p11' }, note: 'Свободный крой, широкие рукава, лёгкий хлопок.' }
];
const ORDER = ['black', 'brown', 'khaki', 'ivory', 'beige', 'grey', 'dark blue'];

/* ---------- constructor ---------- */
const state = { m: 'baggy', c: 'khaki' };
const elModels = $('#models'), elSw = $('#swatches'), elMsg = $('#msg'), elNote = $('#note'), panel = $('#bPanel');
const inH = $('#h'), inW = $('#w');
MODELS.forEach(m => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'model'; b.dataset.id = m.id; b.textContent = m.label;
  b.addEventListener('click', () => { state.m = m.id; if (!m.colors.includes(state.c)) state.c = m.colors[0]; render(true); });
  elModels.appendChild(b);
});
ORDER.forEach(c => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'chip'; b.dataset.c = c; b.style.setProperty('--sw', COL[c][0]);
  b.innerHTML = `<b class="u">${c}</b>`;
  b.addEventListener('click', () => { if (b.disabled) return; state.c = c; render(true); });
  elSw.appendChild(b);
});
const model = () => MODELS.find(m => m.id === state.m);
function message() {
  const m = model(), h = inH.value.trim() || '__', w = inW.value.trim() || '__';
  return `Здравствуйте! Хочу: ${m.name} в цвете ${state.c}. Подскажите по размеру, мой рост ${h}, вес ${w}`;
}
let lastPanelKey = '';
function render(anim) {
  const m = model();
  $$('.model', elModels).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === m.id));
  $$('.chip', elSw).forEach(b => {
    const ok = m.colors.includes(b.dataset.c);
    b.disabled = !ok; b.setAttribute('aria-pressed', ok && b.dataset.c === state.c);
    b.title = ok ? '' : 'Нет в этом цвете';
  });
  elNote.textContent = m.note;
  const msg = message();
  elMsg.textContent = msg;
  const key = m.id + '|' + state.c;
  if (key === lastPanelKey) return;
  lastPanelKey = key;
  const [bg, fg] = COL[state.c], src = m.img[state.c];
  const bp = document.createElement('div');
  bp.className = 'bp' + (src ? '' : ' noimg') + (anim && !RM ? ' is-in' : '');
  bp.style.setProperty('--c', bg); bp.style.setProperty('--fg', fg);
  bp.innerHTML = `<span class="bp__word u">${state.c}</span>${src ? `<img class="bp__img" src="img/${src}-m.jpg" width="675" height="900" alt="${m.name} в цвете ${state.c}">` : ''}<span class="bp__name">${m.name}</span>`;
  panel.appendChild(bp);
  panel.style.setProperty('--c', bg); panel.style.setProperty('--fg', fg);
  const old = $$('.bp', panel).slice(0, -1);
  setTimeout(() => old.forEach(o => o.remove()), anim && !RM ? 650 : 0);
}
[inH, inW].forEach(i => i.addEventListener('input', () => { i.value = i.value.replace(/\D/g, '').slice(0, 3); elMsg.textContent = message(); }));
$$('[data-pick]').forEach(a => a.addEventListener('click', () => {
  const [m, c] = a.dataset.pick.split('|'); state.m = m; state.c = c; render(false);
}));
render(false);

async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (e) {
    const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (_) { } ta.remove(); return ok;
  }
}
const btnCopy = $('#copy');
btnCopy.addEventListener('click', async () => {
  const ok = await copyText(message());
  const s = btnCopy.querySelector('span'); s.textContent = ok ? 'Скопировано' : 'Выделите текст вручную';
  setTimeout(() => s.textContent = 'Скопировать', 1800);
});
$('#dm').addEventListener('click', () => { copyText(message()); });

/* ---------- header sits under the demo note, then sticks ---------- */
const topBar = $('.top'), demo = $('.demo');
const placeTop = () => { topBar.style.top = Math.max(0, demo.offsetHeight - scrollY) + 'px'; };
addEventListener('scroll', placeTop, { passive: true }); addEventListener('resize', placeTop); placeTop();

/* ---------- color splits: IntersectionObserver recolors the sticky half ---------- */
const looks = $$('.look'), layers = $$('.layer');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const i = looks.indexOf(e.target);
    layers.forEach((l, j) => l.classList.toggle('is-on', j <= i));
  }), { rootMargin: '-50% 0px -50% 0px' });
  looks.forEach(l => io.observe(l));
}

/* ---------- scroll-driven bits ---------- */
const tail = $('.tail'), tl = $$('.tail i');
const tilts = $$('.tilt'), stageImg = $('#stageImg'), cord = $('.cord path'), best = $('#best');
let lastY = scrollY, vel = 0, lastS = -1, cordDone = 0;
function frame(t) {
  const y = scrollY, dy = y - lastY; lastY = y;
  vel += (dy - vel) * 0.14;
  if (!RM && !PHONE) {
    const s = clamp(Math.abs(vel) / 26);
    if (Math.abs(s - lastS) > 0.002) {
      lastS = s;
      tail.style.letterSpacing = (s * 0.2).toFixed(3) + 'em';
      tl.forEach((el, i) => {
        const k = Math.sin(i * 0.8 + y * 0.004) * 0.5 + 0.5;
        el.style.transform = s < 0.003 ? '' : `scaleY(${(1 - s * (0.12 + 0.26 * k)).toFixed(3)}) skewX(${(clamp(vel, -40, 40) * 0.25 * (k - 0.5)).toFixed(2)}deg)`;
      });
    }
  }
  if (!RM) {
    const H = innerHeight;
    const list = PHONE ? [...tilts, stageImg] : tilts;
    for (const el of list) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > H + 50) continue;
      const q = clamp((H - r.top) / (H + r.height));
      el.style.transform = PHONE
        ? `perspective(900px) rotateY(${((q - 0.5) * -12).toFixed(2)}deg) scale(${(0.92 + 0.12 * q).toFixed(3)})`
        : `scale(${(0.96 + 0.06 * q).toFixed(3)})`;
    }
    if (cord && best) {
      const r = best.getBoundingClientRect();
      const q = clamp((H - r.top) / (H * 0.9));
      if (q > cordDone) { cordDone = q; cord.style.setProperty('--dash', ((1 - q) * 1400).toFixed(0)); }
    }
  }
  requestAnimationFrame(frame);
}
if (!RM) {
  if (cord) cord.style.setProperty('--dash', '1400');
  requestAnimationFrame(frame);
}

/* ---------- magnetic copy button ---------- */
if (!RM && !PHONE) {
  const span = btnCopy.querySelector('span');
  let tx = 0, ty = 0, cx = 0, cy = 0, run = false;
  const tick = () => {
    cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
    btnCopy.style.transform = `translate(${cx.toFixed(2)}px,${cy.toFixed(2)}px)`;
    span.style.transform = `translate(${(cx * 0.4).toFixed(2)}px,${(cy * 0.4).toFixed(2)}px)`;
    if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.05) requestAnimationFrame(tick); else run = false;
  };
  addEventListener('pointermove', e => {
    const r = btnCopy.getBoundingClientRect(), mx = r.left + r.width / 2, my = r.top + r.height / 2;
    const dx = e.clientX - mx, dy = e.clientY - my, d = Math.hypot(dx, dy);
    const near = d < Math.max(r.width, r.height) * 1.1;
    tx = near ? dx * 0.35 : 0; ty = near ? dy * 0.35 : 0;
    if (!run) { run = true; requestAnimationFrame(tick); }
  }, { passive: true });
}

/* ---------- hero chips (swap garment) ---------- */
const HERO = {
  p5: 'Бомбер оверсайз в цвете black — объёмный крой, широкие рукава со сборкой',
  p2: 'Оверсайз куртка из денима в цвете ivory — объёмный укороченный крой, до −7°С'
};
const heroCap = $('#heroCap'), meter = $('#meter');
let onHeroSwap = null;
$$('[data-hero]').forEach(b => b.addEventListener('click', () => {
  $$('[data-hero]').forEach(x => x.classList.toggle('is-on', x === b));
  const k = b.dataset.hero; heroCap.textContent = HERO[k];
  stageImg.srcset = `img/${k}-m.jpg 675w, img/${k}.jpg 1350w`; stageImg.src = `img/${k}.jpg`; stageImg.alt = HERO[k];
  if (onHeroSwap) onHeroSwap(k);
}));

/* ---------- WebGL: the garment inflates to an O-silhouette ---------- */
const VS = `
uniform sampler2D uH; uniform float uInflate; uniform vec2 uMouse; uniform float uPress; uniform vec2 uCenter;
varying vec2 vUv;
float dent(vec2 u){ vec2 d=(u-uMouse)*vec2(.75,1.); return exp(-dot(d,d)/.007)*uPress; }
void main(){
  vUv=uv;
  vec4 t=texture2D(uH,uv);
  float z=t.r*uInflate*1.05 - dent(uv)*.34*t.g*uInflate;
  vec3 p=position;
  p.xy+=(uv-uCenter)*vec2(3.,4.)*t.r*uInflate*vec2(.14,.035);
  p.z+=max(z,0.);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
}`;
const FS = `
uniform sampler2D uTex; uniform sampler2D uH; uniform float uInflate; uniform float uPress; uniform vec2 uMouse;
uniform vec3 uBgPhoto; uniform vec3 uStudio;
varying vec2 vUv;
float dent(vec2 u){ vec2 d=(u-uMouse)*vec2(.75,1.); return exp(-dot(d,d)/.007)*uPress; }
float hf(vec2 u){ vec4 t=texture2D(uH,u); return t.r*uInflate*1.05 - dent(u)*.34*t.g*uInflate; }
void main(){
  vec3 c=texture2D(uTex,vUv).rgb*(uStudio/uBgPhoto);
  vec4 t=texture2D(uH,vUv);
  float e=1./150.;
  float dx=hf(vUv+vec2(e,0.))-hf(vUv-vec2(e,0.));
  float dy=hf(vUv+vec2(0.,e))-hf(vUv-vec2(0.,e));
  vec3 n=normalize(vec3(-dx/(2.*e*3.),-dy/(2.*e*4.),1.));
  vec3 L=normalize(vec3(-.5,.65,.6));
  float dif=max(dot(n,L),0.);
  float spec=pow(max(dot(reflect(-L,n),vec3(0.,0.,1.)),0.),22.);
  float ao=mix(.7,1.,smoothstep(0.,.45,t.r));
  vec3 lit=c*(.52+.6*dif)*ao+vec3(spec*.16);
  c=mix(c,lit,clamp(uInflate*1.5,0.,1.));
  float a=smoothstep(.55,.85,t.g);
  float sh=texture2D(uH,vUv+vec2(-.06,.05)*uInflate).r;
  float sa=sh*.32*uInflate*(1.-a);
  vec3 col=mix(vec3(.12,.1,.08),c,a);
  gl_FragColor=vec4(col,clamp(a+sa,0.,1.));
}`;

function boxBlur(src, W, H, r) {
  const tmp = new Float32Array(W * H), k = 1 / (2 * r + 1);
  for (let y = 0; y < H; y++) {
    let acc = 0; const o = y * W;
    for (let x = -r; x <= r; x++) acc += src[o + clamp(x, 0, W - 1)];
    for (let x = 0; x < W; x++) {
      tmp[o + x] = acc * k;
      acc += src[o + Math.min(x + r + 1, W - 1)] - src[o + Math.max(x - r, 0)];
    }
  }
  for (let x = 0; x < W; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[clamp(y, 0, H - 1) * W + x];
    for (let y = 0; y < H; y++) {
      src[y * W + x] = acc * k;
      acc += tmp[Math.min(y + r + 1, H - 1) * W + x] - tmp[Math.max(y - r, 0) * W + x];
    }
  }
}
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = src; });

async function initGL() {
  const stage = $('#stage');
  let THREE;
  try { THREE = await import('three'); } catch (e) { return; }
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch (e) { return; }
  stage.appendChild(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 0.774, 0.1, 100);
  cam.position.z = (4 * 1.24) / 2 / Math.tan(15 * Math.PI / 180);
  const uni = {
    uTex: { value: null }, uH: { value: null }, uInflate: { value: 0 }, uMouse: { value: new THREE.Vector2(-2, -2) },
    uPress: { value: 0 }, uCenter: { value: new THREE.Vector2(.5, .5) },
    uBgPhoto: { value: new THREE.Vector3(.94, .94, .94) }, uStudio: { value: new THREE.Vector3(228 / 255, 226 / 255, 222 / 255) }
  };
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3, 4, 128, 192),
    new THREE.ShaderMaterial({ uniforms: uni, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false }));
  scene.add(mesh);

  const cache = {};
  async function prep(name) {
    if (cache[name]) return cache[name];
    const img = await loadImg(`img/${name}.jpg`);
    const tex = new THREE.Texture(img); tex.needsUpdate = true;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const W = 270, H = 360, c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0, W, H);
    const d = ctx.getImageData(0, 0, W, H).data;
    let br = 0, bgc = 0, bb = 0, n = 0;
    for (const [x0, y0] of [[2, 2], [W - 12, 2], [2, H - 12], [W - 12, H - 12]])
      for (let y = y0; y < y0 + 10; y++) for (let x = x0; x < x0 + 10; x++) { const o = (y * W + x) * 4; br += d[o]; bgc += d[o + 1]; bb += d[o + 2]; n++; }
    br /= n; bgc /= n; bb /= n;
    const m = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) {
      const o = i * 4, dr = Math.abs(d[o] - br), dg = Math.abs(d[o + 1] - bgc), db = Math.abs(d[o + 2] - bb);
      m[i] = Math.max(dr, dg, db) > 16 ? 1 : 0;
    }
    // morphological close: dilate, then erode
    boxBlur(m, W, H, 5); for (let i = 0; i < m.length; i++) m[i] = m[i] > 0.12 ? 1 : 0;
    boxBlur(m, W, H, 5); for (let i = 0; i < m.length; i++) m[i] = m[i] > 0.93 ? 1 : 0;
    const mask = m.slice(); boxBlur(mask, W, H, 1);
    const h = m.slice(); boxBlur(h, W, H, 10); boxBlur(h, W, H, 10); boxBlur(h, W, H, 10);
    let mx = 0, sx = 0, sy = 0, sw = 0;
    for (let i = 0; i < h.length; i++) { if (h[i] > mx) mx = h[i]; if (m[i]) { sx += i % W; sy += (i / W) | 0; sw++; } }
    const data = new Uint8Array(W * H * 4);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = ((H - 1 - y) * W + x) * 4;
      const yt = y / H, head = yt < 0.17 ? 0 : yt > 0.31 ? 1 : (yt - 0.17) / 0.14;
      const v = Math.pow(clamp((h[i] - 0.3) / Math.max(mx - 0.3, 0.01)), 0.7) * head * head * (3 - 2 * head);
      data[o] = v * 255; data[o + 1] = mask[i] * 255; data[o + 3] = 255;
    }
    const ht = new THREE.DataTexture(data, W, H, THREE.RGBAFormat);
    ht.minFilter = ht.magFilter = THREE.LinearFilter; ht.needsUpdate = true;
    const out = { tex, ht, bg: [br / 255, bgc / 255, bb / 255], center: sw ? [sx / sw / W, 1 - sy / sw / H] : [.5, .5] };
    cache[name] = out; return out;
  }
  function apply(o) {
    uni.uTex.value = o.tex; uni.uH.value = o.ht;
    uni.uBgPhoto.value.set(...o.bg); uni.uCenter.value.set(...o.center);
  }
  try { apply(await prep('p5')); } catch (e) { canvas.remove(); return; }
  stage.classList.add('gl');
  prep('p2').catch(() => { });

  function size() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
  }
  size(); addEventListener('resize', size);

  // swap: deflate, change garment, inflate again
  let swapK = 1, swapTo = null;
  onHeroSwap = k => { swapTo = k; };

  const hero = $('.hero'), ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let pointer = null, down = false, press = 0, pv = 0, inflate = 0, t0 = performance.now(), visible = true;
  const mouseUv = new THREE.Vector2(-2, -2), rot = { x: 0, y: 0 };
  addEventListener('pointermove', e => { pointer = { x: e.clientX, y: e.clientY }; }, { passive: true });
  canvas.addEventListener('pointerdown', () => { down = true; canvas.style.cursor = 'grabbing'; });
  addEventListener('pointerup', () => { down = false; canvas.style.cursor = ''; });
  let running = false; const start = () => { if (!running) { running = true; requestAnimationFrame(loop); } };
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) start(); }).observe(hero);

  let busy = false;
  function loop(now) {
    if (!visible) { running = false; return; }
    requestAnimationFrame(loop);
    const r = hero.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(r.height - innerHeight, 1));
    const intro = 1 - Math.pow(1 - clamp((now - t0) / 1800), 3);
    if (swapTo && !busy) {
      swapK += (0 - swapK) * 0.16;
      if (swapK < 0.03) {
        busy = true; const k = swapTo; swapTo = null;
        prep(k).then(o => { apply(o); busy = false; }).catch(() => { busy = false; });
      }
    } else if (!busy) swapK += (1 - swapK) * 0.07;
    const target = swapK * intro * (0.34 + 0.66 * p) + Math.sin(now * 0.0016) * 0.012 * intro;
    inflate += (target - inflate) * 0.12;
    uni.uInflate.value = inflate;
    meter.textContent = Math.round(clamp(inflate) * 100) + '%';

    let hit = false;
    if (pointer) {
      const cr = canvas.getBoundingClientRect();
      if (pointer.x > cr.left && pointer.x < cr.right && pointer.y > cr.top && pointer.y < cr.bottom) {
        ndc.set((pointer.x - cr.left) / cr.width * 2 - 1, -((pointer.y - cr.top) / cr.height) * 2 + 1);
        ray.setFromCamera(ndc, cam);
        const it = ray.intersectObject(mesh)[0];
        if (it && it.uv) { hit = true; mouseUv.lerp(it.uv, mouseUv.x < -1 ? 1 : 0.35); }
      }
      rot.y += ((pointer.x / innerWidth - 0.5) * 0.32 - rot.y) * 0.05;
      rot.x += ((pointer.y / innerHeight - 0.5) * 0.16 - rot.x) * 0.05;
    }
    uni.uMouse.value.copy(mouseUv);
    // spring: press towards target, overshoots on release
    const pt = hit ? (down ? 1.6 : 1) : 0;
    pv += (pt - press) * 0.12; pv *= 0.8; press += pv;
    uni.uPress.value = press;
    mesh.rotation.y = rot.y + (p - 0.2) * 0.22;
    mesh.rotation.x = rot.x;
    renderer.render(scene, cam);
  }
  start();
}
if (!RM && !PHONE) initGL();
