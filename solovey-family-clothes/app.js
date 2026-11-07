// Solovey Family — «Стол мастерской». Демо-концепт.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => 1 - Math.pow(1 - t, 3);
document.documentElement.classList.add('js');

/* ---------- ткани и вещи (строго из подписей) ---------- */
const FAB = {
  kofe:    { n: 'ёлочка кофе',        c: '#7A5638', p: 0 },
  green:   { n: 'зелёная ёлочка',     c: '#3F5A35', p: 0 },
  polyn:   { n: 'ёлочка полынь',      c: '#8E9B86', p: 0 },
  olive:   { n: 'горчичная оливка',   c: '#9E9B3C', p: 2 },
  choc:    { n: 'шоколад',            c: '#4E2C1D', p: 2 },
  burg:    { n: 'бургунди',           c: '#6A1C2B', p: 2 },
  fig:     { n: 'инжир',              c: '#6E4A5E', p: 2 },
  emerald: { n: 'изумрудный вельвет', c: '#1E5A3C', p: 1 },
  terra:   { n: 'терракотовая ёлочка', c: '#B4533A', p: 0 },
};
const PAT = ['pat-h', 'pat-c', 'pat-m'];
const ITEMS = [
  { k: 'neapol',   n: 'Пиджак «Неаполь»',              s: 'Пиджак Неаполь',     price: 15500, f: 'kofe',    note: 'в подписях бывает 15 200 ₽ — цена зависит от ткани' },
  { k: 'skirt',    n: 'Юбка из итальянской шерсти',    s: 'Юбка',               price: 11500, f: 'olive' },
  { k: 'sweater',  n: 'Свитер из мериноса',            s: 'Свитер из мериноса', price: 11500, f: 'burg' },
  { k: 'trousers', n: 'Брюки из итальянского вельвета', s: 'Брюки из вельвета', price: 9500,  f: 'emerald' },
  { k: 'qvest',    n: 'Стёганый жилет из шерсти',      s: 'Стёганый жилет',     price: 14500, f: 'choc',    note: 'утеплённый, из итальянской шерсти' },
  { k: 'vest',     n: 'Жилет из итальянской шерсти',   s: 'Жилет',              price: 9500,  f: 'olive' },
  { k: 'oslo',     n: 'Бушлат «Осло»',                 s: 'Бушлат Осло',        price: 17800, f: 'polyn',   note: 'утеплённый, на температуру 5+' },
  { k: 'overshot', n: 'Овершот',                       s: 'Овершот',            price: 15200, f: 'kofe',    note: 'шерсть, подкладка из вискозы' },
];
const IT = Object.fromEntries(ITEMS.map(i => [i.k, i]));
const rub = n => n.toLocaleString('ru-RU').replace(/[\s ]/g, ' ') + ' ₽';

const rolls = [];
let sel = new Map([['neapol', 'kofe'], ['skirt', 'olive']]);
let activeItem = 'neapol';
let bump = 0, bumpT = 0;

/* ---------- конструктор ---------- */
const itemsBox = $('#b-items');
if (itemsBox) {
  const opts = Object.entries(FAB).filter(([k]) => k !== 'terra').map(([k, f]) => `<option value="${k}">${f.n}</option>`).join('');
  itemsBox.innerHTML = ITEMS.map(i => `
    <div class="item" data-k="${i.k}">
      <label class="pick"><input type="checkbox" aria-label="${i.n}"><span><span class="i-name">${i.n}</span>${i.note ? `<span class="i-note">${i.note}</span>` : ''}</span></label>
      <span class="i-price">${rub(i.price)}</span>
      <select aria-label="Ткань: ${i.n}">${opts}</select>
    </div>`).join('');
  $$('.item', itemsBox).forEach(row => {
    const k = row.dataset.k, cb = $('input', row), sl = $('select', row);
    cb.addEventListener('change', () => {
      if (cb.checked) { sel.set(k, sl.value); activeItem = k; setFabric(sl.value); }
      else sel.delete(k);
      sync();
    });
    sl.addEventListener('change', () => { sel.set(k, sl.value); activeItem = k; setFabric(sl.value); sync(); });
    row.addEventListener('pointerenter', () => { if (sel.has(k)) setFabric(sel.get(k), true); });
  });
  $$('.meas input').forEach(i => i.addEventListener('input', sync));
  sync();
}

function sync() {
  $$('.item').forEach(row => {
    const k = row.dataset.k, on = sel.has(k);
    row.classList.toggle('on', on);
    $('input', row).checked = on;
    $('select', row).value = on ? sel.get(k) : IT[k].f;
  });
  const list = [...sel].map(([k, f]) => ({ i: IT[k], f: FAB[f] }));
  $('#b-list').innerHTML = list.length
    ? list.map(({ i, f }) => `<li><span>${i.n} · ${f.n}</span><b>${rub(i.price)}</b></li>`).join('')
    : '<li><span>отметьте вещи справа</span><b>—</b></li>';
  $('#b-total').textContent = rub(list.reduce((s, x) => s + x.i.price, 0));
  const m = Object.fromEntries($$('.meas input').map(i => [i.name, i.value.trim()]));
  const parts = [['h', 'рост'], ['chest', 'обхват груди'], ['waist', 'обхват талии'], ['hips', 'обхват бёдер'], ['len', 'длина изделия']]
    .filter(([k]) => m[k]).map(([k, l]) => `${l} ${m[k]} см`);
  const set = list.length ? `Хочу сет: ${list.map(({ i, f }) => `${i.s} (${f.n})`).join(' + ')}.` : 'Хочу заказать пошив по меркам.';
  $('#b-msg').value = `Здравствуйте! ${set} Мерки: ${parts.length ? parts.join(', ') + '.' : 'пришлю отдельно.'}`;
}

function setFabric(key, quiet) {
  const f = FAB[key]; if (!f) return;
  const st = $('[data-stage="builder"]');
  if (st && st.dataset.fab !== key) {
    st.dataset.fab = key;
    st.style.setProperty('--fab', f.c);
    const cc = $('.css-cloth', st); cc.classList.remove(...PAT); cc.classList.add(PAT[f.p]);
    if (!quiet) { bump = .2; bumpT = performance.now(); }
    rolls.filter(r => r.stage === st).forEach(r => r.setFabric(f));
    if (!quiet && !RM) { const tag = $("#b-tag"); tag.classList.remove("in"); void tag.offsetWidth; tag.classList.add("in"); }
  }
  $('#b-fabname').textContent = f.n;
  $$('.swatch[data-fab]').forEach(s => s.classList.toggle('on', s.dataset.fab === key));
}

async function copyMsg() {
  const t = $('#b-msg').value;
  try { await navigator.clipboard.writeText(t); }
  catch { const a = $('#b-msg'); a.select(); try { document.execCommand('copy'); } catch {} }
  $('#b-status').textContent = 'текст скопирован — вставьте его в чат';
}
$('#b-copy')?.addEventListener('click', copyMsg);
$('#b-tg')?.addEventListener('click', copyMsg);
$('#b-ig')?.addEventListener('click', copyMsg);

$$('[data-set]').forEach(b => b.addEventListener('click', () => {
  sel = new Map(b.dataset.set.split(',').map(x => { const [k, f] = x.split(':'); return [k, f || IT[k].f]; }));
  activeItem = sel.keys().next().value;
  sync(); setFabric(sel.get(activeItem));
  $('#builder').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
}));
$$('.swatch[data-fab]').forEach(s => s.addEventListener('click', () => {
  const k = s.dataset.fab;
  if (sel.has(activeItem)) sel.set(activeItem, k);
  sync(); setFabric(k);
}));
setFabric('kofe', true);

/* ---------- сантиметровая лента ---------- */
const nums = $('.tape-nums'), readout = $('.tape-read b');
function buildTape() {
  const H = document.documentElement.scrollHeight, n = Math.floor(H / 40);
  let h = '';
  for (let i = 1; i <= n; i++) h += `<i style="top:${i * 40}px">${i}</i>`;
  nums.innerHTML = h;
}
buildTape();
addEventListener('load', buildTape);
let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { buildTape(); rolls.forEach(r => r.resize()); }, 150); });

/* ---------- появление: фото кладут на стол, бирки качаются ---------- */
if (!RM && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .2 });
  $$('.flat:not(.hero-photo), .swing:not(.tag--hero)').forEach(el => io.observe(el));
}

/* ---------- магнитные кнопки ---------- */
if (!RM && matchMedia('(pointer: fine)').matches) {
  $$('.magnet').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ---------- скролл-сцены ---------- */
const mouse = { x: -1e4, y: -1e4 };
addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
const heroStage = $('[data-stage="hero"]'), bStage = $('[data-stage="builder"]');
const floatCta = $('.float-cta'), ribbon = $('.ribbon'), ribbonWrap = $('.ribbon-wrap');
const wide = () => innerWidth >= 900;
const t0 = performance.now();

function heroP(now) {
  if (RM) return 1;
  const intro = .1 + .42 * ease(clamp((now - t0) / 1900));
  return clamp(intro + (1 - .52) * clamp(scrollY / (innerHeight * .45)));
}
function builderP(now) {
  if (RM || !bStage) return 1;
  const r = bStage.getBoundingClientRect();
  const k = clamp((now - bumpT) / 900);
  const b = bump * Math.sin(Math.PI * k);
  return clamp(.5 + .45 * clamp((innerHeight - r.top) / (innerHeight * .8)) - Math.abs(b));
}

let lastY = -1;
function tick(now) {
  const vh = innerHeight, y = scrollY;
  if (y !== lastY) {
    readout.textContent = Math.round((y + vh / 2) / 40);
    floatCta?.classList.toggle('show', y > vh * .9 && !(bStage && Math.abs(bStage.getBoundingClientRect().top) < vh * .6));
    if (ribbon && wide() && !RM) {
      ribbonWrap.style.overflowX = 'hidden';
      const r = ribbonWrap.getBoundingClientRect();
      const t = clamp((vh - r.top) / (vh + r.height));
      ribbon.style.transform = `translate3d(${-t * Math.max(0, ribbon.scrollWidth - ribbonWrap.clientWidth)}px,0,0)`;
    } else if (ribbon) { ribbonWrap.style.overflowX = ''; ribbon.style.transform = ''; }
    lastY = y;
  }
  const hp = heroP(now), bp = builderP(now);
  if (heroStage && !heroStage.classList.contains('gl')) heroStage.style.setProperty('--p', hp.toFixed(4));
  if (bStage && !bStage.classList.contains('gl')) bStage.style.setProperty('--p', bp.toFixed(4));
  for (const r of rolls) r.frame(now, r.stage === heroStage ? hp : bp, mouse);
  if (!RM) requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ---------- WebGL: рулон ткани (только десктоп, без reduced-motion) ---------- */
function hasGL() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } }
if (!RM && wide() && hasGL()) {
  import('three').then(T => {
    if (heroStage) rolls.push(new Roll(T, heroStage, FAB.terra));
    if (bStage) rolls.push(new Roll(T, bStage, FAB[bStage.dataset.fab || 'kofe']));
  }).catch(() => {});
}

const hex = c => { const n = parseInt(c.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };

const VS = /* glsl */`
uniform float uLen,uH,uFlat,uT,uR0,uX0,uRout,uLift,uSig,uTime;
uniform vec2 uMouse;
varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying float vRolled; varying float vLift;
void main(){
  float s=(position.x+.5)*uLen;
  float y=position.y*uH;
  vec3 p; vec3 n; float rolled=0.; float lift=0.;
  if(s<=uFlat){
    p=vec3(uX0+s,y,0.);
    vec2 d=p.xy-uMouse; float g=exp(-dot(d,d)/(uSig*uSig));
    lift=uLift*g; p.z=lift;
    vec2 grad=-2.*d/(uSig*uSig)*lift*2.6;
    float w=.07*sin(s*.018+y*.004+uTime*.5)+.04*sin(s*.041-uTime*.3);
    // ткань подтягивается к рулону
    float pull=smoothstep(uRout*3.,0.,uFlat-s);
    n=normalize(vec3(-grad.x+w-pull*.25,-grad.y,1.));
  }else{
    float d=s-uFlat;
    float r=sqrt(max(uRout*uRout-d*uT/3.14159,uR0*uR0));
    float th=6.28318*(uRout-r)/uT;
    p=vec3(uX0+uFlat+r*sin(th),y,uRout-r*cos(th));
    n=vec3(sin(th),0.,-cos(th));
    rolled=1.;
  }
  vUv=vec2(s,y); vN=n; vP=p; vRolled=rolled; vLift=lift;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
}`;
const FS = /* glsl */`
precision highp float;
uniform vec3 uColA,uColB; uniform float uPatA,uPatB,uMix,uRollX,uRout,uH,uTime,uLift,uSig; uniform vec2 uMouse;
varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying float vRolled; varying float vLift;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+1.),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n2(p);p*=2.03;a*=.5;}return s;}
vec3 weave(float pat,vec3 col,vec2 uv,vec3 n,vec3 L){
  float tone=1.; float spec=0.;
  if(pat<.5){
    float W=16.; float fx=fract(uv.x/W); float dir=mod(floor(uv.x/W),2.)*2.-1.;
    float t=fract((uv.y*dir+uv.x)/5.5);
    float yarn=smoothstep(0.,.5,t)*smoothstep(1.,.5,t);
    float seam=smoothstep(0.,.08,min(fx,1.-fx));
    tone=.74+.4*yarn; tone*=mix(.78,1.,seam);
    tone*=.86+.28*fbm(uv*.06);
    tone+=(h21(floor(uv*1.3))-.5)*.1;
  }else if(pat<1.5){
    float P=8.; float f=fract(uv.y/P); float rib=sin(f*3.14159);
    vec3 rn=normalize(n+vec3(0.,cos(f*3.14159)*.9,0.));
    float dif=.5+.6*max(dot(rn,L),0.);
    vec3 H=normalize(L+vec3(0.,0.,1.));
    float ax=dot(vec3(1.,0.,0.),H);
    float aniso=pow(sqrt(max(1.-ax*ax,0.)),24.);
    tone=(.5+.6*rib)*dif*1.2; spec=aniso*.28*rib*rib;
    tone*=.9+.2*fbm(uv*vec2(.04,.3));
  }else{
    float f=fbm(uv*.04); float g=fbm(uv*.32);
    tone=.8+.26*f+.14*(g-.5);
    tone*=.95+.05*sin((uv.x-uv.y)*1.2);
    tone+=(h21(floor(uv*.9))-.5)*.05;
  }
  return col*tone+spec*vec3(1.,.93,.8);
}
void main(){
  vec3 L=normalize(vec3(-.5,.6,1.));
  vec3 n=normalize(vN); if(!gl_FrontFacing && vRolled<.5) n=n;
  vec3 a=weave(uPatA,uColA,vUv,n,L), b=weave(uPatB,uColB,vUv,n,L);
  vec3 c=mix(b,a,uMix);
  float shade=.6+.55*max(dot(n,L),0.);
  if(vRolled<.5){
    shade*=1.-.42*smoothstep(-uRout*2.2,0.,vP.x-uRollX);
    vec2 dm=vP.xy-uMouse-vec2(16.,-18.); float g=exp(-dot(dm,dm)/(uSig*uSig*1.3));
    shade*=1.-.22*(uLift/16.)*g*(1.-vLift/max(uLift,.001));
    shade+=.12*vLift/16.;
    float e=abs(vUv.y)/(uH*.5); shade*=1.-.25*smoothstep(.93,1.,e);
  }else{
    float rim=pow(1.-abs(n.z),2.); shade*=1.-.35*rim;
    shade+=.18*pow(max(dot(reflect(-L,n),vec3(0.,0.,1.)),0.),12.);
  }
  gl_FragColor=vec4(c*shade,1.);
}`;
const SVS = /* glsl */`varying vec2 vP; void main(){ vP=position.xy*6000.; gl_Position=projectionMatrix*modelViewMatrix*vec4(vP,-30.,1.); }`;
const SFS = /* glsl */`
precision highp float;
uniform float uX0,uRollX,uRout,uH; varying vec2 vP;
float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}
void main(){
  vec2 c=vec2((uX0+uRollX)*.5+8.,-12.); vec2 b=vec2(max(uRollX-uX0,0.)*.5,uH*.5);
  float a=.42*(1.-smoothstep(-8.,30.,sdBox(vP-c,b)));
  vec2 rc=vec2(uRollX+uRout*.7,-uRout*.4); vec2 rb=vec2(uRout*1.05,uH*.5+uRout*.12);
  a=max(a,.62*(1.-smoothstep(-uRout*.4,uRout*1.1,sdBox(vP-rc,rb))));
  gl_FragColor=vec4(.07,.035,.015,a);
}`;

class Roll {
  constructor(T, stage, fab) {
    this.stage = stage; this.cv = $('canvas', stage);
    const R = this.r = new T.WebGLRenderer({ canvas: this.cv, alpha: true, antialias: true });
    R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75)); R.setClearColor(0x000000, 0);
    this.scene = new T.Scene();
    this.cam = new T.OrthographicCamera(-1, 1, 1, -1, -3000, 3000); this.cam.position.z = 1000;
    const c = hex(fab.c);
    this.u = {
      uLen: { value: 1 }, uH: { value: 1 }, uFlat: { value: 0 }, uT: { value: 2.4 }, uR0: { value: 10 }, uX0: { value: 0 },
      uRout: { value: 40 }, uRollX: { value: 0 }, uMouse: { value: new T.Vector2(-1e4, -1e4) }, uLift: { value: 0 }, uSig: { value: 85 },
      uTime: { value: 0 }, uColA: { value: new T.Vector3(...c) }, uColB: { value: new T.Vector3(...c) },
      uPatA: { value: fab.p }, uPatB: { value: fab.p }, uMix: { value: 1 },
    };
    this.mesh = new T.Mesh(new T.PlaneGeometry(1, 1, 1100, 6), new T.ShaderMaterial({ uniforms: this.u, vertexShader: VS, fragmentShader: FS, side: T.DoubleSide }));
    this.shadow = new T.Mesh(new T.PlaneGeometry(1, 1), new T.ShaderMaterial({ uniforms: this.u, vertexShader: SVS, fragmentShader: SFS, transparent: true, depthWrite: false }));
    this.mesh.frustumCulled = this.shadow.frustumCulled = false;
    this.shadow.renderOrder = -1;
    this.scene.add(this.shadow, this.mesh);
    this.lift = 0; this.vis = true; this.fadeT = null;
    this.resize();
    new IntersectionObserver(e => { this.vis = e[0].isIntersecting; }, { rootMargin: '120px' }).observe(this.cv);
    stage.classList.add('gl');
  }
  resize() {
    const w = this.cv.clientWidth, h = this.cv.clientHeight; if (!w || !h) return;
    this.w = w; this.h = h; this.r.setSize(w, h, false);
    Object.assign(this.cam, { left: -w / 2, right: w / 2, top: h / 2, bottom: -h / 2 }); this.cam.updateProjectionMatrix();
    const u = this.u;
    u.uH.value = h - 80; u.uX0.value = -w / 2 - 8; this.span = w + 16; u.uLen.value = this.span * 1.75;
    u.uT.value = Math.max(1.8, w / 620); u.uR0.value = Math.max(9, (h - 80) * .045);
  }
  setFabric(f) {
    const u = this.u;
    if (u.uMix.value < 1) u.uColB.value.lerp(u.uColA.value, u.uMix.value); else u.uColB.value.copy(u.uColA.value);
    u.uPatB.value = u.uMix.value < .5 ? u.uPatB.value : u.uPatA.value;
    u.uColA.value.set(...hex(f.c)); u.uPatA.value = f.p;
    u.uMix.value = 0; this.fadeT = performance.now();
  }
  frame(now, p, m) {
    if (!this.vis || !this.w) return;
    const u = this.u; u.uTime.value = now / 1000;
    if (this.fadeT != null) { const k = clamp((now - this.fadeT) / 400); u.uMix.value = k * k * (3 - 2 * k); if (k >= 1) this.fadeT = null; }
    const flat = p * this.span; u.uFlat.value = flat;
    const rem = Math.max(u.uLen.value - flat, 0);
    const Rout = Math.sqrt(u.uR0.value ** 2 + rem * u.uT.value / Math.PI);
    u.uRout.value = Rout; u.uRollX.value = u.uX0.value + flat;
    const r = this.cv.getBoundingClientRect();
    const inside = m.x >= r.left && m.x <= r.right && m.y >= r.top + 30 && m.y <= r.bottom - 30;
    if (inside) u.uMouse.value.set(m.x - r.left - this.w / 2, -(m.y - r.top - this.h / 2));
    this.lift += ((inside ? 1 : 0) - this.lift) * .08; u.uLift.value = this.lift * 16;
    this.r.render(this.scene, this.cam);
  }
}
