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

    // If the page has content below the hero (e.g. inventory), DON'T hijack the
    // wheel — let it scroll the page normally; the slogan keeps auto-cycling.
    const hasSectionsBelow = !!document.querySelector('.inventory');

    if (!hasSectionsBelow) {
        const onWheel = (e) => {
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

        // Keyboard up/down arrows cycle slides (only on the fixed single-screen page)
        document.addEventListener('keydown', (e) => {
            if (document.body.classList.contains('menu-open')) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); show(index + 1); restartAuto(); }
            if (e.key === 'ArrowUp')   { e.preventDefault(); show(index - 1); restartAuto(); }
        });
    }

    dots.forEach((d, n) => d.addEventListener('click', () => { show(n); restartAuto(); }));

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

/* Inventory carousel (index2): render cards from data (repeated for now) + arrow nav. */
(function () {
    const track = document.getElementById('inv-track');
    if (!track) return;

    // Add real cars here later; images live in images/invenotry/
    const INVENTORY = [
        { img: 'New 2027 Rolls-Royce Cullinan.jpg', brand: 'Rolls-Royce', model: 'Cullinan',            meta: '2027 · New' },
        { img: '2026 Bentley Continental GT S V8.jpg', brand: 'Bentley',  model: 'Continental GT S V8', meta: '2026' },
        { img: '2026 Lamborghini Urus SE.jpg',         brand: 'Lamborghini', model: 'Urus SE',          meta: '2026' },
        { img: '2026 GMC Yukon XL Denali.jpg',         brand: 'GMC',       model: 'Yukon XL Denali',    meta: '2026' },
        { img: '2026 GMC HUMMER EV SUV 2X.jpg',        brand: 'GMC',       model: 'Hummer EV SUV 2X',   meta: '2026' },
    ];

    const REPEAT = 2;   // duplicate the set to fill the carousel until more stock is added
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const cardHTML = (c) => `
        <a class="inv-card" href="#">
            <div class="inv-card__media">
                <img src="images/invenotry/${encodeURI(c.img)}" alt="${esc(c.brand + ' ' + c.model)}" loading="lazy" draggable="false">
            </div>
            <span class="inv-card__brand">${esc(c.brand)}</span>
            <h3 class="inv-card__name">${esc(c.model)}</h3>
            <span class="inv-card__meta">${esc(c.meta)}</span>
        </a>`;

    let html = '';
    for (let r = 0; r < REPEAT; r++) html += INVENTORY.map(cardHTML).join('');
    track.innerHTML = html;

    // Arrow navigation — scroll by one card width
    const arrows = document.querySelectorAll('.inv-arrow');
    const step = () => {
        const card = track.querySelector('.inv-card');
        const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0) || 24;
        return card ? card.getBoundingClientRect().width + gap : 360;
    };
    let momentumId = null;
    const cancelMomentum = () => { if (momentumId) cancelAnimationFrame(momentumId); momentumId = null; };

    arrows.forEach((btn) => {
        btn.addEventListener('click', () => {
            cancelMomentum();
            const dir = Number(btn.dataset.dir) || 1;
            track.scrollBy({ left: dir * step(), behavior: 'smooth' });
        });
    });

    // Drag-to-scroll with inertia (mouse / pointer). Touch scrolls natively.
    let down = false, moved = false, startX = 0, startScroll = 0;
    let lastX = 0, lastT = 0, vel = 0;   // vel = pointer px per ms

    track.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'touch') return;   // native touch handles its own momentum
        e.preventDefault();                      // stop image/link ghost-drag + text select
        cancelMomentum();
        down = true;
        moved = false;
        startX = lastX = e.pageX;
        startScroll = track.scrollLeft;
        lastT = e.timeStamp;
        vel = 0;
        track.classList.add('is-dragging');
        track.setPointerCapture(e.pointerId);
    });

    track.addEventListener('pointermove', (e) => {
        if (!down) return;
        const dx = e.pageX - startX;
        if (Math.abs(dx) > 4) moved = true;
        track.scrollLeft = startScroll - dx;
        const dt = e.timeStamp - lastT;
        if (dt > 0) vel = (e.pageX - lastX) / dt;   // smooth-ish instantaneous velocity
        lastX = e.pageX;
        lastT = e.timeStamp;
    });

    const endDrag = (e) => {
        if (!down) return;
        down = false;
        try { track.releasePointerCapture(e.pointerId); } catch (_) {}

        // Inertia: keep scrolling in the drag direction, decelerating
        let v = -vel * 16;          // px per frame (~16ms); invert: drag right → scroll left
        const FRICTION = 0.94;
        const stop = () => {
            cancelMomentum();
            track.classList.remove('is-dragging');   // re-enables proximity snap → settles
        };
        if (Math.abs(v) < 0.5) { stop(); return; }
        const stepMomentum = () => {
            track.scrollLeft += v;
            v *= FRICTION;
            const maxScroll = track.scrollWidth - track.clientWidth;
            if (Math.abs(v) < 0.5 || track.scrollLeft <= 0 || track.scrollLeft >= maxScroll) {
                stop();
                return;
            }
            momentumId = requestAnimationFrame(stepMomentum);
        };
        momentumId = requestAnimationFrame(stepMomentum);
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    // Suppress the card-link click if the pointer was dragged
    track.addEventListener('click', (e) => {
        if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
})();

/* Sticky header: add a solid backdrop once the page is scrolled. */
(function () {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();
