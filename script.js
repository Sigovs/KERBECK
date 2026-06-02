// KERBECK — script.js

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

    sections.forEach((s) => {
        s.addEventListener('mouseenter', () => openOnly(s));
        s.addEventListener('focusin', () => openOnly(s));
    });

    // Close when the pointer leaves the whole dock (unless focus is still inside)
    dock.addEventListener('mouseleave', () => {
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
