// KERBECK — script.js

/* Hero slogan: cycle through slides on mouse-wheel scroll (page stays fixed). */
(function () {
    const slogan = document.getElementById('slogan');
    const dotsWrap = document.getElementById('slogan-dots');
    if (!slogan) return;

    const slides = Array.from(slogan.querySelectorAll('.hero__slide'));
    const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.hero__dot')) : [];
    let index = 0;
    let locked = false;

    const show = (i) => {
        index = (i + slides.length) % slides.length;   // wrap around
        slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
        dots.forEach((d, n) => d.classList.toggle('is-active', n === index));
    };

    // Auto-cycle through the slides by itself
    let timer = null;
    const AUTO_MS = 5000;
    const startAuto = () => {
        stopAuto();
        timer = setInterval(() => {
            if (document.body.classList.contains('menu-open')) return;
            show(index + 1);
        }, AUTO_MS);
    };
    const stopAuto = () => { if (timer) clearInterval(timer); timer = null; };
    const restartAuto = () => { startAuto(); };

    const onWheel = (e) => {
        // Ignore while the fullscreen menu is open
        if (document.body.classList.contains('menu-open')) return;
        e.preventDefault();
        if (locked) return;
        if (Math.abs(e.deltaY) < 8) return;
        const next = index + (e.deltaY > 0 ? 1 : -1);
        if (next === index || next < 0 || next > slides.length - 1) return;
        locked = true;
        show(next);
        restartAuto();
        setTimeout(() => { locked = false; }, 750);
    };

    window.addEventListener('wheel', onWheel, { passive: false });

    dots.forEach((d, n) => d.addEventListener('click', () => { show(n); restartAuto(); }));

    // Keyboard up/down arrows
    document.addEventListener('keydown', (e) => {
        if (document.body.classList.contains('menu-open')) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); show(index + 1); restartAuto(); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); show(index - 1); restartAuto(); }
    });

    startAuto();
})();

/* Bottom dock: exactly ONE section open at a time.
   Hover (mouse) or focus (keyboard) opens a section and closes the rest. */
(function () {
    const dock = document.querySelector('.dock');
    if (!dock) return;

    const sections = Array.from(dock.querySelectorAll('.sect'));

    const openOnly = (target) =>
        sections.forEach((s) => s.classList.toggle('is-open', s === target));

    const closeAll = () =>
        sections.forEach((s) => s.classList.remove('is-open'));

    let hoverTimer = null;
    const OPEN_DELAY = 180;   // ms — slight hover-intent delay before opening

    sections.forEach((s) => {
        s.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => openOnly(s), OPEN_DELAY);
        });
        s.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
        s.addEventListener('focusin', () => { clearTimeout(hoverTimer); openOnly(s); });
    });

    // Close when the pointer leaves the whole dock (unless focus is still inside)
    dock.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        if (!dock.contains(document.activeElement)) closeAll();
    });

    // Close when keyboard focus leaves the dock entirely
    dock.addEventListener('focusout', (e) => {
        if (!dock.contains(e.relatedTarget)) closeAll();
    });
})();


/* Fullscreen overlay menu: open/close + background image swap on hover. */
(function () {
    const toggle = document.querySelector('.nav__menu');
    const menu = document.getElementById('menu');
    if (!toggle || !menu) return;

    const closeBtn = menu.querySelector('.menu__close');
    const links = Array.from(menu.querySelectorAll('.menu__link'));
    const layers = [
        document.getElementById('menu-bg-1'),
        document.getElementById('menu-bg-2'),
    ];
    let activeLayer = 0;

    const openMenu = () => {
        menu.classList.add('is-open');
        toggle.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        menu.setAttribute('aria-hidden', 'false');
        document.body.classList.add('menu-open');
        // Preload the first item's image as the default background
        const first = links[0] && links[0].dataset.img;
        if (first) setBackground(first);
    };

    const closeMenu = () => {
        menu.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('menu-open');
        toggle.focus();
    };

    // Crossfade between the two background layers
    const setBackground = (src) => {
        const next = layers[activeLayer ^ 1];
        const curr = layers[activeLayer];
        if (!next) return;
        next.style.backgroundImage = `url("${src}")`;
        next.classList.add('is-active');
        if (curr) curr.classList.remove('is-active');
        activeLayer ^= 1;
    };

    toggle.addEventListener('click', () => {
        menu.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    // Click on the dark backdrop (outside the panel) closes
    menu.addEventListener('click', (e) => {
        if (e.target === menu) closeMenu();
    });

    // Esc closes
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
    });

    // Swap background image on hover/focus of each item; close on navigation
    links.forEach((link) => {
        const img = link.dataset.img;
        if (img) {
            link.addEventListener('mouseenter', () => setBackground(img));
            link.addEventListener('focus', () => setBackground(img));
        }
        link.addEventListener('click', () => {
            // let in-page anchors work, then close
            setTimeout(closeMenu, 0);
        });
    });
})();
