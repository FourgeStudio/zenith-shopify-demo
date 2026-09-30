/* Zenith: whole-card click for review and video cards.
   A click anywhere on the card follows the card's own link (review: the "Used" product link; video: the title
   link), except on real controls (links, buttons, the playing video) and the video area, which plays the video.
   The link itself stays the keyboard / screen-reader target. */
(() => {
  if (window.zenithCardLink) return;
  window.zenithCardLink = true;

  const CARDS = [
    { card: '.zenith-results__card', link: 'a.zenith-results__meta' },
    { card: '.zenith-video-card', link: 'a.zenith-video-card__title', ignore: '.zenith-video-card__media' },
  ];
  const CONTROLS = 'a, button, input, select, textarea, label, iframe, video, [role="button"]';

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    const target = event.target;
    if (!(target instanceof Element) || target.closest(CONTROLS)) return;
    if (window.getSelection && String(window.getSelection()).length) return; // selecting text, not clicking
    for (const { card, link, ignore } of CARDS) {
      const el = target.closest(card);
      if (!el) continue;
      if (ignore && target.closest(ignore)) return;
      const a = el.querySelector(link);
      if (!a || !a.href) return;
      if (event.metaKey || event.ctrlKey || a.target === '_blank') window.open(a.href, '_blank', 'noopener');
      else window.location.href = a.href;
      return;
    }
  });
})();
