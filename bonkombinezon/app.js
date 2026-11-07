(() => {
// BONKOMBINEZON — «Спуск до −40°С». Scroll = temperature.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const fmtT = v => (Math.round(v) < 0 ? '−' + Math.abs(Math.round(v)) : '0');

const body = document.body;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lite = matchMedia('(max-width: 760px)').matches || matchMedia('(pointer: coarse)').matches;
if (lite) body.classList.add('lite');

/* ---------- picker ---------- */
const range = $('#tRange');
const MODELS = {
  demi: { name: 'Демисезонный', short: 'Демисезонный комбинезон',
    why: 'До −10°С хватит демисезона: брюки из плотного softshell на флисе, не промокает и не продувается.',
    list: ['до −10°С', 'воротник-стойка', 'карман для ski-pass', 'молнии для горнолыжной обуви'],
    colors: ['Серый меланж', 'другой — попросить фото'] },
  grand: { name: '«Гранд»', short: 'Гранд',
    why: 'Прочная ветрозащитная мембранная ткань — и для прогулок, и для горных лыж. Неприхотливая, отталкивает воду и грязь.',
    list: ['до −40°С', '12 оттенков', '7 вариантов ростовок от XS до XXL', 'комплект: комбинезон + сумка + варежки'],
    colors: ['Кедр', 'Клюква', 'другой из 12 — попросить фото'] },
  lux: { name: '«Люкс»', short: 'Люкс',
    why: 'Самая мягкая и невесомая — но при этом самая тёплая модель во всей линейке.',
    list: ['самая тёплая в линейке', 'самая мягкая и невесомая', '7 вариантов ростовок'],
    colors: ['попросить фото оттенков'] },
  taiga: { name: '«Гранд» Тайга', short: 'Гранд Тайга',
    why: 'Пышный натуральный мех размера XXL — комбинезон, который вызывает визуальный восторг. До −40°С.',
    list: ['ветро- и влагозащитная мембрана', 'магнитная ветрозащитная планка', 'флисовый подклад', 'комплект: комбинезон «Гранд» + сумка + варежки'],
    colors: ['попросить фото оттенков'] },
  suit: { name: 'Куртка + брюки', short: 'костюм (куртка + брюки)',
    why: 'Новинка до −40°С: потрясающе мягкий и тёплый костюм для русской зимы.',
    list: ['мембрана 3000/3000', 'утеплитель Atmo Snow 200 г', 'натуральный мех финского енота', 'карман ski-pass и внутренний карман для телефона', 'ширина регулируется кулисой'],
    colors: ['попросить фото оттенков'],
    price: 'куртка 17 990 ₽ + брюки 9 990 ₽ = 27 980 ₽ · варежки 2 490 ₽' }
};
const MODE_TXT = { city: 'Для прогулок по городу', ski: 'Для лыж', kids: 'Для прогулок с детьми' };
let curModel = null;
const val = n => ($(`input[name=${n}]:checked`) || {}).value;

function renderColors(m) {
  const box = $('#colorChips');
  const prev = val('color');
  box.innerHTML = m.colors.map((c, i) => {
    const dot = c === 'Кедр' ? '#3E2B22' : c === 'Клюква' ? '#A3122A' : c === 'Серый меланж' ? '#9a9a98' : '';
    return `<label class="chip"><input type="radio" name="color" value="${c}"${(prev ? prev === c : i === (m === MODELS.grand ? 1 : 0)) ? ' checked' : ''}><span>${dot ? `<i class="dot" style="background:${dot}"></i>` : ''}${c}</span></label>`;
  }).join('');
  if (!val('color')) box.querySelector('input').checked = true;
}
function pick() {
  const cold = +range.value, mode = val('mode'), want = val('want');
  let k;
  if (want === 'suit') k = 'suit';
  else if (cold <= 10) k = 'demi';
  else if (want === 'soft') k = 'lux';
  else if (want === 'fur') k = 'taiga';
  else if (mode === 'ski' || mode === 'kids') k = 'grand';
  else k = cold >= 30 ? 'lux' : 'grand';
  const m = MODELS[k];
  if (m !== curModel) { curModel = m; renderColors(m); }
  const t = cold ? '−' + cold : '0';
  $('#tOut').textContent = t + '°С';
  $('#resT').textContent = t + '°С · ' + MODE_TXT[mode].replace('Для ', '').toLowerCase();
  $('#resName').textContent = m.name;
  let why = m.why;
  if (k === 'demi' && mode === 'ski') why += ' Есть молнии для горнолыжной обуви.';
  if (k === 'lux' && want !== 'soft') why += ' На −30° и ниже в городе — самый тёплый вариант.';
  $('#resWhy').textContent = why;
  $('#resList').innerHTML = m.list.map(x => `<li>${x}</li>`).join('');
  $('#resPrice').textContent = m.price || 'цена — у менеджера';
  const col = val('color');
  const colTxt = /фото/.test(col) ? 'цвет — пришлите фото оттенков' : 'цвет ' + col;
  const h = ($('#hIn').value || '').replace(/\D/g, '');
  $('#msg').value = `Здравствуйте! Подбор: ${m.short}, ${colTxt}, размер ${val('size')}, рост ${h || '__'}. ${MODE_TXT[mode]}. Самая холодная улица: ${t}°С.`;
}
$('#picker').addEventListener('input', pick);
$('#picker').addEventListener('change', pick);
$('#hIn').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, ''); pick(); });
$('#copyBtn').addEventListener('click', async () => {
  const ta = $('#msg'); const b = $('#copyBtn');
  try { await navigator.clipboard.writeText(ta.value); }
  catch { ta.select(); try { document.execCommand('copy'); } catch {} }
  b.textContent = 'Скопировано'; setTimeout(() => (b.textContent = 'Скопировать'), 1800);
});
$$('[data-suit]').forEach(a => a.addEventListener('click', () => { const r = $('input[name=want][value=suit]'); r.checked = true; pick(); }));
pick();

/* ---------- scroll → temperature ---------- */
const secs = $$('main section[data-t]');
let tops = [], docH = 1, vh = innerHeight;
function measure() {
  vh = innerHeight;
  tops = secs.map(s => s.getBoundingClientRect().top + scrollY);
  docH = document.documentElement.scrollHeight;
}
const tOf = s => s.dataset.t === 'pick' ? -(+range.value) : +s.dataset.t;
let T = 0, tone = 'dark';
function computeT() {
  const probe = scrollY + vh * 0.5;
  let i = 0;
  while (i < secs.length - 1 && probe >= tops[i + 1]) i++;
  const a = tOf(secs[i]);
  if (i === secs.length - 1) { tone = secs[i].dataset.tone; return a; }
  const f = smooth(0.4, 1, (probe - tops[i]) / (tops[i + 1] - tops[i]));
  tone = f > 0.5 ? secs[i + 1].dataset.tone : secs[i].dataset.tone;
  return lerp(a, tOf(secs[i + 1]), f);
}

const merc = $('.th-merc'), read = $('.th-read'), glass = $('.th-glass'), fillM = $('.tm-fill');
const nows = $$('.t-now');
const hdr = $('.hdr');
const meta = $('meta[name=theme-color]');
const STOPS = [[0, [163, 18, 42]], [-15, [62, 43, 34]], [-30, [195, 220, 236]], [-40, [245, 247, 249]]];
function bgAt(t) {
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [t0, c0] = STOPS[i], [t1, c1] = STOPS[i + 1];
    if (t <= t0 && t >= t1) { const f = (t0 - t) / (t0 - t1); return c0.map((c, j) => Math.round(lerp(c, c1[j], f))); }
  }
  return STOPS[STOPS.length - 1][1];
}
let lastShown = null;
function updateThermo() {
  const L = clamp((T + 40) / 40);
  const H = glass.clientHeight;
  merc.style.transform = `scaleY(${Math.max(L, 0.012)})`;
  read.style.transform = `translate3d(0,${(1 - L) * H}px,0) translateY(-50%)`;
  if (fillM) fillM.style.transform = `scaleX(${Math.max(L, 0.02)})`;
  const s = fmtT(T);
  if (s !== lastShown) { nows.forEach(n => (n.textContent = s)); lastShown = s; }
  body.classList.toggle('cold', tone === 'light');
  hdr.classList.toggle('solid', scrollY > 30);
  const c = bgAt(T); const css = `rgb(${c})`;
  document.documentElement.style.background = css;
  if (meta) meta.setAttribute('content', css);
}

/* ---------- hero object travels hero → loupe ---------- */
const trav = $('.traveler'), travImg = $('.traveler img');
const src = $('.hero-photo'), dst = $('.loupe');
const travelOn = !lite && !reduced && innerWidth > 1100;
if (travelOn) body.classList.add('travel-on');
let travelP = 0;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function travel() {
  if (!travelOn) return;
  const b = dst.getBoundingClientRect();
  const endY = b.top + scrollY + b.height / 2 - vh / 2;
  const startY = vh * 0.12;
  const raw = clamp((scrollY - startY) / Math.max(1, endY - startY));
  const p = ease(raw); travelP = raw;
  if (raw <= 0 || raw >= 1) {
    trav.classList.remove('show');
    src.classList.remove('hide-src'); dst.classList.remove('hide-src');
    return;
  }
  const a = src.getBoundingClientRect();
  src.classList.add('hide-src'); dst.classList.add('hide-src');
  trav.classList.add('show');
  const x = lerp(a.left, b.left, p), y = lerp(a.top, b.top, p);
  trav.style.width = lerp(a.width, b.width, p) + 'px';
  trav.style.height = lerp(a.height, b.height, p) + 'px';
  trav.style.transform = `translate3d(${x}px,${y}px,0)`;
  travImg.style.transform = `scale(${1 + 0.3 * p})`;
}

/* ---------- parallax words ---------- */
const tWord = $('.taiga-word'), tSec = $('#taiga');
function parallax() {
  if (reduced) return;
  const r = tSec.getBoundingClientRect();
  if (r.bottom > 0 && r.top < vh) tWord.style.transform = `translate3d(${(r.top / vh) * -6}vw,0,0)`;
}

/* ---------- magnetic buttons ---------- */
if (!lite && !reduced) {
  $$('.btn').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    b.addEventListener('pointerleave', () => (b.style.transform = ''));
  });
}

/* ---------- hero count-in 0 → −40 ---------- */
const nums = $$('.hero-num');
let intro = 0;
if (!reduced) {
  const t0 = performance.now(), D = 1500;
  const stepCount = now => {
    const k = clamp((now - t0) / D);
    const v = -Math.round(40 * (1 - Math.pow(1 - k, 3)));
    const s = (v < 0 ? '−' + Math.abs(v) : '0') + '°C';
    nums.forEach(n => (n.textContent = s));
    if (k < 1) requestAnimationFrame(stepCount);
  };
  requestAnimationFrame(stepCount);
}

/* ---------- main loop ---------- */
let dirty = true;
const mark = () => (dirty = true);
addEventListener('scroll', mark, { passive: true });
addEventListener('resize', () => { measure(); mark(); if (gl) gl.resize(); });
range.addEventListener('input', mark);
measure();
new ResizeObserver(() => { measure(); mark(); }).observe(document.body);

let gl = null;
let last = performance.now(), t0 = last;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (dirty) { T = computeT(); updateThermo(); travel(); parallax(); }
  const wasDirty = dirty; dirty = false;
  if (gl) {
    const el = (now - t0) / 1000;
    intro = reduced ? 0 : (el < 1.5 ? smooth(0, 1.5, el) : 1 - smooth(1.6, 3.4, el));
    if (!reduced || wasDirty || gl.first) gl.render(reduced ? 0 : dt, el);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
addEventListener('load', () => { measure(); mark(); });

/* ---------- WebGL snow + frost ---------- */
function hasGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}
if (!hasGL()) body.classList.add('no-gl');
else {
  (async () => {
    try { const THREE = await import('three'); gl = initGL(THREE); }
    catch (e) { body.classList.add('no-gl'); gl = null; }
  })();
}

function initGL(THREE) {
  const canvas = $('#snow');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  const PR = Math.min(devicePixelRatio || 1, lite ? 1.5 : 1.75);
  renderer.setPixelRatio(PR);
  const scene = new THREE.Scene();
  const cam = new THREE.Camera();
  const N = lite ? 1200 : 7200;
  const pos = new Float32Array(N * 3), sp = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = Math.random(); pos[i * 3 + 1] = Math.random(); pos[i * 3 + 2] = Math.pow(Math.random(), 1.6);
    sp[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSp', new THREE.BufferAttribute(sp, 1));
  const NOISE = `
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}`;
  const U = {
    uRes: { value: new THREE.Vector2(innerWidth, innerHeight) }, uFall: { value: 0 }, uDrift: { value: 0 },
    uTime: { value: 0 }, uCold: { value: 0 }, uPR: { value: PR }, uMouse: { value: new THREE.Vector2(-999, -999) },
    uVel: { value: new THREE.Vector2() }, uGust: { value: lite ? 0 : 1 }, uColor: { value: new THREE.Color(1, 1, 1) }, uAlpha: { value: 1 }
  };
  const snowMat = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthTest: false, depthWrite: false,
    vertexShader: `
      uniform vec2 uRes; uniform float uFall, uDrift, uTime, uCold, uPR, uGust; uniform vec2 uMouse, uVel;
      attribute float aSp; varying float vA;
      ${NOISE}
      void main(){
        float depth = position.z;
        float sp = .45 + aSp*.5 + depth*.75;
        float W = uRes.x + 80., H = uRes.y + 80.;
        float y = mod(position.y*H + uFall*sp, H) - 40.;
        float n = noise(vec2(position.x*14. + uTime*.18, y*.004 + aSp*9.));
        float x = position.x*W + uDrift*sp + sin(uTime*(.5+aSp) + position.y*40.)*(8.+depth*16.) + (n-.5)*mix(50.,150.,uCold);
        x = mod(x, W) - 40.;
        vec2 p = vec2(x, y);
        vec2 d = p - uMouse;
        float f = exp(-dot(d,d)/(170.*170.)) * uGust;
        p += uVel*f*16. + normalize(d+.001)*f*min(length(uVel),40.)*3.;
        gl_Position = vec4(p.x/uRes.x*2.-1., 1.-p.y/uRes.y*2., 0., 1.);
        gl_PointSize = mix(1.6, 4.6, depth*depth) * mix(1., 1.9, uCold) * uPR;
        vA = mix(.4, .95, depth);
      }`,
    fragmentShader: `
      uniform vec3 uColor; uniform float uAlpha; varying float vA;
      void main(){ float d = length(gl_PointCoord-.5); float a = smoothstep(.5,0.,d); a*=a;
        gl_FragColor = vec4(uColor, a*vA*uAlpha); }`
  });
  const pts = new THREE.Points(geo, snowMat); pts.frustumCulled = false; scene.add(pts);

  // frost quads
  const frostTargets = lite ? [] : [
    { el: () => (trav.classList.contains('show') ? trav : src), base: .5, vis: () => 1 - smooth(0.15, 0.6, travelP) },
    { el: () => $('.taiga-photo'), base: .25, vis: () => 1 }
  ];
  const frosts = frostTargets.map(ft => {
    const u = { uRect: { value: new THREE.Vector4() }, uRes: U.uRes, uAmt: { value: 0 }, uTime: U.uTime };
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: u, transparent: true, depthTest: false, depthWrite: false,
      vertexShader: `uniform vec4 uRect; uniform vec2 uRes; varying vec2 vUv;
        void main(){ vUv = uv; vec2 px = uRect.xy + vec2(uv.x, 1.-uv.y)*uRect.zw;
          gl_Position = vec4(px.x/uRes.x*2.-1., 1.-px.y/uRes.y*2., 0., 1.); }`,
      fragmentShader: `uniform vec4 uRect; uniform float uAmt, uTime; varying vec2 vUv;
        ${NOISE}
        void main(){
          vec2 sz = uRect.zw; vec2 px = vUv*sz;
          float edge = min(min(px.x, sz.x-px.x), min(px.y, sz.y-px.y));
          float reach = mix(8., .19*min(sz.x, sz.y), uAmt);
          vec2 q = px/85.;
          float n = fbm(q);
          float r = 1. - abs(fbm(q*2.4 + n*1.8)*2. - 1.);
          r = pow(r, 5.);
          float br = 1. - abs(noise(q*7.)*2.-1.); br = pow(br, 8.);
          float m = 1. - smoothstep(0., reach, edge + (n-.5)*reach*1.1);
          m = m*m; float frost = m*(.22 + r*.75 + br*.35);
          float h = hash(floor(px/3.));
          float spk = step(.988, h) * m * (.5 + .5*sin(uTime*3. + h*60.));
          float a = clamp(frost*.78 + spk*.7, 0., .85) * smoothstep(0., .12, uAmt);
          gl_FragColor = vec4(vec3(.93, .97, 1.), a);
        }`
    }));
    m.frustumCulled = false; m.renderOrder = 2; scene.add(m);
    return { ft, m, u };
  });
  pts.renderOrder = 3;

  // pointer → gust
  const mouse = { x: -999, y: -999, px: -999, py: -999 };
  const vel = new THREE.Vector2();
  if (!lite) addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  const white = new THREE.Color(1, 1, 1), iceInk = new THREE.Color(0x6f98b7);
  const tmpC = new THREE.Color();
  let toneK = 0;
  const api = {
    first: true,
    resize() { renderer.setSize(innerWidth, innerHeight, false); U.uRes.value.set(innerWidth, innerHeight); api.first = true; },
    render(dt, el) {
      const cold = clamp(-T / 40);
      const c = reduced ? cold : Math.max(cold, intro * .85);
      U.uCold.value = c;
      U.uTime.value = el;
      const blizz = smooth(.72, 1, c);
      U.uFall.value += dt * lerp(45, 190, c);
      U.uDrift.value += dt * (lerp(6, 40, c) + blizz * 560);
      const cnt = Math.floor(N * lerp(lite ? .45 : .22, 1, c));
      geo.setDrawRange(0, cnt);
      // pointer velocity
      if (mouse.px > -999) vel.lerp(new THREE.Vector2(mouse.x - mouse.px, mouse.y - mouse.py), .35);
      vel.multiplyScalar(.9);
      mouse.px = mouse.x; mouse.py = mouse.y;
      U.uMouse.value.set(mouse.x, mouse.y); U.uVel.value.copy(vel);
      toneK = lerp(toneK, tone === 'light' ? 1 : 0, reduced ? 1 : .06);
      tmpC.copy(white).lerp(iceInk, toneK); U.uColor.value.copy(tmpC);
      U.uAlpha.value = lerp(.9, .8, toneK);
      for (const f of frosts) {
        const el2 = f.ft.el(); const r = el2.getBoundingClientRect();
        const vis = f.ft.vis();
        const on = vis > .01 && r.bottom > 0 && r.top < innerHeight && r.width > 0 && getComputedStyle(el2).visibility !== 'hidden';
        f.m.visible = on;
        if (on) { f.u.uRect.value.set(r.left, r.top, r.width, r.height); f.u.uAmt.value = clamp(f.ft.base + (1 - f.ft.base) * cold) * vis; }
      }
      renderer.render(scene, cam);
      api.first = false;
    }
  };
  api.resize();
  return api;
}

})();
