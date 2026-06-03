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
        menu.querySelectorAll('.menu__sub').forEach((s) => s.classList.remove('is-active'));
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

    // Second-level flyout panels (e.g. New Inventory) — present only on some pages
    const subs = Array.from(menu.querySelectorAll('.menu__sub'));
    const showSub = (key) => {
        subs.forEach((s) => s.classList.toggle('is-active', !!key && s.dataset.for === key));
        // keep the triggering left-menu item highlighted while its flyout is open
        links.forEach((l) => l.classList.toggle('is-current', !!key && l.dataset.sub === key));
    };

    // Swap background image on hover/focus of each item; reveal submenu if any
    links.forEach((link) => {
        const img = link.dataset.img;
        const reveal = () => { if (img) setBackground(img); showSub(link.dataset.sub || null); };
        link.addEventListener('mouseenter', reveal);
        link.addEventListener('focus', reveal);
        link.addEventListener('click', (e) => {
            if (link.dataset.sub) {           // has a 2nd level → don't navigate/close
                e.preventDefault();
                showSub(link.dataset.sub);
                return;
            }
            setTimeout(closeMenu, 0);         // let in-page anchors work, then close
        });
    });
})();

/* Inventory carousel (index2): render cards from data (repeated for now) + arrow nav. */
(function () {
    const track = document.getElementById('inv-track');
    if (!track) return;

    // Add real cars here later; images live in images/invenotry/
    const INVENTORY = [
        { img: 'New 2027 Rolls-Royce Cullinan.jpg', brand: 'Rolls-Royce', model: 'Cullinan',            year: 2027, price: '$560.000', tag: 'New' },
        { img: '2026 Bentley Continental GT S V8.jpg', brand: 'Bentley',  model: 'Continental GT S V8', year: 2026, price: '$305.000', tag: 'Certified' },
        { img: '2026 Lamborghini Urus SE.jpg',         brand: 'Lamborghini', model: 'Urus SE',          year: 2026, price: '$295.000', tag: 'Sale Pending' },
        { img: '2026 GMC Yukon XL Denali.jpg',         brand: 'GMC',       model: 'Yukon XL Denali',    year: 2026, price: '$96.500',  tag: 'Pre-Owned' },
        { img: '2026 GMC HUMMER EV SUV 2X.jpg',        brand: 'GMC',       model: 'Hummer EV SUV 2X',   year: 2026, price: '$132.000', tag: 'New' },
    ];

    const REPEAT = 2;   // duplicate the set to fill the carousel until more stock is added
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const SVG = {
        share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>',
        save:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        text:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    };

    const cardHTML = (c) => `
        <article class="inv-card">
            <div class="inv-card__media">
                <a class="inv-card__imglink" href="#" aria-label="${esc(c.brand + ' ' + c.model)}" tabindex="-1">
                    <img src="images/invenotry/${encodeURI(c.img)}" alt="${esc(c.brand + ' ' + c.model)}" loading="lazy" draggable="false">
                </a>
                ${c.tag ? `<span class="inv-card__tag inv-card__tag--${c.tag.toLowerCase().replace(/\s+/g, '-')}">${esc(c.tag)}</span>` : ''}
                <div class="inv-card__actions">
                    <button class="inv-act" type="button"><span>Share</span>${SVG.share}</button>
                    <button class="inv-act" type="button"><span>Save</span>${SVG.save}</button>
                    <button class="inv-act" type="button"><span>Text</span>${SVG.text}</button>
                </div>
            </div>
            <div class="inv-card__body">
                <span class="inv-card__cond">${esc(c.tag + ' ' + c.year)}</span>
                <h3 class="inv-card__name">${esc(c.brand + ' ' + c.model)}</h3>
                <span class="inv-card__price">Price: ${esc(c.price)}</span>
                <div class="inv-card__foot">
                    <a class="inv-card__inquire" href="#">Inquire</a>
                </div>
            </div>
        </article>`;

    let html = '';
    for (let r = 0; r < REPEAT; r++) html += INVENTORY.map(cardHTML).join('');
    track.innerHTML = html;

    // Scroll-reveal: header + cards float up from below, staggered (staircase)
    const section = track.closest('.inventory') || track;
    const cards = Array.from(track.querySelectorAll('.inv-card'));
    cards.forEach((card, i) => { card.style.transitionDelay = (0.12 + Math.min(i, 6) * 0.1) + 's'; });
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) { section.classList.add('is-in'); io.disconnect(); }
            });
        }, { threshold: 0.12 });
        io.observe(section);
    } else {
        section.classList.add('is-in');
    }

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

/* Contact slide-in panel: opens on any Contact trigger, slides from the right. */
(function () {
    const panel = document.getElementById('contact-panel');
    if (!panel) return;
    const openers = document.querySelectorAll('.nav__contact, a[href="#contact"]');
    const closeBtn = panel.querySelector('.contact-panel__close');

    const open = () => {
        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        document.body.classList.add('contact-open');
    };
    const close = () => {
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('contact-open');
    };

    openers.forEach((a) => a.addEventListener('click', (e) => {
        e.preventDefault();
        // if the fullscreen menu is open, let it close first
        document.body.classList.remove('menu-open');
        open();
    }));
    if (closeBtn) closeBtn.addEventListener('click', close);
    panel.addEventListener('click', (e) => { if (e.target === panel) close(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('is-open')) close();
    });
})();
