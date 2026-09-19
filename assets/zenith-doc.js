// Zenith · Document Table of Contents: highlights the section being read (the list itself is rendered in Liquid).
if (!customElements.get('zenith-doc-toc')) {
  customElements.define(
    'zenith-doc-toc',
    class ZenithDocToc extends HTMLElement {
      connectedCallback() {
        this.links = [...this.querySelectorAll('a[href^="#"]')];
        this.targets = this.links.map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))));
        if (!this.links.length) return;
        this.onScroll = () => {
          if (this.ticking) return;
          this.ticking = true;
          requestAnimationFrame(() => {
            this.ticking = false;
            this.update();
          });
        };
        window.addEventListener('scroll', this.onScroll, { passive: true });
        this.update();
      }

      disconnectedCallback() {
        window.removeEventListener('scroll', this.onScroll);
      }

      update() {
        const header = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 72;
        const line = header + window.innerHeight * 0.25;
        let active = 0;
        this.targets.forEach((target, i) => {
          if (target && target.getBoundingClientRect().top <= line) active = i;
        });
        this.links.forEach((link, i) => {
          link.classList.toggle('is-active', i === active);
          if (i === active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    }
  );
}
