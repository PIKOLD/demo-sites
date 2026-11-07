// Кожаная бахрома: verlet-цепочки + three.js. Только десктоп, только без reduced-motion.
import * as THREE from 'three';

const C = window.__cat;
const SEG = 12, P = SEG + 1, TILE = 144;

function leatherTex(hex, thread) {
  const c = document.createElement('canvas'); c.width = 32; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = hex; g.fillRect(0, 0, 32, 256);
  for (let i = 0; i < 1600; i++) {
    g.fillStyle = Math.random() < .5 ? 'rgba(0,0,0,.14)' : 'rgba(255,255,255,.07)';
    g.fillRect(Math.random() * 32, Math.random() * 256, 1, 1 + (Math.random() * 2 | 0));
  }
  const gr = g.createLinearGradient(0, 0, 32, 0);
  gr.addColorStop(0, 'rgba(0,0,0,.5)'); gr.addColorStop(.12, 'rgba(0,0,0,0)');
  gr.addColorStop(.88, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.5)');
  g.fillStyle = gr; g.fillRect(0, 0, 32, 256);
  for (const x of [6.5, 25.5]) {               // двойная обшивка: две строчки по краю
    g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x - 1.2, 0, 2.4, 256);
    g.fillStyle = thread;
    for (let y = 3; y < 256; y += 16) g.fillRect(x - 1.3, y, 2.6, 10);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.ClampToEdgeWrapping; t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  return t;
}

function grainNormal() {
  const S = 128, h = new Float32Array(S * S);
  for (let i = 0; i < h.length; i++) h[i] = Math.random();
  for (let pass = 0; pass < 2; pass++) {
    const o = h.slice();
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      let s = 0;
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) s += o[((y + j + S) % S) * S + ((x + i + S) % S)];
      h[y * S + x] = s / 9;
    }
  }
  const c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'), img = g.createImageData(S, S), k = 9;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = h[y * S + (x + 1) % S] - h[y * S + (x - 1 + S) % S];
    const dy = h[((y + 1) % S) * S + x] - h[((y - 1 + S) % S) * S + x];
    let nx = -dx * k, ny = -dy * k, nz = 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    const q = (y * S + x) * 4;
    img.data[q] = (nx * .5 + .5) * 255; img.data[q + 1] = (ny * .5 + .5) * 255; img.data[q + 2] = (nz * .5 + .5) * 255; img.data[q + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(.35, 1.6);
  return t;
}

function init() {
  if (!C || !C.canvas) return;
  const stage = C.stage, canvas = C.canvas;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);

  let W = stage.clientWidth, H = stage.clientHeight;
  renderer.setSize(W, H, false);
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(0, W, 0, -H, -1000, 1000);
  cam.position.z = 500;
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x2a1c14, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(-.5, .8, 1); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd9a0, 1.3); rim.position.set(.9, -.3, .5); scene.add(rim);

  const normal = grainNormal();
  const groups = [
    { hex: '#7B3F1E', thread: 'rgba(236,214,178,.95)', list: [] },
    { hex: '#141110', thread: 'rgba(241,236,228,.8)', list: [] },
  ];

  // 52 полосы: 26 на коньячной половине ремня, 26 на чёрной
  const PER = 26;
  [['L', .08, .9], ['R', .12, .9]].forEach(([side, a, b], si) => {
    for (let i = 0; i < PER; i++) {
      const frac = a + (b - a) * (i / (PER - 1)) + (Math.random() - .5) * .006;
      const alt = (i % 3 === 0);
      const grp = groups[si === 0 ? (alt ? 1 : 0) : (alt ? 0 : 1)];
      const len = (.34 + Math.random() * .16) * H;
      grp.list.push({
        side, frac, len, seg: len / SEG, w: 5 + Math.random() * 1.6, ph: Math.random() * 6.28, tw: (Math.random() - .5) * .9,
        x: new Float32Array(P), y: new Float32Array(P), px: new Float32Array(P), py: new Float32Array(P), init: false,
      });
    }
  });

  groups.forEach(gp => {
    const n = gp.list.length, V = n * P * 2;
    const pos = new Float32Array(V * 3), uv = new Float32Array(V * 2), idx = [];
    gp.list.forEach((s, si) => {
      for (let i = 0; i < P; i++) {
        const b = (si * P + i) * 2, v = (i / SEG) * s.len / TILE;
        uv[b * 2] = 0; uv[b * 2 + 1] = v; uv[b * 2 + 2] = 1; uv[b * 2 + 3] = v;
        if (i < SEG) idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
      }
    });
    const geo = new THREE.BufferGeometry();
    gp.pos = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', gp.pos);
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setIndex(idx);
    const mat = new THREE.MeshStandardMaterial({
      map: leatherTex(gp.hex, gp.thread), normalMap: normal, normalScale: new THREE.Vector2(.8, .8),
      roughness: .55, metalness: 0, side: THREE.DoubleSide,
    });
    gp.geo = geo;
    const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false;
    scene.add(mesh);
  });

  // курсор = невидимая сфера-коллайдер
  let mx = -9999, my = -9999, lmx = null, lmy = null, mvx = 0, mvy = 0;
  addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect();
    const nx = e.clientX - r.left, ny = e.clientY - r.top;
    if (lmx !== null) { mvx += (nx - lmx); mvy += (ny - lmy); }
    lmx = mx = nx; lmy = my = ny;
  }, { passive: true });
  stage.addEventListener('pointerleave', () => { mx = my = -9999; lmx = lmy = null; });

  addEventListener('resize', () => {
    W = stage.clientWidth; H = stage.clientHeight;
    renderer.setSize(W, H, false);
    cam.right = W; cam.bottom = -H; cam.updateProjectionMatrix();
  });

  const RAD = 58, DAMP = .982, G = .36;
  let t = 0, first = true;

  function simulate(s, ax, ay, wx, wy, cmx, cmy) {
    const { x, y, px, py } = s;
    if (!s.init) { for (let i = 0; i < P; i++) { x[i] = px[i] = ax; y[i] = py[i] = ay + i * s.seg; } s.init = true; }
    x[0] = px[0] = ax; y[0] = py[0] = ay;
    const breeze = Math.sin(t * .0013 + s.ph) * .025;
    for (let i = 1; i < P; i++) {
      const vx = (x[i] - px[i]) * DAMP, vy = (y[i] - py[i]) * DAMP;
      px[i] = x[i]; py[i] = y[i];
      const f = i / SEG;
      x[i] += vx + (breeze + wx * Math.sin(s.ph + i * .3)) * f;
      y[i] += vy + G + wy * f;
      const dx = x[i] - mx, dy = y[i] - my, d2 = dx * dx + dy * dy;
      if (d2 < RAD * RAD) {
        const d = Math.sqrt(d2) || 1, push = (RAD - d) / d;
        x[i] += dx * push * .5 + cmx * .12 * f; y[i] += dy * push * .5 + cmy * .08 * f;
      }
    }
    for (let k = 0; k < 7; k++) {
      for (let i = 0; i < SEG - 1; i++) {           // жёсткость кожи: не даём ломаться в зигзаг
        const dx = x[i + 2] - x[i], dy = y[i + 2] - y[i], d = Math.hypot(dx, dy) || 1, min = s.seg * 1.86;
        if (d < min) { const q = (d - min) / d * .5; if (i > 0) { x[i] += dx * q * .5; y[i] += dy * q * .5; } x[i + 2] -= dx * q * .5; y[i + 2] -= dy * q * .5; }
      }
      for (let i = 0; i < SEG; i++) {
        const dx = x[i + 1] - x[i], dy = y[i + 1] - y[i], d = Math.hypot(dx, dy) || 1, diff = (d - s.seg) / d;
        if (i === 0) { x[1] -= dx * diff; y[1] -= dy * diff; }
        else { x[i] += dx * diff * .5; y[i] += dy * diff * .5; x[i + 1] -= dx * diff * .5; y[i + 1] -= dy * diff * .5; }
      }
    }
  }

  function write(gp) {
    const a = gp.pos.array;
    gp.list.forEach((s, si) => {
      const { x, y, px } = s;
      for (let i = 0; i < P; i++) {
        const i0 = Math.max(0, i - 1), i1 = Math.min(SEG, i + 1);
        let tx = x[i1] - x[i0], ty = y[i1] - y[i0]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
        const nx = -ty, ny = tx;
        const w = s.w * (1 - .12 * i / SEG);
        const lat = Math.max(-1.2, Math.min(1.2, (x[i] - px[i]) * .09));
        const th = s.tw + .38 * Math.sin(i * .5 + t * .0021 + s.ph) * (i / SEG) + lat;
        const c = Math.cos(th) * w, z = Math.sin(th) * w;
        const b = (si * P + i) * 6;
        a[b] = x[i] + nx * c; a[b + 1] = -(y[i] + ny * c); a[b + 2] = z;
        a[b + 3] = x[i] - nx * c; a[b + 4] = -(y[i] - ny * c); a[b + 5] = -z;
      }
    });
    gp.pos.needsUpdate = true;
    gp.geo.computeVertexNormals();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const sr = stage.getBoundingClientRect();
    if (sr.bottom < 0 || document.hidden) { mvx = mvy = 0; return; }
    t = now;
    const lr = C.strapL.getBoundingClientRect(), rr = C.strapR.getBoundingClientRect();
    const vel = C.vel || 0;
    const wy = Math.min(1.6, Math.abs(vel) * .05), wx = Math.max(-1, Math.min(1, vel * .03));
    const cmx = Math.max(-30, Math.min(30, mvx)), cmy = Math.max(-30, Math.min(30, mvy));
    groups.forEach(gp => {
      gp.list.forEach(s => {
        const r = s.side === 'L' ? lr : rr;
        simulate(s, r.left - sr.left + s.frac * r.width, r.bottom - sr.top - 8, wx, wy, cmx, cmy);
      });
      write(gp);
    });
    mvx *= .4; mvy *= .4;
    renderer.render(scene, cam);
    if (first) { first = false; document.documentElement.classList.add('gl'); }
  }
  requestAnimationFrame(frame);
}

try { init(); } catch (e) { console.warn('fringe gl off', e); }
