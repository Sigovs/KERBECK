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
