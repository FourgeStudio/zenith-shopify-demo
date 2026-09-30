/* Zenith: results marquee — every row scrolls at the same speed (pixels per second).
   The CSS loop uses one duration (Scroll duration; Scroll duration on mobile below 750px) for every row, so a row with more or wider cards would
   move faster. Here the longest row keeps that duration and shorter rows get proportionally shorter ones.
   Re-measured when the rows resize (fonts, images, breakpoint changes). */
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
      if (widths[i]) t.style.animationDuration = `${((base * widths[i]) / longest).toFixed(2)}s`;
    });
  };

  const init = () =>
    document.querySelectorAll('.zenith-results').forEach((section) => {
      if (section.dataset.zenithSpeed) return;
      section.dataset.zenithSpeed = '1';
      sync(section);
      new ResizeObserver(() => sync(section)).observe(section);
    });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  document.addEventListener('shopify:section:load', init);
})();
