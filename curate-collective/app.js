(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const IG = 'https://ig.me/m/curatecollectiveaz';

  /* open / closed — America/Phoenix, opens 12 daily; closes 7 pm, Fri & Sat 8 pm */
  const CLOSE = [19, 19, 19, 19, 19, 20, 20];
  try {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Phoenix', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    const d = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday'));
    const t = (+g('hour') % 24) + (+g('minute')) / 60, c = CLOSE[d], open = t >= 12 && t < c;
    const txt = open ? `Open now · until ${c - 12} pm` : t < 12 ? 'Closed · opens today at 12 pm' : 'Closed · opens tomorrow at 12 pm';
    $$('[data-status]').forEach(e => { e.textContent = txt; const s = e.closest('.st'); s && s.classList.toggle('open', open); });
    const row = $(`.hours [data-d="${d}"]`); row && row.classList.add('today');
  } catch (e) {}

  /* floating Call bar hides while the hero buttons are on screen */
  const fab = $(".fab"), slab = $(".slab");
  if (fab && slab && "IntersectionObserver" in window) new IntersectionObserver(([e]) => fab.classList.toggle("off", e.isIntersecting)).observe(slab);

  /* clipboard */
  const toast = $('[data-toast]'), toastTxt = toast ? toast.textContent : '';
  async function copy(t) {
    let ok = false;
    try { await navigator.clipboard.writeText(t); ok = true; } catch (e) {
      const a = document.createElement('textarea'); a.value = t; a.style.cssText = 'position:fixed;opacity:0;top:0';
      document.body.appendChild(a); a.select(); try { ok = document.execCommand('copy'); } catch (_) {} a.remove();
    }
    if (toast) { toast.textContent = ok ? 'Copied — paste it in the DM and send.' : 'Copy didn’t work — select the text and copy it.'; clearTimeout(copy.t); copy.t = setTimeout(() => toast.textContent = toastTxt, 4000); }
    return ok;
  }

  /* pop-ins */
  if (document.documentElement.classList.contains('anim')) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
    $$('[data-pop]').forEach(e => io.observe(e));
  }

  /* the dig: card stack */
  const stack = $('.stack');
  if (stack) {
    const cards = $$('.card', stack), N = cards.length, R = cards.map(c => +c.dataset.r || 0);
    const dig = $('#dig'), cnt = $('[data-count]'), now = $('[data-now]'), ask = $('[data-ask]');
    let order = cards.map((_, i) => i), busy = false, drag = null;
    const pos = (ci, d) => { const k = Math.min(d, 4), s = d % 2 ? 1 : -1; return `translate3d(${k * 16 * s}px,${k * -7}px,0) rotate(${d ? R[ci] * 1.4 : R[ci] * .3}deg) scale(${1 - k * .03})`; };
    function layout() {
      order.forEach((ci, d) => {
        const c = cards[ci];
        c.style.zIndex = N - d; c.style.transform = pos(ci, d);
        c.classList.toggle('top', d === 0); c.setAttribute('aria-hidden', d ? 'true' : 'false');
      });
      const top = cards[order[0]];
      dig.style.backgroundColor = top.dataset.bg;
      cnt.textContent = String(order[0] + 1).padStart(2, '0') + ' / ' + N;
      now.textContent = top.dataset.t;
    }
    const wait = ms => new Promise(r => setTimeout(r, RM ? 0 : ms));
    async function next(dir = 1) {
      if (busy) return; busy = true;
      const c = cards[order[0]];
      c.classList.remove('tilt'); c.classList.add('fly');
      c.style.transform = `translate3d(${dir * 125}%,-6%,0) rotate(${dir * 26}deg)`;
      await wait(300);
      c.classList.remove('fly'); order.push(order.shift()); layout();
      await wait(120); busy = false;
    }
    async function prev() {
      if (busy) return; busy = true;
      const ci = order.pop(); order.unshift(ci); const c = cards[ci];
      c.style.transition = 'none'; c.style.zIndex = N + 1; c.style.transform = 'translate3d(-125%,-6%,0) rotate(-26deg)';
      c.offsetWidth; c.style.transition = '';
      layout(); await wait(350); busy = false;
    }
    $('[data-next]').addEventListener('click', () => next(1));
    $('[data-prev]').addEventListener('click', prev);
    stack.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); } });

    stack.addEventListener('pointerdown', e => {
      const c = e.target.closest('.card');
      if (!c || !c.classList.contains('top') || busy || e.button > 0) return;
      drag = { c, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, dy: 0 };
      c.classList.remove('tilt'); c.classList.add('drag');
      try { c.setPointerCapture(e.pointerId); } catch (_) {}
    });
    stack.addEventListener('pointermove', e => {
      if (drag) {
        drag.dx = e.clientX - drag.x; drag.dy = e.clientY - drag.y;
        drag.c.style.transform = `translate3d(${drag.dx}px,${drag.dy * .6}px,0) rotate(${R[order[0]] * .3 + drag.dx * .06}deg)`;
        return;
      }
      if (RM || e.pointerType !== 'mouse' || busy) return;
      const r = stack.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      const c = cards[order[0]]; c.classList.add('tilt');
      c.style.transform = `perspective(900px) rotateX(${(-ny * 12).toFixed(2)}deg) rotateY(${(nx * 14).toFixed(2)}deg) translate3d(0,-6px,0) rotate(${R[order[0]] * .3}deg) scale(1.02)`;
    });
    stack.addEventListener('pointerleave', () => { if (!drag && !busy) { cards[order[0]].classList.remove('tilt'); layout(); } });
    stack.addEventListener('pointerup', () => {
      if (!drag) return;
      const { c, dx, dy, t } = drag; drag = null; c.classList.remove('drag');
      const v = Math.abs(dx) / Math.max(1, performance.now() - t);
      if (Math.abs(dx) > 90 || (v > .55 && Math.abs(dx) > 24)) next(Math.sign(dx));
      else if (Math.abs(dx) < 7 && Math.abs(dy) < 7) next(1);
      else layout();
    });
    stack.addEventListener('pointercancel', () => { if (drag) { drag.c.classList.remove('drag'); drag = null; layout(); } });

    ask.addEventListener('click', () => copy(`Hey Curate! Saw your "${cards[order[0]].dataset.t}" post — what's still available?`));
    layout();
  }

  /* size & budget finder */
  const msg = $('#msg');
  if (msg) {
    const sms = $('[data-sms]');
    const list = (a, w = 'and') => a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' ' + w + ' ' + a[a.length - 1];
    const pick = k => $$(`[data-g="${k}"] [aria-pressed="true"]`).map(b => b.dataset.v);
    function build() {
      const s = pick('s'), c = pick('c'), b = pick('b'), want = [];
      if (s.length) want.push('sneakers in size ' + list(s, 'or'));
      const sz = c.filter(x => /XL/.test(x)), ty = c.filter(x => !/XL/.test(x)).map(x => x.toLowerCase());
      if (ty.length) want.push((sz.length ? list(sz, 'or') + ' ' : '') + list(ty));
      else if (sz.length) want.push('clothes in ' + list(sz, 'or'));
      const bud = b.filter(x => x !== 'STEALS');
      let m = 'Hey Curate! ';
      if (want.length) m += "I'm looking for " + list(want) + (bud.length ? ', budget ' + list(bud, 'or') : '') + '. ';
      else if (bud.length) m += "My budget's " + list(bud, 'or') + '. ';
      if (b.includes('STEALS')) m += "Also down for anything in your steals. ";
      m += (want.length || b.length) ? 'What do you have right now?' : "What's new on the racks right now?";
      msg.value = m; upd();
    }
    const upd = () => { sms.href = 'sms:+14804895246?&body=' + encodeURIComponent(msg.value); };
    $$('.chips button').forEach(b => b.addEventListener('click', () => { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); build(); }));
    msg.addEventListener('input', upd);
    $('[data-copy]').addEventListener('click', () => copy(msg.value));
    $('[data-dm]').addEventListener('click', () => copy(msg.value));
    upd();
  }

  /* scroll motion: transform/opacity only */
  if (RM) return;
  const heroImg = $('.hero-bg img'), f1 = $('.f1'), f2 = $('.f2');
  const band = $('.band'), rows = $$('.band-row'), layers = $$('.band-c');
  const par = $$('[data-par]'), spin = $('[data-spin]');
  let ticking = false, mx = 0;
  function frame() {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    if (y < vh * 1.3) {
      heroImg.style.transform = `translate3d(0,${(y * .32).toFixed(1)}px,0) scale(1.12)`;
      f1.style.transform = `translate(${(mx * 40).toFixed(1)}px,${(-y * .22).toFixed(1)}px)`;
      f2.style.transform = `translate(${(-mx * 40).toFixed(1)}px,${(-y * .32).toFixed(1)}px)`;
    }
    const r = band.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh) {
      const p = (vh - r.top) / (vh + r.height);
      rows[0].style.transform = `translate3d(${(-p * 32).toFixed(2)}%,0,0)`;
      rows[1].style.transform = `translate3d(${(-36 + p * 32).toFixed(2)}%,0,0)`;
      const x = p * (layers.length - 1) * 1.15;
      layers.forEach((l, i) => { if (i) l.style.opacity = Math.min(1, Math.max(0, x - (i - 1))).toFixed(3); });
    }
    par.forEach(el => {
      const b = el.parentElement.getBoundingClientRect();
      if (b.bottom > 0 && b.top < vh) el.style.transform = `translate3d(0,${(((b.top + b.height / 2) - vh / 2) / vh * -36).toFixed(1)}px,0) scale(1.12)`;
    });
    if (spin) { const b = spin.getBoundingClientRect(); if (b.bottom > 0 && b.top < vh) spin.style.transform = `rotate(${(b.top * .25).toFixed(1)}deg)`; }
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  const hero = $('.hero');
  if (matchMedia('(hover:hover)').matches) hero.addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; req(); });
  frame();

  /* tilt toward the cursor */
  if (matchMedia('(hover:hover)').matches) $$('[data-tilt]').forEach(el => {
    const base = getComputedStyle(el).transform; const b0 = base === 'none' ? '' : base;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(1100px) rotateX(${(-ny * 7).toFixed(2)}deg) rotateY(${(nx * 9).toFixed(2)}deg) ${b0}`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
})();
