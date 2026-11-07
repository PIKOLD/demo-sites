// Barballetta — «Дом пудрового банта». Демо-концепт.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const NS = 'http://www.w3.org/2000/svg';
const WA = 'https://wa.me/79288004057';

/* ---------- 1. wordmark: fit to width ---------- */
const stage = $('#heroStage');
function fitWordmark() {
  if (!stage) return;
  const mobile = innerWidth <= 760;
  const span = $(mobile ? '.wm--top .wm__m' : '.wm--top .wm__d', stage);
  if (!span) return;
  stage.style.setProperty('--fs', '100px');
  const w = span.getBoundingClientRect().width || 1;
  const target = stage.clientWidth * (mobile ? .92 : .965);
  let fs = 100 * target / w;
  if (!mobile) fs = Math.min(fs, innerHeight * .3);
  stage.style.setProperty('--fs', fs.toFixed(1) + 'px');
}
fitWordmark();
// drop finished intro animations so the letters leave their compositor layers
setTimeout(() => document.documentElement.classList.add('intro-done'), 2600);
document.fonts && document.fonts.ready.then(fitWordmark);
addEventListener('resize', fitWordmark);

/* ---------- 2. embroidery stitches under headings ---------- */
const stitches = [];
let sid = 0;
function buildStitch(h) {
  h.querySelector('.stitch-svg')?.remove();
  const range = document.createRange(); range.selectNodeContents(h);
  const rects = [...range.getClientRects()];
  let w = Math.max(...rects.map(r => r.width), 40);
  w = Math.min(w, h.clientWidth || w);
  const id = 'sm' + (sid++);
  let d = 'M2 14', x = 2, i = 0;
  const step = 34;
  while (x + step < w - 30) { d += ` Q ${x + step / 2} ${i % 2 ? 22 : 6} ${x + step} 14`; x += step; i++; }
  d += ` C ${x + 14} 14 ${x + 26} 2 ${x + 18} -4 S ${x + 4} 6 ${x + 20} 16 L ${Math.max(x + 24, w - 2)} 16`;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'stitch-svg'); svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('viewBox', `0 -8 ${w} 36`); svg.style.width = w + 'px';
  svg.innerHTML = `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-20" y="-30" width="${w + 40}" height="80"><path class="mk" d="${d}"/></mask></defs>
    <path class="st" d="${d}" mask="url(#${id})"/>
    <g class="needle"><line x1="-16" y1="0" x2="12" y2="0" stroke="#8d8a88" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="-11" cy="0" rx="3" ry="1.2" fill="none" stroke="#8d8a88" stroke-width="1"/><circle cx="12" cy="0" r=".9" fill="#5c5a58"/></g>`;
  h.appendChild(svg);
  const mk = svg.querySelector('.mk'), path = svg.querySelector('.st'), needle = svg.querySelector('.needle');
  const L = path.getTotalLength();
  mk.style.strokeDasharray = L;
  return { h, svg, mk, path, needle, L, p: 0, shown: -1 };
}
function renderStitch(s) {
  if (Math.abs(s.p - s.shown) < .002) return;
  s.shown = s.p;
  s.mk.style.strokeDashoffset = s.L * (1 - s.p);
  const l = s.L * s.p, pt = s.path.getPointAtLength(l), pt2 = s.path.getPointAtLength(Math.min(s.L, l + 2));
  const a = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;
  s.needle.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${a})`);
  s.needle.style.opacity = s.p > .01 && s.p < .995 ? 1 : 0;
}
function initStitches() {
  stitches.length = 0;
  $$('.stitch').forEach(h => {
    if (!h.offsetParent) return;
    const s = buildStitch(h);
    s.p = RM ? 1 : 0; stitches.push(s); renderStitch(s);
  });
}
document.fonts ? document.fonts.ready.then(() => { initStitches(); onScroll(); }) : initStitches();
let rzT; addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(() => { const old = new Map(stitches.map(s => [s.h, s.p])); initStitches(); stitches.forEach(s => { s.p = Math.max(s.p, old.get(s.h) || 0); s.shown = -1; renderStitch(s); }); }, 200); });

/* ---------- 3. scroll-driven: hero split, stitches, photo zoom ---------- */
const wmTop = $('.wm--top'), wmBot = $('.wm--bot'), heroImg = $('.hero__item img');
const splitImgs = $$('.split__ph img'), fab = $('.fab');
let ticking = false;
function onScroll() {
  ticking = false;
  const vh = innerHeight, y = scrollY;
  fab && fab.classList.toggle('on', y > vh * .8);
  if (!RM) {
    if (y < vh * 1.3 && wmTop) {
      wmTop.style.transform = y ? `translateY(${(-y * .22).toFixed(1)}px)` : '';
      wmBot.style.transform = y ? `translateY(${(y * .12).toFixed(1)}px)` : '';
      heroImg.style.transform = `translate3d(0,${y * .05}px,0) scale(${1 + y / vh * .1})`;
    }
    for (const im of splitImgs) {
      const r = im.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const k = clamp((vh - r.top) / (vh + r.height));
      im.style.transform = `scale(${1.14 - k * .1}) translate3d(0,${(k - .5) * -30}px,0)`;
    }
    for (const s of stitches) {
      const r = s.h.getBoundingClientRect();
      const p = clamp((vh * .94 - r.bottom) / (vh * .42));
      if (p > s.p) { s.p = p; renderStitch(s); }
    }
  }
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

/* ---------- 4. cursor: needle point with a thread tail (catmull-rom, 12 pts) ---------- */
if (FINE && !RM) {
  const cv = $('#thread'), cx = cv.getContext('2d');
  document.documentElement.classList.add('cur-on');
  let dpr = 1, mx = -100, my = -100, pts = [], run = false, idle = 0;
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
  size(); addEventListener('resize', size);
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; idle = 0; if (!run) { run = true; requestAnimationFrame(draw); } }, { passive: true });
  document.addEventListener('pointerleave', () => { mx = my = -100; pts = []; });
  function draw() {
    pts.unshift([mx, my]); if (pts.length > 12) pts.length = 12;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, innerWidth, innerHeight);
    if (pts.length > 3) {
      const P = [pts[0], ...pts, pts[pts.length - 1]];
      cx.beginPath(); cx.moveTo(P[1][0], P[1][1]);
      for (let i = 1; i < P.length - 2; i++) {
        const [x0, y0] = P[i - 1], [x1, y1] = P[i], [x2, y2] = P[i + 1], [x3, y3] = P[i + 2];
        cx.bezierCurveTo(x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6, x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6, x2, y2);
      }
      const g = cx.createLinearGradient(pts[0][0], pts[0][1], pts[pts.length - 1][0], pts[pts.length - 1][1] + .01);
      g.addColorStop(0, 'rgba(199,77,112,.95)'); g.addColorStop(1, 'rgba(231,154,174,0)');
      cx.strokeStyle = g; cx.lineWidth = 1.6; cx.lineCap = 'round'; cx.stroke();
    }
    cx.beginPath(); cx.arc(mx, my, 4.2, 0, Math.PI * 2); cx.fillStyle = '#6D0F1F'; cx.fill();
    cx.lineWidth = 1.2; cx.strokeStyle = '#FBF8F6'; cx.stroke();
    idle++;
    if (idle < 40) requestAnimationFrame(draw); else run = false;
  }
  // magnetic buttons
  $$('.mag').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .32}px)`; });
    b.addEventListener('pointerleave', () => { b.style.transition = 'transform .5s cubic-bezier(.2,.7,.1,1),background .3s,color .3s'; b.style.transform = ''; setTimeout(() => b.style.transition = '', 500); });
  });
  // taffeta sheen follows the pointer on fabric cards
  $$('.sheen').forEach(c => {
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.classList.add('live'); c.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); });
    c.addEventListener('pointerleave', () => { c.classList.remove('live'); c.style.removeProperty('--sx'); });
  });
}

/* ---------- 5. Дефиле ---------- */
const looks = $$('#looks .look').map((li, i) => ({ src: li.querySelector('img').getAttribute('src'), desc: li.dataset.desc, studio: !!li.querySelector('.look__ph--studio'), i }));
const pad2 = n => String(n).padStart(2, '0');
function hasGL() { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }
const wantGL = !RM && innerWidth > 900 && hasGL();
if (wantGL) {
  document.documentElement.classList.add('gl-on');
  import('three').then(T => initDefile(T)).catch(() => document.documentElement.classList.remove('gl-on'));
} else if (!RM) {
  // phone: horizontal scroll-snap strip with CSS perspective, ±18° for neighbours
  const strip = $('#looks');
  let t2 = false;
  const tilt = () => {
    t2 = false;
    if (innerWidth > 760) { $$('.look', strip).forEach(l => { l.style.removeProperty('--ry'); l.style.removeProperty('--sc'); }); return; }
    const sr = strip.getBoundingClientRect(), mid = sr.left + sr.width / 2;
    $$('.look', strip).forEach(l => {
      const r = l.getBoundingClientRect(), c = clamp((r.left + r.width / 2 - mid) / r.width, -1.5, 1.5);
      l.style.setProperty('--ry', (-c * 18).toFixed(2) + 'deg');
      l.style.setProperty('--sc', (1 - Math.min(Math.abs(c), 1) * .08).toFixed(3));
    });
  };
  strip.addEventListener('scroll', () => { if (!t2) { t2 = true; requestAnimationFrame(tilt); } }, { passive: true });
  addEventListener('resize', tilt); tilt();
}

function initDefile(THREE) {
  const sec = $('#defile'), st = $('#defStage'), canvas = $('#gl');
  const numEl = $('#lookNum'), idxEl = $('#lookIdx'), descEl = $('#lookDesc'), numP = numEl.parentElement;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { document.documentElement.classList.remove('gl-on'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
  const R = 10, W = 3.6, H = 4.8, GAP = .55, STEP = (W + GAP) / R, CAMZ = 7.6;
  camera.position.set(0, .15, CAMZ);
  camera.lookAt(0, 0, -R);
  const ring = new THREE.Group(); ring.rotation.x = .02; ring.position.y = -.55; scene.add(ring);

  const geo = new THREE.PlaneGeometry(W, H, 40, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), a = x / R; pos.setXYZ(i, R * Math.sin(a), pos.getY(i), -R * Math.cos(a)); }
  geo.computeBoundingSphere();

  const vert = `
    uniform vec2 uMouse; uniform float uHover, uTime; varying vec2 vUv;
    void main(){
      vUv = uv; vec3 p = position;
      float d = distance(uv, uMouse);
      vec3 n = normalize(vec3(-p.x, 0., -p.z));
      p += n * sin(d*16. - uTime*3.2) * .07 * uHover * exp(-d*3.5);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
    }`;
  const frag = `
    precision highp float;
    uniform sampler2D uTex; uniform vec2 uScale, uOffset, uMouse; uniform float uHover, uTime, uDim, uReady; uniform vec3 uBg, uPaper;
    varying vec2 vUv;
    void main(){
      vec2 uv = vUv; vec2 q = uv - uMouse; float d = length(q);
      float wave = sin(d*42. - uTime*5.) * exp(-d*5.) * uHover;
      uv += normalize(q + 1e-4) * wave * .011;
      uv.x += sin(uv.y*10. + uTime*1.3) * .0035 * uHover;
      vec2 t = uv * uScale + uOffset;
      vec3 c = texture2D(uTex, t).rgb;
      if (t.x < 0. || t.x > 1. || t.y < 0. || t.y > 1.) c = uPaper;
      c = mix(uPaper, c, uReady);
      // anisotropic taffeta sheen: a long thin band that crawls after the pointer
      vec2 ax = normalize(vec2(.32, 1.)); vec2 ay = vec2(ax.y, -ax.x);
      float al = dot(q, ax), ac = dot(q, ay);
      float band = exp(-ac*ac*70.) * exp(-al*al*2.2) * (.6 + .4*sin(al*26. - uTime*2.4));
      float rib = .5 + .5*sin((uv.x*.32 + uv.y)*180.);
      c += vec3(1., .94, .95) * band * (.26 + .08*rib) * uHover;
      c = mix(uBg, c, uDim);
      gl_FragColor = vec4(c, 1.);
    }`;
  const bg = new THREE.Vector3(243 / 255, 195 / 255, 204 / 255);
  const loader = new THREE.TextureLoader();
  const meshes = looks.map((L, i) => {
    const u = {
      uTex: { value: null }, uScale: { value: new THREE.Vector2(1, 1) }, uOffset: { value: new THREE.Vector2(0, 0) },
      uMouse: { value: new THREE.Vector2(.5, .5) }, uHover: { value: 0 }, uTime: { value: 0 }, uDim: { value: 1 }, uReady: { value: 0 },
      uBg: { value: bg }, uPaper: { value: L.studio ? new THREE.Vector3(.984, .973, .965) : new THREE.Vector3(.91, .7, .75) }
    };
    const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: u, vertexShader: vert, fragmentShader: frag }));
    const pivot = new THREE.Object3D(); pivot.rotation.y = -i * STEP; pivot.add(m); ring.add(pivot);
    m.userData = { u, hT: 0, mT: new THREE.Vector2(.5, .5), i };
    loader.load(L.src, tex => {
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const ia = tex.image.width / tex.image.height, pa = W / H;
      // studio shots: contain with margin; lifestyle: cover
      if (L.studio) { const s = 1.12; if (ia > pa) { u.uScale.value.set(s, s * ia / pa); } else { u.uScale.value.set(s * pa / ia, s); } }
      else if (ia > pa) u.uScale.value.set(pa / ia, 1); else u.uScale.value.set(1, ia / pa);
      u.uOffset.value.set((1 - u.uScale.value.x) / 2, (1 - u.uScale.value.y) / 2);
      u.uTex.value = tex; m.userData.ready = true;
    });
    return m;
  });

  function size() {
    const w = st.clientWidth, h = st.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w / h < 1.3 ? 44 : 36; camera.updateProjectionMatrix();
  }
  size(); addEventListener('resize', size);

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(9, 9);
  let px = 0, py = 0;
  st.addEventListener('pointermove', e => { const r = st.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); px = ndc.x; py = ndc.y; });
  st.addEventListener('pointerleave', () => { ndc.set(9, 9); px = py = 0; });

  let visible = false, cur = 0, active = -1, t0 = performance.now();
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) loop(); }, { rootMargin: '100px' }).observe(sec);
  function progress() { const r = sec.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); }
  cur = clamp((progress() - .04) / .9) * (looks.length - 1);

  function loop() {
    if (!visible) return;
    requestAnimationFrame(loop);
    const t = (performance.now() - t0) / 1000;
    const target = clamp((progress() - .04) / .9) * (looks.length - 1);
    cur += (target - cur) * .085;
    ring.rotation.y = cur * STEP;
    camera.position.x += (px * .5 - camera.position.x) * .05;
    camera.position.y += (.15 + py * .25 - camera.position.y) * .05;
    camera.lookAt(0, 0, -R);

    ray.setFromCamera(ndc, camera);
    const hit = ndc.x < 2 ? ray.intersectObjects(meshes, false)[0] : null;
    for (const m of meshes) {
      const d = Math.abs(m.userData.i - cur), k = clamp(1 - d), e = k * k * (3 - 2 * k);
      m.position.z = e * 2.3; m.scale.setScalar(1 + .12 * e);
      const u = m.userData.u;
      u.uDim.value = 1 - clamp(d / 3.2) * .5;
      u.uTime.value = t;
      const isHit = hit && hit.object === m;
      if (isHit) m.userData.mT.copy(hit.uv);
      u.uHover.value += ((isHit ? 1 : 0) - u.uHover.value) * .07;
      u.uMouse.value.lerp(m.userData.mT, .12);
      if (m.userData.ready) u.uReady.value = Math.min(1, u.uReady.value + .05);
    }
    canvas.style.cursor = hit ? 'none' : '';
    const a = Math.round(cur);
    if (a !== active) {
      active = a; numP.classList.add('swap');
      requestAnimationFrame(() => { numEl.textContent = idxEl.textContent = pad2(a + 1); descEl.textContent = looks[a].desc; numP.classList.remove('swap'); });
    }
    renderer.render(scene, camera);
  }
  visible = true; loop();
}

/* ---------- 6. Ателье: ваш цвет, ваш размер ---------- */
const MODELS = {
  tulip: { acc: 'костюм «Tulip»', type: 'order' },
  krep: { acc: 'комплект из премиального крепа и вискозы', type: 'order' },
  tafta: { acc: 'комплект из натуральной тафты', type: 'order' },
  dvoyka: { acc: 'двойку', type: 'reserve' },
  trench: { acc: 'тренч', type: 'reserve' }
};
const COLORS = {
  powder: { name: 'пудра', bg: '#F3C3CC' }, tafta: { name: 'розовый тафты', bg: '#E79AAE' },
  bordo: { name: 'бордо', bg: '#6D0F1F', dark: 1 }, cream: { name: 'крем', bg: '#EADCC3' },
  black: { name: 'чёрный', bg: '#0E0C0C', dark: 1 }, own: { name: '', bg: '#FBF8F6' }
};
const at = $('#at'), atSec = $('#atelier');
if (at) {
  const own = $('#atOwn'), size = $('#atSize'), msgEl = $('#atMsg'), send = $('#atSend'), note = $('#atNote');
  const val = n => (at.querySelector(`input[name="${n}"]:checked`) || {}).value;
  function message() {
    const m = MODELS[val('model')], c = val('color');
    const color = c === 'own' ? (own.value.trim() || 'свой цвет — обсудим') : COLORS[c].name;
    const sz = size.value.trim();
    if (val('type') === 'reserve')
      return `Здравствуйте! Хочу забронировать к поступлению ${m.acc} в цвете ${color}. Размер: ${sz || 'подскажите, какие размеры будут'}.`;
    return `Здравствуйте! Хочу заказать пошив: ${m.acc} в цвете ${color}. Размер / мерки: ${sz || 'подскажите, какие мерки нужны'}.`;
  }
  function update() {
    const c = val('color'), C = COLORS[c];
    own.hidden = c !== 'own';
    atSec.style.setProperty('--at-bg', C.bg);
    atSec.classList.toggle('dark', !!C.dark);
    const t = message();
    msgEl.textContent = t;
    send.href = WA + '?text=' + encodeURIComponent(t);
  }
  at.addEventListener('change', e => {
    if (e.target.name === 'model') { const r = at.querySelector(`input[name="type"][value="${MODELS[e.target.value].type}"]`); if (r) r.checked = true; }
    update();
  });
  at.addEventListener('input', update);
  $$('[data-pick]').forEach(b => b.addEventListener('click', () => {
    const r = at.querySelector(`input[name="model"][value="${b.dataset.pick}"]`);
    if (r) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
  }));
  $('#atCopy').addEventListener('click', async () => {
    const t = message();
    try { await navigator.clipboard.writeText(t); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (_) {} ta.remove(); }
    note.textContent = 'Текст скопирован — вставьте его в чат WhatsApp ателье.';
  });
  update();
}
