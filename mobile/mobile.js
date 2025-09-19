// /mobile/mobile.js
// Strict mode for sanity
(() => {
  'use strict';

  /* =========================================================
     MOBILE NAV (popup + legacy slide)
  ========================================================= */
  const header    = document.querySelector('.nav');
  const burger    = header?.querySelector('.nav-toggle');
  const slideMenu = header?.querySelector('.links');      // legacy slide menu
  const pop       = document.getElementById('nav-pop');   // full-screen popup

  if (header && burger) {
    // Ensure popup starts hidden, if present
    if (pop && !pop.hasAttribute('hidden')) pop.setAttribute('hidden', '');
    if (pop) pop.setAttribute('aria-hidden', 'true');

    const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const lockBody = (on) => document.body.classList.toggle('menu-open', on);
    const isMobile = () => window.innerWidth <= 820;

    // Mark current link in both menus
    (function markCurrentEverywhere(){
      try{
        const here = (location.pathname.replace(/\/+$/, '') || '/index.html').toLowerCase();
        const mark = (scope) => scope && qsa('a[href]', scope).forEach(a=>{
          const p = new URL(a.getAttribute('href'), location.origin)
                      .pathname.replace(/\/+$/, '').toLowerCase();
          if (p === here || (p.endsWith('index.html') && (here === '' || here === '/'))){
            a.setAttribute('aria-current','page');
          }
        });
        mark(slideMenu);
        if (pop) mark(pop);
      }catch(_){}
    })();

    // Legacy slide-down (fallback)
    const openSlide  = () => { header.classList.add('open');  burger.setAttribute('aria-expanded','true');  lockBody(true);  };
    const closeSlide = () => { header.classList.remove('open');burger.setAttribute('aria-expanded','false'); lockBody(false); };
    const toggleSlide= () => header.classList.contains('open') ? closeSlide() : openSlide();

    // Popup controls
    let lastFocused = null;

    const getPopEls = () => {
      if (!pop) return {};
      return {
        overlay:  pop.querySelector('.nav-pop__overlay'),
        closeBtn: pop.querySelector('.nav-pop__close'),
        links:    qsa('.nav-pop__nav a', pop),
        sheet:    pop.querySelector('.nav-pop__sheet'),
        focusables: () =>
          qsa('a,button,[tabindex]:not([tabindex="-1"])', pop)
            .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null),
      };
    };

    const openPop = () => {
      if (!pop) return openSlide();
      lastFocused = document.activeElement;

      pop.removeAttribute('hidden');
      pop.setAttribute('aria-hidden', 'false');
      void pop.offsetWidth; // force reflow
      pop.classList.add('is-open');

      burger.setAttribute('aria-expanded', 'true');
      lockBody(true);

      const { links, closeBtn, sheet } = getPopEls();
      (links?.[0] || closeBtn || sheet)?.focus?.();

      document.addEventListener('keydown', onKeydown);
      pop.addEventListener('keydown', onTrap, true);
    };

    const closePop = () => {
      if (!pop) return closeSlide();
      pop.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      lockBody(false);

      document.removeEventListener('keydown', onKeydown);
      pop.removeEventListener('keydown', onTrap, true);

      setTimeout(() => {
        pop.setAttribute('hidden', '');
        pop.setAttribute('aria-hidden', 'true');
        lastFocused?.focus?.();
      }, 180);
    };

    const togglePop = () => {
      if (!pop) return toggleSlide();
      pop.classList.contains('is-open') ? closePop() : openPop();
    };

    function onKeydown(e){
      if (e.key === 'Escape') { e.preventDefault(); closePop(); }
    }
    function onTrap(e){
      if (e.key !== 'Tab') return;
      const list = getPopEls().focusables();
      if (!list?.length) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    // Wire up
    burger.addEventListener('click', (e) => {
      e.preventDefault();
      isMobile() ? togglePop() : toggleSlide();
    });

    slideMenu?.addEventListener('click', (e) => {
      if (e.target.matches('a')) closeSlide();
    });

    if (pop){
      const { overlay, closeBtn, links } = getPopEls();
      overlay?.addEventListener('click', closePop);
      closeBtn?.addEventListener('click', closePop);
      links?.forEach(a => a.addEventListener('click', closePop));

      pop.addEventListener('click', (e)=>{
        const btn = e.target.closest('[data-close]');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        closePop();
      });
    }

    // ESC closes legacy slide menu too
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('open')) closeSlide();
    });

    // On resize, close whatever is open when leaving mobile
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 820) {
          closeSlide();
          if (pop) closePop();
        }
      }, 100);
    });

    // Prevent background scroll on iOS when menu is open
    document.addEventListener('touchmove', (e) => {
      if (document.body.classList.contains('menu-open') && pop && !pop.contains(e.target)) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  /* =========================================================
     HERO SLIDER (mobile only markup; works everywhere)
     - 2s auto-advance
     - Right → left slide
     - Seamless loop (clones)
     - Swipe support
     - Dots control
     - Pauses off-screen / reduced motion
  ========================================================= */
  (function heroSlider(){
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    const track = slider.querySelector('.hero-slider__track');
    const dots  = Array.from(slider.querySelectorAll('.hero-slider__dots button'));
    let imgs    = Array.from(track.querySelectorAll('img')).filter(Boolean);
    const REAL  = imgs.length;
    if (!REAL) return;

    const INTERVAL = 3500;   // every 2 seconds
    const DURATION = 420;    // animation ms
    const SWIPE_THRESHOLD = 50;

    // Build seamless track with clones: [last] [1] [2] ... [N] [first]
    const firstClone = imgs[0].cloneNode(true);
    const lastClone  = imgs[REAL - 1].cloneNode(true);
    track.insertBefore(lastClone, imgs[0]);
    track.appendChild(firstClone);

    // Refresh NodeList to include clones
    imgs = Array.from(track.querySelectorAll('img'));
    let index = 1; // start on first real slide

    function setTransform(i, instant = false) {
      track.style.transition = instant ? 'none' : `transform ${DURATION}ms ease`;
      track.style.transform  = `translateX(-${i * 100}%)`; // moves left as index increases
    }
    function updateDots(i) {
      const real = ((i - 1 + REAL) % REAL);
      dots.forEach((d, j) => d.classList.toggle('is-active', j === real));
    }
    function go(to, instant = false) {
      index = to;
      setTransform(index, instant);
      updateDots(index);
    }
    function next(){ go(index + 1); }
    function prev(){ go(index - 1); }

    // Seamless jump after transition ends
    track.addEventListener('transitionend', () => {
      if (index === 0) {
        index = REAL;
        setTransform(index, true);
      } else if (index === REAL + 1) {
        index = 1;
        setTransform(index, true);
      }
    });

    // Auto-play controls
    let timer;
    const play = () => { stop(); timer = setInterval(next, INTERVAL); };
    const stop = () => { if (timer) clearInterval(timer); };

    // Pause when off-screen / visibility changes
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? play() : stop()), { threshold: 0.25 });
    io.observe(slider);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else play();
    });

    // Touch swipe
    let startX = 0, dx = 0;
    slider.addEventListener('touchstart', e=>{
      stop();
      startX = e.touches[0].clientX; dx = 0;
      track.style.transition = 'none';
    }, {passive:true});

    slider.addEventListener('touchmove', e=>{
      dx = e.touches[0].clientX - startX;
      track.style.transform = `translateX(calc(-${index * 100}% + ${dx}px))`;
    }, {passive:true});

    slider.addEventListener('touchend', ()=>{
      track.style.transition = `transform ${DURATION}ms ease`;
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        // swipe left -> next (content moves right→left)
        index += (dx < 0 ? 1 : -1);
        go(index);
      } else {
        go(index); // snap back
      }
      play();
    });

    // Dots click
    dots.forEach((d, j) => d.addEventListener('click', () => { stop(); go(j + 1); play(); }));

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      go(1, true);
    } else {
      go(1, true);
      play();
    }

    // Hide obviously broken slide images (if a path is wrong)
    imgs.forEach(img => {
      img.addEventListener('error', () => { img.style.display = 'none'; });
    });
  })();
})();
// Mobile menu: open/close + accessibility basics
(function () {
  const btn = document.querySelector('.nav-toggle');
  const pop = document.getElementById('nav-pop');
  if (!btn || !pop) return;

  const overlay = pop.querySelector('.nav-pop__overlay');
  const closers = pop.querySelectorAll('[data-close]');
  const navLinks = pop.querySelectorAll('.nav-pop__nav a');

  function openMenu() {
    pop.classList.add('open');
    pop.removeAttribute('hidden');
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }
  function closeMenu() {
    pop.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    // keep it in the DOM for animation, but hide for a11y
    pop.setAttribute('hidden', '');
  }
  function toggleMenu() {
    (pop.classList.contains('open') ? closeMenu() : openMenu());
  }

  btn.addEventListener('click', toggleMenu);
  overlay && overlay.addEventListener('click', closeMenu);
  closers.forEach(el => el.addEventListener('click', closeMenu));
  navLinks.forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
})();
