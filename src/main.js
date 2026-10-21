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

/* A preferência do sistema continua sendo lida, mas agora só governa o que
   é de fato invasivo — a capa que toma a tela inteira. O resto da página
   anima para todo mundo: o site existe para chamar atenção, e um visitante
   com animação desligada no sistema estava vendo uma página morta sem
   nenhuma pista de que havia mais ali. */
var PREF_REDUZIDO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var NO_MOTION = false;

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
  var heroTl = gsap.timeline({ defaults: { ease: 'power4.out' }, paused: true });
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
  /* As três frentes acendem como um LED que percorre o trilho e volta, em
     laço próprio. Antes dependia do scroll: quem parasse de rolar via a
     animação parar junto, e quem já tivesse passado nunca mais via nada. */
  (function() {
    var frentes = document.querySelectorAll('.frente');
    var trilho  = document.querySelector('.frentes-trilho');
    var fill    = document.querySelector('.frentes-fill');
    var led     = document.querySelector('.frentes-led');
    if (!frentes.length || !trilho || !fill || !led) return;

    /* O trilho é vertical no desktop e horizontal no celular. A orientação
       vem da geometria do próprio elemento, não de uma largura de janela
       escrita aqui: assim ela acompanha a media query em vez de duplicar a
       regra, e sobrevive a qualquer redimensionamento. */
    function deitado() { return trilho.offsetWidth > trilho.offsetHeight; }
    function curso()   { return deitado() ? trilho.offsetWidth : trilho.offsetHeight; }

    function medirMarcas() {
      var h = deitado();
      var base = trilho.getBoundingClientRect();
      var total = curso() || 1;
      return Array.prototype.map.call(frentes, function(f) {
        var p = f.querySelector('.frente-ponto').getBoundingClientRect();
        var centro = h ? (p.left + p.width / 2 - base.left)
                       : (p.top + p.height / 2 - base.top);
        return centro / total;
      });
    }

    var marcas = medirMarcas();
    var remedir;
    window.addEventListener('resize', function() {
      clearTimeout(remedir);
      remedir = setTimeout(function() { marcas = medirMarcas(); }, 150);
    });

    function desenhar(p) {
      if (deitado()) {
        gsap.set(fill, { scaleX: p, scaleY: 1 });
        gsap.set(led,  { x: p * curso(), y: 0 });
      } else {
        gsap.set(fill, { scaleY: p, scaleX: 1 });
        gsap.set(led,  { y: p * curso(), x: 0 });
      }
      frentes.forEach(function(f, i) {
        f.classList.toggle('on', p >= marcas[i] - 0.015);
      });
    }

    /* Começa já na primeira marca e nunca volta ao zero: um instante com o
       trilho inteiro apagado parece defeito, não pausa. */
    var passo = { p: marcas[0] };
    gsap.to(passo, {
      p: 1,
      duration: 2.8,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      repeatDelay: 0.25,
      onUpdate: function() { desenhar(passo.p); },
    });

    gsap.from('.frente', {
      x: -16, opacity: 0,
      stagger: 0.12, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: '.frentes', start: 'top 86%' },
    });
  })();

  gsap.from('.manifesto-sub', {
    opacity: 0, y: 20, duration: 0.8,
    delay: 0.15, ease: 'power3.out',
    scrollTrigger: { trigger: '#manifesto', start: 'top 70%' },
  });
  gsap.from('.manifesto-side .label', {
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
  gsap.from('.arq-lede', {
    y: 22, opacity: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.arq-lede', start: 'top 86%' },
  });
  gsap.from('.camada', {
    y: 44, opacity: 0, scale: 0.97,
    stagger: 0.14, duration: 0.85, ease: 'power3.out',
    scrollTrigger: { trigger: '.arq-camadas', start: 'top 84%' },
  });
  gsap.from('.arq-nota', {
    y: 24, opacity: 0, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: '.arq-nota', start: 'top 90%' },
  });
  gsap.from('.camada-itens li', {
    y: 24, opacity: 0,
    stagger: 0.08, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: '.arq-camadas', start: 'top 78%' },
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
    var techbar = document.querySelector('.techbar');
    var molde   = techTrack.querySelector('.techbar-set');
    var marquee = null;

    /* Dois conjuntos bastavam numa tela estreita, mas numa tela larga a
       largura somada ficava menor que o dobro da janela: no meio do laço
       sobrava um vão à direita. Aqui a faixa é clonada até cobrir duas
       telas com folga de um conjunto, e o passo do laço é a largura exata
       de um conjunto — assim o ponto final é visualmente igual ao inicial,
       com quantas cópias forem necessárias. */
    function montar() {
      if (marquee) marquee.kill();
      gsap.set(techTrack, { x: 0 });

      var passo = molde.offsetWidth;
      if (!passo) return;

      var precisa = window.innerWidth * 2 + passo;
      while (techTrack.scrollWidth < precisa) {
        techTrack.appendChild(molde.cloneNode(true));
      }

      marquee = gsap.to(techTrack, {
        x: -passo,
        duration: passo / 46,   /* velocidade constante, não duração fixa */
        ease: 'none',
        repeat: -1,
      });
    }

    montar();
    window.addEventListener('load', montar);

    var remontar;
    window.addEventListener('resize', function() {
      clearTimeout(remontar);
      remontar = setTimeout(montar, 200);
    });

    if (techbar && isHoverDevice) {
      techbar.addEventListener('mouseenter', function() {
        if (marquee) gsap.to(marquee, { timeScale: 0.2, duration: 0.5 });
      });
      techbar.addEventListener('mouseleave', function() {
        if (marquee) gsap.to(marquee, { timeScale: 1, duration: 0.5 });
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

  /* Flutuação do ícone: `yPercent` e `rotate` em tweens próprios, enquanto a
     entrada usa `y`. São componentes distintos do mesmo transform, então o
     GSAP resolve os dois sem que um apague o outro. Durações diferentes
     evitam o vaivém mecânico de ida e volta sincronizadas. */
  gsap.to('.project-icone', {
    yPercent: -12, duration: 3.2,
    repeat: -1, yoyo: true, ease: 'sine.inOut',
  });
  gsap.to('.project-icone', {
    rotate: 4, duration: 4.7,
    repeat: -1, yoyo: true, ease: 'sine.inOut',
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
  var entradaEtapas = gsap.timeline({
    scrollTrigger: { trigger: '.steps', start: 'top 84%' },
  });
  entradaEtapas
    .from('.step-card', {
      y: 40, opacity: 0, scale: 0.97,
      stagger: 0.12, duration: 0.85, ease: 'power3.out',
    })
    /* `fromTo` em vez de `from`: o CSS muda a escala do ponto quando a etapa
       acende, então um `from` podia gravar essa escala transitória como
       destino e deixar o ponto encolhido para sempre. */
    .fromTo('.step-dot',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, stagger: 0.12, duration: 0.5, ease: 'back.out(2.2)', clearProps: 'transform' },
      '-=0.95');

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
/* Capa de entrada                                            */
/* ══════════════════════════════════════════════════════════ */
(function() {
  var capa = document.getElementById('capa');
  if (!capa) return;

  function sair() {
    capa.classList.add('saiu');
    document.body.style.overflow = '';
  }

  /* Com movimento reduzido a capa não entra em cena: uma tela cheia parada
     entre a pessoa e o site seria um obstáculo, não uma abertura. */
  /* A entrada do hero nasce pausada esperando a capa. Sem a capa, alguém
     precisa soltá-la — senão os elementos ficam presos no estado inicial,
     que é invisível. */
  if (PREF_REDUZIDO || !window.gsap) {
    sair();
    if (window.heroTl) heroTl.play();
    return;
  }

  /* Trava a rolagem enquanto a capa está na frente, senão dá para rolar o
     site por baixo dela e chegar ao meio da página já rolado. */
  document.body.style.overflow = 'hidden';

  var tl = gsap.timeline({
    onComplete: function() {
      sair();
      if (window.heroTl) heroTl.play();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    },
  });

  /* O hexágono se desenha em vez de aparecer pronto, as ondas saem dele
     como um pulso, as letras sobem girando em torno do eixo horizontal e a
     capa fecha num círculo que encolhe até sumir, em vez de deslizar. */
  tl.from('.capa-logo-caixa', {
      scale: 0, rotation: -120,
      duration: 1, ease: 'back.out(1.6)',
    })
    .fromTo('.capa-logo-hex',
      { strokeDashoffset: 100 },
      { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.5')
    .to('.capa-ondas span', {
      keyframes: [
        { scale: 0.6, opacity: 0.9, duration: 0.01 },
        { scale: 3.2, opacity: 0, duration: 1.6, ease: 'power2.out' },
      ],
      stagger: 0.28,
    }, '-=0.75')
    .from('.capa-nome span', {
      yPercent: 120, rotateX: -90, opacity: 0,
      transformOrigin: '50% 100%',
      stagger: 0.075, duration: 0.8, ease: 'power4.out',
    }, '-=1.5')
    .from('.capa-claim', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
    .from('.capa-slogan', { opacity: 0, letterSpacing: '0.6em', duration: 0.7, ease: 'power2.out' }, '-=0.4')
    .from('.capa-frentes li', { y: 14, opacity: 0, stagger: 0.09, duration: 0.45, ease: 'power3.out' }, '-=0.4')
    .to('.capa-barra-fill', { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, '-=0.5')
    .to('.capa-inner', { scale: 1.12, opacity: 0, duration: 0.55, ease: 'power2.in' }, '+=0.1')
    .to(capa, { clipPath: 'circle(0% at 50% 50%)', duration: 0.95, ease: 'power3.inOut' }, '-=0.35');
})();


/* ══════════════════════════════════════════════════════════ */
/* Órbita da capa — fora do guarda de movimento               */
/* ══════════════════════════════════════════════════════════ */
/* Posicionar não é animar: com movimento reduzido os nós precisam estar
   no lugar certo, só que parados. Por isso este bloco vive fora do guarda
   e só o laço contínuo lá dentro é que fica condicionado. */
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

  function posicionar(time) {
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
  }

  /* Com movimento reduzido os nós ficam parados, mas no lugar certo: sobre
     o anel, repartidos. Antes a posição só era calculada dentro do laço de
     animação, então quem desliga animação no sistema via os três
     empilhados no centro — parado e errado, em vez de só parado. */
  posicionar(0);

  if (!NO_MOTION) {
    gsap.ticker.add(function(time) {
      posicionar(time);
      gsap.set('.eco-ring-2', { rotation: -(time * 5) });
      gsap.set('.eco-ring-3', { rotation: time * 9 });
    });

    gsap.to('#eco-glow', {
      scale: 1.4, opacity: 0,
      duration: 2.2, repeat: -1, ease: 'power2.out',
    });
  }
}



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

    /* O destaque vai no `.rail-card` e o relevo no `.rail-frame`: elementos
       diferentes, então a aproximação e a inclinação não disputam o mesmo
       `transform`. A peça escolhida vem para frente para poder ser lida de
       perto, e sobe de camada para passar por cima das vizinhas. */
    var ultimoSel = -1;
    function destacar(i) {
      if (i === ultimoSel) return;
      ultimoSel = i;
      cards.forEach(function(c, k) {
        var sel = k === i;
        c.classList.toggle('no-centro', sel);
        var destino = { scale: sel ? 1.09 : 1, y: sel ? -10 : 0 };
        if (NO_MOTION) gsap.set(c, destino);
        else gsap.to(c, Object.assign({ duration: 0.55, ease: 'power3.out' }, destino));
      });
    }

    function marcar() {
      var c = curso();
      var p = c ? rail.scrollLeft / c : 0;
      var noInicio = rail.scrollLeft <= 4;
      var noFim    = rail.scrollLeft >= c - 4;
      var i = noInicio ? 0 : noFim ? cards.length - 1 : indice();
      atual.textContent = ('0' + (i + 1)).slice(-2);
      barra.style.transform = 'scaleX(' + Math.max(0.04, p) + ')';

      destacar(i);
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

    /* ── Relevo ao passar as telas ─────────────────────── */
    /* Cada aparelho gira e encolhe conforme se afasta do centro do trilho,
       e a legenda apaga junto. A transformação vai no `.rail-frame`, não no
       `.rail-card`: o cartão é do GSAP desde a animação de entrada, e dois
       donos do mesmo `transform` brigam. */
    var frames = [];
    cards.forEach(function(card) {
      frames.push({
        card:  card,
        frame: card.querySelector('.rail-frame'),
        cap:   card.querySelector('.rail-cap'),
      });
    });

    var pedido = null;
    function relevo() {
      pedido = null;
      var meio = rail.clientWidth / 2;
      var base = rail.getBoundingClientRect().left;

      frames.forEach(function(f) {
        if (!f.frame) return;
        var b = f.card.getBoundingClientRect();
        var centro = b.left + b.width / 2 - base;
        var d = (centro - meio) / meio;            /* -1 à esquerda, 1 à direita */
        var dd = Math.min(1, Math.abs(d));

        f.frame.style.transform =
          'perspective(1400px) rotateY(' + (-d * 13).toFixed(2) + 'deg)' +
          ' scale(' + (1 - dd * 0.12).toFixed(3) + ')' +
          ' translateY(' + (dd * 18).toFixed(1) + 'px)';
        f.frame.style.opacity = (1 - dd * 0.3).toFixed(3);
        if (f.cap) f.cap.style.opacity = (1 - dd * 0.6).toFixed(3);
      });
    }
    function pedirRelevo() {
      /* Com movimento reduzido o relevo não entra nem ao rolar: girar e
         encolher as peças é exatamente o tipo de movimento que a pessoa
         pediu para não ver. */
      if (NO_MOTION || pedido !== null) return;
      pedido = requestAnimationFrame(relevo);
    }

    /* A animação de entrada também anima a escala dos cartões. Como o
       destaque da primeira peça é aplicado antes dela terminar, a entrada
       sobrescrevia e a peça 01 ficava sem a aproximação. Reaplicar depois
       resolve, e `ultimoSel` precisa ser zerado para não ser ignorado. */
    if (window.ScrollTrigger && !NO_MOTION) {
      ScrollTrigger.create({
        trigger: rail,
        start: 'top 85%',
        once: true,
        onEnter: function() {
          gsap.delayedCall(1.5, function() { ultimoSel = -1; marcar(); });
        },
      });
    }

    rail.addEventListener('scroll', function() { marcar(); pedirRelevo(); }, { passive: true });
    window.addEventListener('resize', function() { marcar(); pedirRelevo(); });
    if (!NO_MOTION) {
      pedirRelevo();
      /* As capturas entram em lazy: quando chegam, as larguras mudam. */
      window.addEventListener('load', pedirRelevo);
    }

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

  var CAIXAS = '.case-intro .integ-step, .project-head, .project-next, .camada, .feat, .eco-item';

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