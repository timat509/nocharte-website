// /mobile/mobile.js
(() => {
  const header   = document.querySelector('.nav');
  const burger   = header?.querySelector('.nav-toggle');
  const slideMenu= header?.querySelector('.links');   // legacy slide menu
  const pop      = document.getElementById('nav-pop'); // full-screen popup

  if (!header || !burger) return;

  // Ensure popup starts hidden, if present
  if (pop && !pop.hasAttribute('hidden')) pop.setAttribute('hidden', '');
  if (pop) pop.setAttribute('aria-hidden', 'true');

  /* ---------- utils ---------- */
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const lockBody = (on) => document.body.classList.toggle('menu-open', on);
  const isMobile = () => window.innerWidth <= 820;

  // mark current link in both menus
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

  /* ---------- legacy slide-down (fallback) ---------- */
  const openSlide  = () => { header.classList.add('open');  burger.setAttribute('aria-expanded','true');  lockBody(true);  };
  const closeSlide = () => { header.classList.remove('open');burger.setAttribute('aria-expanded','false'); lockBody(false); };
  const toggleSlide= () => header.classList.contains('open') ? closeSlide() : openSlide();

  /* ---------- popup ---------- */
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
    // force reflow, then animate
    void pop.offsetWidth;
    pop.classList.add('is-open');

    burger.setAttribute('aria-expanded', 'true');
    lockBody(true);

    const { links, closeBtn, sheet } = getPopEls();
    (links[0] || closeBtn || sheet)?.focus?.();

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

    // hide after CSS transition
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

  /* ---------- wire up ---------- */
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
    links.forEach(a => a.addEventListener('click', closePop));

    // close via any [data-close] inside the popup
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
})();
