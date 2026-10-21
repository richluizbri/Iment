'use strict';

/* ── Visibility guard ─────────────────────────────────────── */
document.body.style.opacity = '0';
var _bodyFallback = setTimeout(function() {
  document.body.style.transition = 'opacity 0.4s';
  document.body.style.opacity = '1';
}, 2500);

/* Graceful degradation if GSAP failed to load */
if (typeof gsap === 'undefined') {
  clearTimeout(_bodyFallback);
  document.body.style.transition = 'opacity 0.4s';
  document.body.style.opacity = '1';
  window.gsap = {
    registerPlugin: function() {},
    to: function() {},
    from: function() {},
    fromTo: function() {},
    set: function() {},
    timeline: function() {
      var t = { from: function() { return t; }, defaults: function() { return t; } };
      return t;
    },
    ticker: { add: function() {} },
  };
  window.ScrollTrigger = { create: function() {}, refresh: function() {} };
}

gsap.registerPlugin(ScrollTrigger);

var NO_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isHoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ── Theme toggle ─────────────────────────────────────────── */
(function() {
  var toggle = document.getElementById('theme-toggle');
  var root   = document.documentElement;
  var KEY    = 'iment-tech-theme';

  if (localStorage.getItem(KEY) === 'light') {
    root.setAttribute('data-theme', 'light');
    toggle.setAttribute('aria-label', 'Alternar para tema escuro');
  }

  toggle.addEventListener('click', function() {
    root.classList.add('theme-transitioning');
    var isLight = root.getAttribute('data-theme') === 'light';
    if (isLight) {
      root.removeAttribute('data-theme');
      localStorage.setItem(KEY, 'dark');
      toggle.setAttribute('aria-label', 'Alternar para tema claro');
    } else {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem(KEY, 'light');
      toggle.setAttribute('aria-label', 'Alternar para tema escuro');
    }
    setTimeout(function() { root.classList.remove('theme-transitioning'); }, 350);
  });
})();

/* ── Page reveal ──────────────────────────────────────────── */
gsap.to('body', {
  opacity: 1, duration: 0.5, ease: 'none',
  onComplete: function() { clearTimeout(_bodyFallback); },
});

/* ── Nav scroll ───────────────────────────────────────────── */
var nav = document.getElementById('nav');
ScrollTrigger.create({
  start: 'top -28',
  onEnter:     function() { nav.classList.add('scrolled'); },
  onLeaveBack: function() { nav.classList.remove('scrolled'); },
});

/* ── Mobile nav ───────────────────────────────────────────── */
var burger    = document.getElementById('burger');
var mobileNav = document.getElementById('mobile-nav');
burger.addEventListener('click', function() {
  var open = mobileNav.classList.toggle('open');
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
});
mobileNav.querySelectorAll('a').forEach(function(a) {
  a.addEventListener('click', function() {
    mobileNav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

/* ── Active nav links ─────────────────────────────────────── */
document.querySelectorAll('section[id]').forEach(function(s) {
  ScrollTrigger.create({
    trigger: s,
    start: 'top 50%',
    end: 'bottom 50%',
    onEnter:     function() { setActive(s.id); },
    onEnterBack: function() { setActive(s.id); },
  });
});
function setActive(id) {
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    a.removeAttribute('aria-current');
    if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'page');
  });
}

/* ── ScrollTrigger: refresh on font load + resize ────────── */
document.fonts.ready.then(function() { ScrollTrigger.refresh(); });
var _resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(function() { ScrollTrigger.refresh(); }, 250);
});

/* ── Build H1 with mask lines ────────────────────────────── */
(function() {
  var h1 = document.querySelector('#hero h1');
  var lines = ['Transformamos ideias', 'em ecossistemas', 'digitais.'];
  h1.innerHTML = lines.map(function(l) {
    return '<div class="h1-line"><span>' + l + '</span></div>';
  }).join('');
})();

/* ══════════════════════════════════════════════════════════ */
/* Motion-guarded animations                                  */
/* ══════════════════════════════════════════════════════════ */
if (!NO_MOTION) {

  /* ── Scroll progress bar ──────────────────────────────── */
  gsap.to('#progress-bar', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
    },
  });

  /* ── Hero cursor glow (desktop only) ─────────────────── */
  if (isHoverDevice) {
    var heroEl = document.getElementById('hero');
    var glowEl = document.getElementById('cursor-glow');
    heroEl.addEventListener('mousemove', function(e) {
      document.body.classList.add('hero-hover');
      gsap.to(glowEl, { left: e.clientX, top: e.clientY, duration: 0.5, ease: 'power2.out' });
    });
    heroEl.addEventListener('mouseleave', function() {
      document.body.classList.remove('hero-hover');
    });
  }

  /* ── Hero entrance ────────────────────────────────────── */
  var heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  heroTl
    .from('.cover-id > *', {
      opacity: 0, x: -14,
      stagger: 0.12, duration: 0.6, delay: 0.2,
    })
    .from('.hero-tag', { opacity: 0, y: -14, duration: 0.6 }, '-=0.35')
    .from('.h1-line > span', {
      y: '108%', opacity: 0.3,
      stagger: 0.13, duration: 1,
    }, '-=0.3')
    .from('#hero p.sub', { opacity: 0, y: 20, duration: 0.75 }, '-=0.55')
    .from('.hero-actions .btn-magnetic-wrap', {
      opacity: 0, y: 12, scale: 0.97,
      stagger: 0.1, duration: 0.65,
    }, '-=0.5')
    .from('.eco-visual', { opacity: 0, duration: 1.2 }, '-=1.2')
    .from('.hero-team-k', { opacity: 0, x: -10, duration: 0.5 }, '-=0.8')
    .from('.hero-team-list li', {
      opacity: 0, y: 10,
      stagger: 0.07, duration: 0.5,
    }, '-=0.6');

  /* ── Orbital ecosystem animation ─────────────────────── */
  /* Os nós percorrem exatamente o anel tracejado maior, e não um raio
     arbitrário: a trilha fica visível e o movimento se lê. As medidas são
     recalculadas em cada quadro, então mudar o tamanho da janela não
     desmonta a órbita como acontecia antes. */
  var _ecoVis = document.querySelector('.eco-visual');
  var _ring1  = document.querySelector('.eco-ring-1');
  var nodes   = [
    document.getElementById('node-0'),
    document.getElementById('node-1'),
    document.getElementById('node-2'),
  ].filter(Boolean);
  var OFFSETS = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

  if (_ecoVis && nodes.length) {
    /* Tira o canto superior esquerdo do cálculo: sem isso cada nó orbita
       num raio diferente, porque as etiquetas têm larguras diferentes. */
    gsap.set(nodes, { xPercent: -50, yPercent: -50 });

    var linesSvg = document.getElementById('eco-lines');
    var lineEls  = nodes.map(function() {
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', 'oklch(0.55 0.22 248 / 0.22)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '4 6');
      if (linesSvg) linesSvg.appendChild(line);
      return line;
    });

    function medidas() {
      var lado = _ecoVis.offsetWidth || 440;
      return {
        cx: lado / 2,
        cy: (_ecoVis.offsetHeight || lado) / 2,
        r: (_ring1 ? _ring1.offsetWidth : lado * 0.86) / 2,
      };
    }

    var m = medidas();
    window.addEventListener('resize', function() { m = medidas(); });

    if (linesSvg) {
      linesSvg.setAttribute('viewBox', '0 0 ' + (m.cx * 2) + ' ' + (m.cy * 2));
    }

    gsap.ticker.add(function(time) {
      nodes.forEach(function(node, i) {
        var angle = time * 0.25 + OFFSETS[i];
        var nx = m.cx + Math.cos(angle) * m.r;
        var ny = m.cy + Math.sin(angle) * m.r;
        gsap.set(node, { x: nx - m.cx, y: ny - m.cy });
        lineEls[i].setAttribute('x1', m.cx);
        lineEls[i].setAttribute('y1', m.cy);
        lineEls[i].setAttribute('x2', nx);
        lineEls[i].setAttribute('y2', ny);
      });
      gsap.set('.eco-ring-2', { rotation: -(time * 5) });
      gsap.set('.eco-ring-3', { rotation: time * 9 });
    });

    gsap.to('#eco-glow', {
      scale: 1.4, opacity: 0,
      duration: 2.2, repeat: -1, ease: 'power2.out',
    });
  }

  /* ── Manifesto ────────────────────────────────────────── */
  /* Quebra o texto em palavras sem destruir o <em> de dentro: só os nós de
     texto são trocados, a marcação continua de pé. */
  function splitIntoWords(el) {
    if (!el) return [];
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(function(node) {
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function(piece) {
        if (!piece) return;
        if (/^\s+$/.test(piece)) {
          frag.appendChild(document.createTextNode(piece));
          return;
        }
        var span = document.createElement('span');
        span.className = 'word';
        span.textContent = piece;
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    });

    return el.querySelectorAll('.word');
  }

  var statementWords = splitIntoWords(document.querySelector('.manifesto-statement'));
  if (statementWords.length) {
    gsap.from(statementWords, {
      y: '0.6em', opacity: 0,
      stagger: 0.022, duration: 0.65, ease: 'power3.out',
      scrollTrigger: { trigger: '#manifesto', start: 'top 72%' },
    });
  }
  gsap.from('.manifesto-sub', {
    opacity: 0, y: 20, duration: 0.8,
    delay: 0.15, ease: 'power3.out',
    scrollTrigger: { trigger: '#manifesto', start: 'top 70%' },
  });
  gsap.from('.manifesto-side .label, .manifesto-side .side-line', {
    opacity: 0, x: -18,
    stagger: 0.15, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: '#manifesto', start: 'top 72%' },
  });

  /* ── Ecossistema: entrance animations ────────────────── */
  gsap.from('#ecossistema .eco-section-head', {
    y: 28, opacity: 0, duration: 0.75, ease: 'power3.out',
    scrollTrigger: { trigger: '#ecossistema', start: 'top 78%' },
  });
  gsap.from('.eco-item', {
    y: 30, opacity: 0,
    stagger: 0.12, duration: 0.75, ease: 'power3.out',
    scrollTrigger: { trigger: '#ecossistema', start: 'top 72%' },
  });

  /* ── Integramente ─────────────────────────────────────── */
  gsap.from('#projetos .eco-section-head', {
    y: 28, opacity: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#projetos', start: 'top 80%' },
  });

  /* ── Parceria ─────────────────────────────────────────── */
  gsap.from('.parceria-head', {
    y: 32, opacity: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#parceria', start: 'top 76%' },
  });
  gsap.from('.reason', {
    y: 36, opacity: 0,
    stagger: 0.14, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.reasons-grid', start: 'top 78%' },
  });
  document.querySelectorAll('.reason-num').forEach(function(el, i) {
    var t = parseInt(el.dataset.target, 10);
    var c = { val: 0 };
    gsap.to(c, {
      val: t, duration: 1.4, delay: i * 0.14, ease: 'power2.out',
      onUpdate: function() { el.textContent = String(Math.round(c.val)).padStart(2, '0'); },
      scrollTrigger: { trigger: '.reasons-grid', start: 'top 78%', toggleActions: 'play none none none' },
    });
  });

  /* ── FAQ ──────────────────────────────────────────────── */
  gsap.from('.faq-inner h2', {
    y: 28, opacity: 0, duration: 0.75, ease: 'power3.out',
    scrollTrigger: { trigger: '#faq', start: 'top 78%' },
  });
  gsap.from('.faq-item', {
    y: 18, opacity: 0,
    stagger: 0.09, duration: 0.65, ease: 'power3.out',
    scrollTrigger: { trigger: '#faq', start: 'top 74%' },
  });

  /* ── CTA final ────────────────────────────────────────── */
  gsap.from('#contato h2', {
    y: 50, opacity: 0, scale: 0.97, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '#contato', start: 'top 72%' },
  });
  gsap.from('#contato p', {
    y: 28, opacity: 0, duration: 0.8,
    delay: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '#contato', start: 'top 72%' },
  });
  gsap.from('#contato .btn-magnetic-wrap', {
    scale: 0.9, opacity: 0, duration: 0.75,
    delay: 0.22, ease: 'back.out(1.7)',
    scrollTrigger: { trigger: '#contato', start: 'top 72%' },
  });

  /* ── Quem somos: objetivos ────────────────────────────── */
  gsap.from('.objectives-label', {
    opacity: 0, x: -14, duration: 0.6, ease: 'power3.out',
    scrollTrigger: { trigger: '.objectives', start: 'top 84%' },
  });
  gsap.from('.objective', {
    y: 28, opacity: 0,
    stagger: 0.12, duration: 0.75, ease: 'power3.out',
    scrollTrigger: { trigger: '.objectives-list', start: 'top 84%' },
  });

  /* ── Aurora do hero: deriva lenta ─────────────────────── */
  gsap.to('.aurora-1', {
    x: 70, y: 46, scale: 1.12,
    duration: 17, ease: 'sine.inOut', repeat: -1, yoyo: true,
  });
  gsap.to('.aurora-2', {
    x: -55, y: -38, scale: 1.16,
    duration: 21, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.5,
  });

  /* ── Faixa de tecnologias ─────────────────────────────── */
  var techTrack = document.getElementById('techbar-track');
  if (techTrack) {
    /* Os dois conjuntos são idênticos, então -50% volta exatamente ao começo. */
    var marquee = gsap.to(techTrack, {
      xPercent: -50, duration: 30, ease: 'none', repeat: -1,
    });

    var techbar = document.querySelector('.techbar');
    if (techbar && isHoverDevice) {
      techbar.addEventListener('mouseenter', function() {
        gsap.to(marquee, { timeScale: 0.2, duration: 0.5 });
      });
      techbar.addEventListener('mouseleave', function() {
        gsap.to(marquee, { timeScale: 1, duration: 0.5 });
      });
    }
  }

  /* ── Cartões com inclinação sob o cursor ──────────────── */
  if (isHoverDevice) {
    document.querySelectorAll('.feat').forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var r = card.getBoundingClientRect();
        gsap.to(card, {
          rotateY: ((e.clientX - r.left) / r.width  - 0.5) * 8,
          rotateX: ((e.clientY - r.top)  / r.height - 0.5) * -8,
          y: -4,
          transformPerspective: 700,
          duration: 0.4,
          ease: 'power2.out',
        });
      });
      card.addEventListener('mouseleave', function() {
        gsap.to(card, { rotateY: 0, rotateX: 0, y: 0, duration: 0.6, ease: 'power3.out' });
      });
    });
  }

  /* ── Galeria: entrada ─────────────────────────────────── */
  document.querySelectorAll('.rail').forEach(function(rail) {
    gsap.from(rail.querySelector('.rail-lead'), {
      x: -30, opacity: 0,
      duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: rail, start: 'top 82%' },
    });
    gsap.from(rail.querySelectorAll('.rail-card'), {
      y: 56, opacity: 0, scale: 0.95,
      stagger: 0.08, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: rail, start: 'top 80%' },
    });
  });

  /* Um gatilho por bloco: existe um .case-intro no Integramente e outro no
     Teo, e um seletor só faria o segundo animar fora da tela. */
  document.querySelectorAll('.case-intro').forEach(function(intro) {
    gsap.from(intro.querySelectorAll('.integ-step'), {
      y: 26, opacity: 0,
      stagger: 0.12, duration: 0.75, ease: 'power3.out',
      scrollTrigger: { trigger: intro, start: 'top 84%' },
    });
  });

  /* Os dois rótulos de parte (`Parte 1` e `Parte 2`) agora moram na mesma
     seção, então cada um precisa do próprio gatilho. */
  document.querySelectorAll('.project-part').forEach(function(parte) {
    gsap.from(parte.children, {
      y: 24, opacity: 0,
      stagger: 0.1, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: parte, start: 'top 86%' },
    });
  });

  /* A faixa de seção entra escrevendo a régua da esquerda para a direita. */
  document.querySelectorAll('.sec-mark').forEach(function(marca) {
    var tl = gsap.timeline({ scrollTrigger: { trigger: marca, start: 'top 90%' } });
    tl.from(marca.querySelectorAll('.sec-mark-n, .sec-mark-t'), {
      opacity: 0, x: -14, stagger: 0.1, duration: 0.6, ease: 'power3.out',
    })
      .from(marca.querySelector('.sec-mark-rule'), {
        scaleX: 0, transformOrigin: 'left center', duration: 0.9, ease: 'power3.out',
      }, '-=0.35')
      .from(marca.querySelector('.sec-mark-of'), {
        opacity: 0, duration: 0.5, ease: 'power2.out',
      }, '-=0.4');
  });

  gsap.from('.project-next', {
    y: 36, opacity: 0,
    duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.project-next', start: 'top 86%' },
  });

  gsap.from('.projetos-lede', {
    y: 22, opacity: 0,
    duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.projetos-lede', start: 'top 88%' },
  });

  gsap.from('.project-head > *', {
    y: 30, opacity: 0,
    stagger: 0.12, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.project-head', start: 'top 84%' },
  });

  /* ── Processo: trilho e etapas acendendo ──────────────── */
  var stepEls = document.querySelectorAll('.step');
  if (stepEls.length) {
    ScrollTrigger.create({
      trigger: '#processo',
      start: 'top 62%',
      end: 'bottom 80%',
      scrub: 0.4,
      onUpdate: function(self) {
        gsap.set('#steps-rail-fill', { scaleX: self.progress });
        /* O ponto da etapa acende quando o trilho passa por ele. */
        var reached = self.progress * stepEls.length;
        stepEls.forEach(function(s, i) {
          s.classList.toggle('on', reached > i + 0.15);
        });
      },
    });
  }

  gsap.from('#processo .eco-section-head', {
    y: 28, opacity: 0, duration: 0.75, ease: 'power3.out',
    scrollTrigger: { trigger: '#processo', start: 'top 78%' },
  });
  gsap.from('.step', {
    y: 34, opacity: 0,
    stagger: 0.12, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.steps', start: 'top 82%' },
  });

  /* ── Parallax: celular e Theo ─────────────────────────── */
  gsap.to('.theo-img', {
    yPercent: -12, ease: 'none',
    scrollTrigger: { trigger: '.theo-block', start: 'top bottom', end: 'bottom top', scrub: 0.6 },
  });

  /* ── Theo: entrada e o bloco do mascote ───────────────── */
  gsap.from('.theo-figure', {
    scale: 0.86, opacity: 0, duration: 1, ease: 'back.out(1.4)',
    scrollTrigger: { trigger: '.theo-block', start: 'top 74%' },
  });
  gsap.from('.theo-text > *', {
    y: 26, opacity: 0,
    stagger: 0.09, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: '.theo-block', start: 'top 70%' },
  });
  document.querySelectorAll('.integ-features').forEach(function(block) {
    gsap.from(block.querySelectorAll('.feat'), {
      y: 28, opacity: 0,
      stagger: 0.08, duration: 0.65, ease: 'power3.out',
      scrollTrigger: { trigger: block, start: 'top 86%' },
    });
  });

  /* Um pulinho do Theo quando o cursor chega perto. */
  if (isHoverDevice) {
    var theoFigure = document.querySelector('.theo-figure');
    if (theoFigure) {
      theoFigure.addEventListener('mouseenter', function() {
        gsap.fromTo('.theo-img',
          { y: 0 },
          { y: -18, duration: 0.32, ease: 'power2.out', yoyo: true, repeat: 1 });
      });
    }
  }

} /* end !NO_MOTION */


/* ══════════════════════════════════════════════════════════ */
/* Botão magnético                                            */
/* A classe .btn-magnetic-wrap já existia no HTML e no CSS,    */
/* mas nenhum JS a animava: o efeito era só uma promessa.      */
/* ══════════════════════════════════════════════════════════ */
(function() {
  if (!isHoverDevice || NO_MOTION) return;

  var PULL = 0.34;  /* quanto o botão acompanha o cursor */
  var MAX  = 13;    /* limite em px, pra não descolar do lugar */

  document.querySelectorAll('.btn-magnetic-wrap').forEach(function(wrap) {
    function clamp(v) { return Math.max(-MAX, Math.min(MAX, v)); }

    wrap.addEventListener('mousemove', function(e) {
      var r = wrap.getBoundingClientRect();
      gsap.to(wrap, {
        x: clamp((e.clientX - (r.left + r.width  / 2)) * PULL),
        y: clamp((e.clientY - (r.top  + r.height / 2)) * PULL),
        duration: 0.4,
        ease: 'power3.out',
      });
    });

    wrap.addEventListener('mouseleave', function() {
      gsap.to(wrap, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
    });
  });
})();


/* ══════════════════════════════════════════════════════════ */
/* Rótulos que se decodificam ao entrar na tela               */
/* ══════════════════════════════════════════════════════════ */
(function() {
  var targets = document.querySelectorAll('[data-scramble]');
  if (!targets.length) return;

  var NOISE = '/\\<>_#*+=:%';

  targets.forEach(function(el) {
    var finalText = el.textContent;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: function() {
        if (NO_MOTION) return;
        var revealed = 0;
        var timer = setInterval(function() {
          revealed++;
          el.textContent = finalText
            .split('')
            .map(function(ch, i) {
              if (ch === ' ') return ' ';
              return i < revealed ? ch : NOISE[Math.floor(Math.random() * NOISE.length)];
            })
            .join('');
          if (revealed >= finalText.length) {
            clearInterval(timer);
            el.textContent = finalText;
          }
        }, 32);
      },
    });
  });
})();

/* ══════════════════════════════════════════════════════════ */
/* Ecossistema: hover (desktop) + tap (touch) — sempre ativo  */
/* ══════════════════════════════════════════════════════════ */
(function() {
  var ecoItems = document.querySelectorAll('.eco-item');
  if (!isHoverDevice || !ecoItems.length) return;

  /* A descrição e as tecnologias ficam sempre visíveis. O hover agora só
     destaca o item sob o cursor — antes ele era a ÚNICA forma de ler o que
     cada frente fazia, e quem só passava o olho não via nada. */
  if (!NO_MOTION) {
    document.querySelectorAll('.eco-item-arrow').forEach(function(a) {
      gsap.set(a, { opacity: 0, x: -8 });
    });
  }

  ecoItems.forEach(function(item) {
    var arrow = item.querySelector('.eco-item-arrow');
    var title = item.querySelector('.eco-item-title');
    var naturalColor = window.getComputedStyle(title).color;

    item.addEventListener('mouseenter', function() {
      if (window.innerWidth <= 960) return;
      if (arrow && !NO_MOTION) gsap.to(arrow, { opacity: 1, x: 0, duration: 0.3, ease: 'power3.out' });
      ecoItems.forEach(function(other) {
        if (other !== item) gsap.to(other, { opacity: 0.38, duration: NO_MOTION ? 0 : 0.25 });
      });
      gsap.to(title, { color: 'oklch(0.64 0.22 248)', duration: NO_MOTION ? 0 : 0.2 });
    });

    item.addEventListener('mouseleave', function() {
      if (arrow && !NO_MOTION) gsap.to(arrow, { opacity: 0, x: -8, duration: 0.25 });
      ecoItems.forEach(function(other) { gsap.to(other, { opacity: 1, duration: NO_MOTION ? 0 : 0.28 }); });
      gsap.to(title, {
        color: naturalColor,
        duration: NO_MOTION ? 0 : 0.2,
        ease: 'power2.out',
        onComplete: function() { gsap.set(title, { clearProps: 'color' }); },
      });
    });
  });
})();

/* ══════════════════════════════════════════════════════════ */
/* Slider das telas: botões, arrasto e rolagem horizontal     */
/* ══════════════════════════════════════════════════════════ */
/* A versão anterior fixava a galeria na tela e empurrava o trilho pelo
   scroll da página. Ficava bonito, mas dependia de a altura do bloco caber
   na janela: em telas baixas os controles e as legendas saíam para fora, e
   qualquer remedição depois das imagens carregarem deslocava tudo. Aqui o
   trilho tem a própria rolagem, que é a mesma em qualquer altura de tela e
   é o gesto que a pessoa já espera num slider. */
(function() {
  document.querySelectorAll('[data-rail]').forEach(function(rail) {
    var track = rail.querySelector('.rail-track');
    var cards = rail.querySelectorAll('.rail-card');
    if (!track || !cards.length) return;

    function curso() { return Math.max(0, rail.scrollWidth - rail.clientWidth); }

    /* Paradas repartidas por igual: alinhar cada peça à calha degenera num
       trilho curto, onde a primeira já esgota o curso. */
    function parada(i) {
      var n = cards.length - 1;
      return n > 0 ? (curso() * i) / n : 0;
    }
    function indice() {
      var c = curso();
      return c ? Math.round((rail.scrollLeft / c) * (cards.length - 1)) : 0;
    }

    var nav = document.createElement('div');
    nav.className = 'rail-nav';
    nav.innerHTML =
      '<button class="rail-btn" type="button" data-dir="-1" aria-label="Tela anterior">' +
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>' +
      '</button>' +
      '<button class="rail-btn" type="button" data-dir="1" aria-label="Próxima tela">' +
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>' +
      '</button>' +
      '<span class="rail-pos"><b>01</b><i>/</i><em>' + ('0' + cards.length).slice(-2) + '</em></span>' +
      '<span class="rail-bar"><span class="rail-bar-fill"></span></span>';
    rail.parentNode.insertBefore(nav, rail.nextSibling);

    var atual = nav.querySelector('.rail-pos b');
    var barra = nav.querySelector('.rail-bar-fill');
    var btns  = nav.querySelectorAll('.rail-btn');

    function marcar() {
      var c = curso();
      var p = c ? rail.scrollLeft / c : 0;
      var noInicio = rail.scrollLeft <= 4;
      var noFim    = rail.scrollLeft >= c - 4;
      var i = noInicio ? 0 : noFim ? cards.length - 1 : indice();
      atual.textContent = ('0' + (i + 1)).slice(-2);
      barra.style.transform = 'scaleX(' + Math.max(0.04, p) + ')';
      btns[0].disabled = noInicio;
      btns[1].disabled = noFim;
    }

    function irPara(i) {
      rail.scrollTo({
        left: parada(Math.max(0, Math.min(cards.length - 1, i))),
        behavior: NO_MOTION ? 'auto' : 'smooth',
      });
    }

    btns.forEach(function(b) {
      b.addEventListener('click', function() { irPara(indice() + Number(b.dataset.dir)); });
    });

    rail.addEventListener('scroll', marcar, { passive: true });
    window.addEventListener('resize', marcar);

    /* ── Arrastar com o cursor ─────────────────────────── */
    if (isHoverDevice) {
      var pegando = false, x0 = 0, esq0 = 0, andou = 0;

      rail.addEventListener('pointerdown', function(e) {
        if (e.button !== 0) return;
        pegando = true; andou = 0;
        x0 = e.clientX; esq0 = rail.scrollLeft;
        rail.classList.add('is-grabbing');
      });
      rail.addEventListener('pointermove', function(e) {
        if (!pegando) return;
        var dx = e.clientX - x0;
        andou = Math.max(andou, Math.abs(dx));
        rail.scrollLeft = esq0 - dx;
        /* Só sequestra o gesto depois de sair do lugar: um clique parado
           continua sendo um clique. */
        if (andou > 4) e.preventDefault();
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function(ev) {
        rail.addEventListener(ev, function() {
          if (!pegando) return;
          pegando = false;
          rail.classList.remove('is-grabbing');
          if (andou > 20) irPara(indice());
        });
      });
      rail.addEventListener('dragstart', function(e) { e.preventDefault(); });
    }

    marcar();
  });
})();


/* ══════════════════════════════════════════════════════════ */
/* Remedição depois que tudo carregou                         */
/* ══════════════════════════════════════════════════════════ */
/* As capturas entram com `loading="lazy"`: quando chegam, a altura dos
   blocos muda e as marcas calculadas antes saem do lugar. */
window.addEventListener('load', function() {
  if (window.ScrollTrigger) ScrollTrigger.refresh();
});


/* ══════════════════════════════════════════════════════════ */
/* Foco de luz e elevação nas caixas — só onde há cursor      */
/* ══════════════════════════════════════════════════════════ */
(function() {
  if (!isHoverDevice) return;

  var CAIXAS = '.case-intro .integ-step, .project-head, .project-next, .reason, .feat, .eco-item';

  document.querySelectorAll(CAIXAS).forEach(function(caixa) {
    caixa.classList.add('spot');

    caixa.addEventListener('mousemove', function(e) {
      var r = caixa.getBoundingClientRect();
      caixa.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      caixa.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* A elevação vai pelo GSAP porque ele já é dono do `transform` destes
     elementos desde a animação de entrada — mexer pelo CSS brigaria. */
  if (NO_MOTION) return;
  document.querySelectorAll('.case-intro .integ-step, .project-head, .project-next').forEach(function(caixa) {
    caixa.addEventListener('mouseenter', function() {
      gsap.to(caixa, { y: -6, duration: 0.4, ease: 'power3.out' });
    });
    caixa.addEventListener('mouseleave', function() {
      gsap.to(caixa, { y: 0, duration: 0.6, ease: 'power3.out' });
    });
  });
})();


/* ══════════════════════════════════════════════════════════ */
/* FAQ Accordion — sempre ativo                               */
/* ══════════════════════════════════════════════════════════ */
document.querySelectorAll('.faq-q').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var item   = btn.closest('.faq-item');
    var body   = item.querySelector('.faq-body');
    var toggle = item.querySelector('.faq-toggle');
    var wasOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach(function(o) {
      o.classList.remove('open');
      o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      if (!NO_MOTION) {
        gsap.to(o.querySelector('.faq-body'),   { height: 0, duration: 0.35, ease: 'power3.inOut' });
        gsap.to(o.querySelector('.faq-toggle'), { rotation: 0, duration: 0.3 });
      } else {
        o.querySelector('.faq-body').style.height = '0';
      }
    });

    if (!wasOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      if (!NO_MOTION) {
        gsap.set(body, { height: 'auto' });
        var h = body.offsetHeight;
        gsap.fromTo(body, { height: 0 }, { height: h, duration: 0.44, ease: 'power3.out' });
        gsap.to(toggle, { rotation: 45, duration: 0.35, ease: 'power3.out' });
      } else {
        body.style.height = 'auto';
      }
    }
  });
});
