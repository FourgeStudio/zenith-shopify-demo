/* "Pairs well with" in the cart drawer + cart page (snippets/zenith-cart-upsell.liquid).
   Fills the list from Shopify's product recommendations, rendered by sections/zenith-cart-upsell.liquid.
   Waits until the list is near the screen (the drawer is closed on most page views). */
if (!customElements.get('zenith-cart-upsell')) {
  const root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  // One request per product + intent per page view; the drawer re-renders this element on every cart change.
  const cache = new Map();

  const fetchRows = (productId, intent) => {
    const key = `${productId}:${intent}`;
    if (!cache.has(key)) {
      const url = `${root}recommendations/products?product_id=${productId}&limit=10&intent=${intent}&section_id=zenith-cart-upsell`;
      cache.set(
        key,
        fetch(url)
          .then((response) => (response.ok ? response.text() : ''))
          .then((html) => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            return [...doc.querySelectorAll('.zenith-cart-upsell__item')].map((item) => ({
              id: item.dataset.productId,
              html: item.outerHTML,
            }));
          })
          .catch(() => [])
      );
    }
    return cache.get(key);
  };

  class ZenithCartUpsell extends HTMLElement {
    connectedCallback() {
      this.observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        this.observer.disconnect();
        this.fill();
      }, { rootMargin: '200px' });
      // Observe the parent: a [hidden] element never intersects.
      this.observer.observe(this.parentElement || this);
    }

    disconnectedCallback() {
      if (this.observer) this.observer.disconnect();
    }

    async fill() {
      const inCart = (this.dataset.productIds || '').split(',').filter(Boolean);
      const max = parseInt(this.dataset.max, 10) || 2;
      const seen = new Set(inCart);
      const picks = [];

      for (const productId of inCart) {
        const lists = await Promise.all([fetchRows(productId, 'complementary'), fetchRows(productId, 'related')]);
        for (const row of lists.flat()) {
          if (picks.length >= max) break;
          if (seen.has(row.id)) continue;
          seen.add(row.id);
          picks.push(row.html);
        }
        if (picks.length >= max) break;
      }

      if (!picks.length || !this.isConnected) return;
      const list = this.querySelector('.zenith-cart-upsell__list');

      if (this.dataset.context === 'page') {
        // On /cart this sits inside form#cart, where a nested <form> is dropped by the parser. Swap each
        // row's form for Shopify's add link, which adds and comes back to /cart.
        const doc = new DOMParser().parseFromString(`<ul>${picks.join('')}</ul>`, 'text/html');
        doc.querySelectorAll('product-form').forEach((form) => {
          const variantId = form.querySelector('[name="id"]').value;
          const button = form.querySelector('button');
          const link = doc.createElement('a');
          link.className = button.className;
          link.href = `${root}cart/add?id=${variantId}&quantity=1`;
          button.querySelectorAll(':scope > span').forEach((span) => link.append(span));
          form.replaceWith(link);
        });
        list.innerHTML = doc.querySelector('ul').innerHTML;
      } else {
        list.innerHTML = picks.join('');
      }
      this.hidden = false;
    }
  }

  customElements.define('zenith-cart-upsell', ZenithCartUpsell);
}
