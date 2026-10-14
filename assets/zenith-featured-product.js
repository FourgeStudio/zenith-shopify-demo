/* Zenith · Featured product — "Text under the price" = Product page checklist.
   Loads the checklist from the selected product's own page (the page HTML: the Section Rendering API
   needs the template's full section id, unknown here) right after the page loads, and shows it with the featured product's
   gold checks. A skeleton holds the space meanwhile; the description shows if the request fails or there is no checklist. */
if (!customElements.get('zenith-fp-checks')) {
  customElements.define(
    'zenith-fp-checks',
    class ZenithFpChecks extends HTMLElement {
      connectedCallback() {
        if (!this.dataset.url || this.loaded) {
          if (!this.dataset.url) this.fallback();
          return;
        }
        // Start right after the page has loaded, so the list is usually in before the section is reached
        const start = () => this.load();
        if (document.readyState === 'complete') start();
        else window.addEventListener('load', start, { once: true });
      }

      // No checklist / request failed: show the product description instead of the skeleton
      fallback() {
        this.querySelector('.zenith-fp__skeleton')?.remove();
        const desc = this.querySelector('.zenith-fp__desc');
        if (desc) desc.hidden = false;
        this.removeAttribute('aria-busy');
      }

      async load() {
        this.loaded = true;
        try {
          const url = new URL(this.dataset.url, window.location.origin);
          const response = await fetch(url);
          if (!response.ok) return this.fallback();
          const html = await response.text();
          if (!html) return this.fallback();
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const items = Array.from(doc.querySelectorAll('.zenith-mp__checks .zenith-mp__check'));
          if (!items.length) return this.fallback();
          const list = document.createElement('ul');
          list.className = 'zenith-fp__benefits';
          list.setAttribute('role', 'list');
          items.forEach((item) => {
            const text = item.textContent.trim();
            if (!text) return;
            const li = document.createElement('li');
            li.className = 'zenith-fp__benefit';
            // Keep the product page's "Hide on desktop / mobile" choices
            ['zenith-hide-desktop', 'zenith-hide-mobile'].forEach((cls) => {
              if (item.classList.contains(cls)) li.classList.add(cls);
            });
            li.innerHTML =
              '<svg class="zenith-fp__check" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="12" fill="currentColor"/><path d="M7.4 12.4l3.1 3.1 6.1-6.3" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            const span = document.createElement('span');
            span.textContent = text;
            li.append(span);
            list.append(li);
          });
          if (!list.children.length) return this.fallback();
          this.replaceChildren(list);
          this.removeAttribute('aria-busy');
        } catch (error) {
          this.fallback();
        }
      }
    }
  );
}
