// Store-wide promotion auto end (see snippets/zenith-promo-state.liquid): when the promo end time passes on an
// open (or cached) page, hide "only while the promotion runs" sections and show "only while it doesn't" ones.
(() => {
  if (window.zenithPromoState) return;
  window.zenithPromoState = true;

  const MAX_TIMEOUT = 2147483647;

  const watch = () => {
    document.querySelectorAll('[data-promo-end]').forEach((el) => {
      const end = Date.parse(el.dataset.promoEnd);
      if (Number.isNaN(end)) return;
      const flip = () => el.classList.toggle('zenith-promo-hidden', el.dataset.promoVisibility === 'promo_on');
      const remaining = end - Date.now();
      if (remaining <= 0) flip();
      else if (remaining < MAX_TIMEOUT) setTimeout(flip, remaining);
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
  else watch();
})();
