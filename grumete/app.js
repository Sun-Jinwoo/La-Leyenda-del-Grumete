/* La Leyenda del Grumete — interacciones (Anime.js + CSS) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasAnime = typeof anime !== 'undefined' && !reduce;
  if (!hasAnime) document.documentElement.classList.add('no-anime');

  // Menú móvil
  const burger = $('.burger'), menu = $('#menu');
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    burger.textContent = open ? '✕' : '☰';
    if (open && hasAnime) anime({ targets: '#menu li', translateX: [-16, 0], opacity: [0, 1], delay: anime.stagger(50), duration: 300, easing: 'easeOutQuad' });
  });

  // Barra de progreso de scroll
  const bar = document.createElement('div');
  bar.className = 'progress';
  document.body.prepend(bar);
  const onScroll = () => {
    const h = document.documentElement;
    bar.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Aparición al hacer scroll (por lotes, con escalonado de 70 ms)
  const reveals = $$('.reveal'), inks = $$('section h2');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(e => e.classList.add('in')); inks.forEach(e => e.classList.add('ink'));
  } else {
    let batch = [], timer = null;
    const flush = () => {
      const items = batch; batch = []; timer = null;
      items.forEach(e => e.classList.add('in'));
      if (hasAnime) {
        anime({
          targets: items, translateY: [28, 0], opacity: [0, 1],
          delay: anime.stagger(70), duration: 450, easing: 'easeOutCubic',
          complete: () => items.forEach(e => { e.style.transform = ''; e.style.opacity = ''; })
        });
      }
    };
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      if (e.target.matches('h2')) { e.target.classList.add('ink'); return; }
      batch.push(e.target); clearTimeout(timer); timer = setTimeout(flush, 30);
    }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(e => io.observe(e)); inks.forEach(e => io.observe(e));
  }

  // Títulos del hero letra por letra
  const h1 = $('.hero h1');
  if (h1 && hasAnime) {
    const text = h1.textContent;
    h1.setAttribute('aria-label', text);
    h1.innerHTML = text.split(' ').map(w => `<span style="display:inline-block;white-space:nowrap" aria-hidden="true">${[...w].map(c => `<span class="ch">${c}</span>`).join('')}</span>`).join(' ');
    anime({ targets: '.hero h1 .ch', translateY: [40, 0], rotate: [8, 0], opacity: [0, 1], delay: anime.stagger(28, { start: 150 }), duration: 500, easing: 'easeOutBack' });
    anime({ targets: ['.hero .kicker', '.hero .lead', '.hero .tags li', '.hero .btn'], translateY: [20, 0], opacity: [0, 1], delay: anime.stagger(70, { start: 500 }), duration: 450, easing: 'easeOutQuad' });
  }

  // Ondas y brillo en el hero + parallax con el cursor
  const hero = $('.hero');
  if (hero) {
    const wave = c => `<svg viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true"><path fill="${c}" d="M0 30 Q 75 0 150 30 T 300 30 T 450 30 T 600 30 T 750 30 T 900 30 T 1050 30 T 1200 30 V60 H0Z"/></svg>`;
    hero.insertAdjacentHTML('beforeend', `<div class="waves" aria-hidden="true">${wave('#8fe0d2')}${wave('#f4e6c4')}</div><div class="glow" aria-hidden="true"></div>`);
    const img = $('img', hero), glow = $('.glow', hero);
    if (canHover && !reduce) {
      hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        glow.style.setProperty('--mx', x * 100 + '%'); glow.style.setProperty('--my', y * 100 + '%');
        img.style.transform = `scale(1.08) translate(${(0.5 - x) * 22}px, ${(0.5 - y) * 14}px)`;
        img.style.transition = 'transform .25s ease-out';
      });
      hero.addEventListener('pointerleave', () => { img.style.transform = 'scale(1.08)'; img.style.transition = 'transform .6s'; });
    }
    if (!reduce) addEventListener('scroll', () => { if (scrollY < innerHeight) hero.style.setProperty('--sy', scrollY); }, { passive: true });
  }

  if (canHover && !reduce) {
    // Inclinación 3D en tarjetas e imágenes
    $$('.card:not(.latest), .frame, .char, .crew-chip').forEach(el => {
      el.classList.add('tilt');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.classList.add('moving');
        el.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-3px)`;
      });
      el.addEventListener('pointerleave', () => { el.classList.remove('moving'); el.style.transform = ''; });
    });

    // Botones magnéticos
    $$('.btn').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .3 - 2}px)`;
      });
      b.addEventListener('pointerleave', () => {
        if (hasAnime) anime({ targets: b, translateX: 0, translateY: 0, duration: 450, easing: 'easeOutElastic(1, .6)', complete: () => b.style.transform = '' });
        else b.style.transform = '';
      });
    });

    // Estela de tinta dorada
    if (hasAnime) {
      const dots = Array.from({ length: 14 }, () => { const d = document.createElement('div'); d.className = 'ink-dot'; document.body.appendChild(d); return d; });
      let i = 0, last = 0;
      addEventListener('pointermove', e => {
        const now = performance.now(); if (now - last < 45) return; last = now;
        const d = dots[i++ % dots.length];
        anime.remove(d);
        anime({ targets: d, translateX: e.clientX, translateY: e.clientY, scale: [1.4, 0.2], opacity: [.85, 0], duration: 500, easing: 'easeOutQuad' });
      });
    }
  }

  // Ondas de clic en botones
  $$('.btn').forEach(b => b.addEventListener('click', e => {
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) / 4, span = document.createElement('span');
    span.className = 'ripple';
    span.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    b.appendChild(span); setTimeout(() => span.remove(), 520);
  }));

  // Brújula del Core Loop (SVG animado con el scroll y el cursor)
  const loop = $('ol.loop');
  if (loop) {
    const cx = 200, cy = 200, R = 140, N = 6, ns = 'http://www.w3.org/2000/svg';
    const pos = k => { const a = (-90 + k * 60) * Math.PI / 180; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; };
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 400 400'); svg.setAttribute('class', 'compass'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Ciclo de seis pasos del Core Loop');
    svg.innerHTML = `<circle class="track" cx="200" cy="200" r="${R}"/><circle class="draw" cx="200" cy="200" r="${R}" transform="rotate(-90 200 200)"/>
      <text class="center" x="200" y="200">Core Loop</text><text class="center-sub" x="200" y="224">↻ CICLO</text>
      ${Array.from({ length: N }, (_, k) => { const [x, y] = pos(k); return `<g class="node" data-k="${k}"><circle cx="${x}" cy="${y}" r="22"/><text x="${x}" y="${y + 1}">${k + 1}</text></g>`; }).join('')}
      <g class="orbit"><circle class="ship" cx="200" cy="${cy - R}" r="7"/></g>`;
    loop.before(svg);
    const nodes = $$('.node', svg), lis = $$('li', loop), draw = $('.draw', svg), orbit = $('.orbit', svg);
    const C = 2 * Math.PI * R; draw.style.strokeDasharray = C; draw.style.strokeDashoffset = reduce ? 0 : C;
    let hovered = -1;
    const setOn = k => { nodes.forEach((n, j) => n.classList.toggle('on', j === k)); lis.forEach((l, j) => l.classList.toggle('on', j === k)); };
    lis.forEach((l, k) => { l.addEventListener('pointerenter', () => { hovered = k; setOn(k); }); l.addEventListener('pointerleave', () => hovered = -1); });
    nodes.forEach((n, k) => { n.style.cursor = 'pointer'; n.addEventListener('pointerenter', () => { hovered = k; setOn(k); }); n.addEventListener('pointerleave', () => hovered = -1); });
    if (hasAnime) {
      const st = { a: 0 };
      const spin = anime({ targets: st, a: 360, duration: 12000, easing: 'linear', loop: true, autoplay: false,
        update: () => {
          orbit.setAttribute('transform', `rotate(${st.a} 200 200)`);
          if (hovered < 0) setOn(Math.floor(((st.a + 30) % 360) / 60));
        } });
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          spin.play();
          anime({ targets: draw, strokeDashoffset: [C, 0], duration: 500, easing: 'easeInOutQuad' });
          anime({ targets: nodes.map(n => $('circle', n)), scale: [0, 1], delay: anime.stagger(60), duration: 400, easing: 'easeOutBack' });
        } else spin.pause();
      }, { threshold: .4 }).observe(svg);
    } else setOn(0);
  }

  // Contadores animados
  $$('[data-count]').forEach(el => {
    const n = +el.dataset.count;
    if (!hasAnime) { el.textContent = n; return; }
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return; o.disconnect();
      const o2 = { v: 0 };
      anime({ targets: o2, v: n, round: 1, duration: 900, easing: 'easeOutExpo', update: () => el.textContent = o2.v });
    }, { threshold: .6 }).observe(el);
  });

  // Pestañas de destrezas
  const tabs = $$('.tablist button');
  if (tabs.length) {
    const panel = $('.tabpanel'), img = $('.tabimg img'), h = $('.tabtext h3'), p = $('.tabtext p');
    tabs.forEach(t => t.addEventListener('click', () => {
      tabs.forEach(x => x.setAttribute('aria-selected', x === t));
      const swap = () => { img.src = t.dataset.img; img.alt = t.dataset.t; h.textContent = t.dataset.t; p.textContent = t.dataset.d; };
      if (hasAnime) {
        anime({ targets: panel, opacity: [1, 0], translateY: [0, 8], duration: 150, easing: 'easeInQuad', complete: () => { swap(); anime({ targets: panel, opacity: [0, 1], translateY: [8, 0], duration: 300, easing: 'easeOutQuad' }); } });
      } else swap();
    }));
  }

  // Parallax de banners
  const banners = $$('[data-parallax]');
  if (banners.length && !reduce) {
    const upd = () => banners.forEach(b => { const r = b.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) $('img', b).style.transform = `translateY(${(r.top - innerHeight / 2) * -.08}px)`; });
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  // Lightbox de galería
  const items = $$('.m');
  if (items.length) {
    const dlg = document.createElement('dialog'); dlg.className = 'lightbox';
    dlg.innerHTML = '<button aria-label="Cerrar">✕</button><img alt=""><p></p>';
    document.body.appendChild(dlg);
    items.forEach(m => m.addEventListener('click', () => { $('img', dlg).src = m.dataset.full; $('img', dlg).alt = m.dataset.cap; $('p', dlg).textContent = m.dataset.cap; dlg.showModal(); }));
    dlg.addEventListener('click', e => { if (e.target !== $('img', dlg)) dlg.close(); });
  }
})();
