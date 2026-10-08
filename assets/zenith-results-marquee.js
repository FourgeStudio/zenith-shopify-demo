/* Zenith: results marquee.
   The HTML holds one pass of cards per row (static without JS). When the section comes within ~300px of the viewport
   the pass is cloned so the loop is wider than the widest screen (4 copies below 8 cards, 2 from 8), the clones are
   hidden from assistive tech and the tab order, and the track starts moving (.is-ready).
   Every row then scrolls at the same speed (pixels per second): the CSS loop uses one duration (Scroll duration;
   Scroll duration on mobile below 750px) for every row, so a row with more or wider cards would move faster. Here
   the longest row keeps that duration and shorter rows get proportionally shorter ones. Re-measured when the rows
   resize (fonts, images, breakpoint changes). */
(() => {
  const sync = (section) => {
    const tracks = [...section.querySelectorAll('.zenith-results__track')];
    const widths = tracks.map((t) => t.querySelector('.zenith-results__group')?.offsetWidth || 0);
    const longest = Math.max(...widths);
    const mobile = window.matchMedia('(max-width: 749px)').matches;
    const cs = getComputedStyle(section);
    const base = parseFloat(cs.getPropertyValue(mobile ? '--z-speed-m' : '--z-speed')) || parseFloat(cs.getPropertyValue('--z-speed')) || 120;
    if (!longest) return;
    tracks.forEach((t, i) => {
      if (!widths[i]) return;
      const next = `${((base * widths[i]) / longest).toFixed(2)}s`;
      if (t.style.animationDuration === next) return;
      // zenith: a new duration on a running animation moves the row (progress = time / duration); keep it where it is
      const anim = t.getAnimations?.()[0];
      const oldMs = anim && Number(anim.effect?.getTiming().duration);
      const progress = oldMs > 0 && anim.currentTime != null ? (anim.currentTime % oldMs) / oldMs : null;
      t.style.animationDuration = next;
      const fresh = t.getAnimations?.()[0];
      if (fresh && progress != null) fresh.currentTime = progress * parseFloat(next) * 1000;
    });
  };

  const build = (section) => {
    section.querySelectorAll('.zenith-results__track').forEach((track) => {
      const group = track.querySelector('.zenith-results__group');
      if (!group) return;
      const passes = group.children.length >= 8 ? 2 : 4;
      track.style.setProperty('--z-shift', passes === 2 ? '-50%' : '-25%');
      for (let i = 1; i < passes; i++) {
        const copy = group.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        copy.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
        copy.querySelectorAll('[data-shopify-editor-block]').forEach((el) => el.removeAttribute('data-shopify-editor-block'));
        copy.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach((el) => el.setAttribute('tabindex', '-1'));
        track.append(copy);
      }
      track.classList.add('is-ready');
    });
  };

  const setup = (section) => {
    if (section.dataset.zenithSpeed) return;
    section.dataset.zenithSpeed = '1';
    // Reduced motion: the CSS keeps the rows still and scrollable, so no clones or control
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        build(section);
        new ResizeObserver(() => sync(section)).observe(section);
        const toggle = section.querySelector('.zenith-results__pause');
        if (!toggle) return;
        toggle.hidden = false;
        toggle.addEventListener('click', () => {
          const paused = toggle.getAttribute('aria-pressed') !== 'true';
          toggle.setAttribute('aria-pressed', String(paused));
          section.classList.toggle('is-paused', paused);
        });
      },
      { rootMargin: '300px 0px' }
    );
    io.observe(section);
  };

  const init = () => document.querySelectorAll('.zenith-results').forEach(setup);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  document.addEventListener('shopify:section:load', init);
})();
