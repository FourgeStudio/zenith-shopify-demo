/* Zenith: product page review strip filled from the Judge.me review widget on the same page.
   Judge.me renders its reviews (author, stars, text, photos) into the page HTML; this copies the ones at or
   above the minimum rating into the strip's cards. No widget / no matching reviews → the strip stays hidden.
   Markup matches the Liquid strip in sections/zenith-main-product.liquid (same classes, same CSS). */
(() => {
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // Same markup as snippets/zenith-stars.liquid; the star SVG comes from a <template data-star> in the strip.
  const stars = (n, svg) => {
    let out = `<span class="zenith-stars"><span class="zenith-stars__icons" role="img" aria-label="${n} out of 5 stars">`;
    for (let i = 1; i <= 5; i++) out += `<span${i > n ? ' style="opacity: 0.3"' : ''}>${svg}</span>`;
    return out + '</span></span>';
  };

  const fill = (strip) => {
    const svg = strip.querySelector('template[data-star]')?.innerHTML || '★';
    const min = Number(strip.dataset.min) || 1;
    const max = Number(strip.dataset.max) || 10;
    const cards = [];
    document.querySelectorAll('.jdgm-rev').forEach((rev) => {
      if (cards.length >= max || strip.contains(rev)) return;
      const score = Number(rev.querySelector('.jdgm-rev__rating')?.dataset.score || 0);
      const text = (rev.querySelector('.jdgm-rev__body')?.textContent || '').trim();
      if (score < min || !text) return;
      const name = (rev.querySelector('.jdgm-rev__author')?.textContent || '').trim();
      const pic = rev.querySelector('.jdgm-rev__pic-img');
      const src = pic && (pic.dataset.src || pic.getAttribute('src'));
      const photo = src
        ? `<img src="${esc(src)}" alt="" loading="lazy" width="160" height="160">`
        : `<span class="zenith-mp__review-initial" aria-hidden="true">${esc((name || '?').charAt(0).toUpperCase())}</span>`;
      cards.push(
        `<li class="zenith-mp__review"><div class="zenith-media zenith-mp__review-photo">${photo}</div>` +
          `<div class="zenith-mp__review-body"><p class="zenith-mp__review-head">` +
          (name ? `<span class="zenith-mp__review-name">${esc(name)}</span>` : '') +
          stars(score, svg) +
          `</p><p class="zenith-mp__review-text">${esc(text)}</p></div></li>`
      );
    });
    if (!cards.length) return;
    const autoplay = strip.dataset.autoplay ? ` data-autoplay="${esc(strip.dataset.autoplay)}"` : '';
    strip.innerHTML =
      `<zenith-carousel class="zenith-mp__reviews-carousel"${autoplay}>` +
      `<ul class="zenith-mp__reviews zenith-mp__bleed zenith-carousel__track" role="list">${cards.join('')}</ul></zenith-carousel>`;
    strip.hidden = false;
  };

  const start = () => document.querySelectorAll('[data-zenith-judgeme-strip]').forEach(fill);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
