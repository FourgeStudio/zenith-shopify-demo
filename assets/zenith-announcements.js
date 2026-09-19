/* Zenith announcement messages (sections/announcement-bar.liquid).
   "All in one row": measures whether the row fits; if not, adds .is-overflowing and the chosen fallback runs —
   rotate (one message at a time every data-speed seconds, paused on hover/focus), marquee, or wrap (one per line).
   Marquee (always, or as the fallback): repeats the message list until it fills the bar and scrolls it at
   data-marquee-speed px/s. Without JS the bar shows the plain row / a two-copy CSS marquee. */
if (!customElements.get('zenith-announcements')) {
  class ZenithAnnouncements extends HTMLElement {
    connectedCallback() {
      this.viewport = this.querySelector('.zenith-ann__viewport');
      this.track = this.querySelector('.zenith-ann__track');
      this.list = this.querySelector('.zenith-ann__list');
      if (!this.viewport || !this.track || !this.list) return;
      this.items = Array.from(this.list.children);
      this.index = 0;

      this.observer = new ResizeObserver(() => this.update());
      this.observer.observe(this.viewport);
      // Web fonts change the text width without resizing the bar: measure again once they're in
      document.fonts?.ready.then(() => {
        this.lastWidth = null;
        this.update();
      });

      const pause = () => (this.paused = true);
      const resume = () => (this.paused = false);
      this.addEventListener('mouseenter', pause);
      this.addEventListener('mouseleave', resume);
      this.addEventListener('focusin', pause);
      this.addEventListener('focusout', resume);

      // Theme editor: selecting a message block shows it
      this.onBlockSelect = (event) => {
        const i = this.items.indexOf(event.target.closest?.('.zenith-ann__item'));
        if (i > -1 && this.classList.contains('is-overflowing')) {
          this.show(i);
          this.paused = true;
        }
      };
      document.addEventListener('shopify:block:select', this.onBlockSelect);
    }

    disconnectedCallback() {
      this.observer?.disconnect();
      this.stopRotate();
      document.removeEventListener('shopify:block:select', this.onBlockSelect);
    }

    update() {
      // Only width matters (rotating/wrapping change the bar's height, which must not re-trigger this)
      const width = this.viewport.clientWidth;
      if (!this.items.length || width === this.lastWidth) return;
      this.lastWidth = width;

      const mode = this.dataset.mode;
      const overflow = this.dataset.overflow;
      let overflowing = false;

      if (mode === 'row') {
        // Natural one-row width: first message's left edge to the last one's right edge, measured in row layout
        this.classList.remove('is-overflowing');
        const first = this.items[0].getBoundingClientRect();
        const last = this.items[this.items.length - 1].getBoundingClientRect();
        overflowing = last.right - first.left > width + 1;
        this.classList.toggle('is-overflowing', overflowing);
      }

      if (mode === 'marquee' || (overflowing && overflow === 'marquee')) this.fillMarquee(width);
      if (mode === 'row' && overflow === 'rotate' && overflowing) this.startRotate();
      else this.stopRotate();
    }

    fillMarquee(width) {
      const listWidth = this.list.getBoundingClientRect().width;
      if (!listWidth) return;
      const copy = this.track.querySelector('.zenith-ann__list--copy');
      const needed = Math.ceil(width / listWidth) + 1;
      while (copy && this.track.children.length < needed) this.track.append(copy.cloneNode(true));
      const speed = Number(this.dataset.marqueeSpeed) || 40;
      this.style.setProperty('--zab-shift', `-${listWidth}px`);
      this.style.setProperty('--zab-duration', `${(listWidth / speed).toFixed(2)}s`);
    }

    startRotate() {
      this.show(this.index);
      if (this.timer || this.items.length < 2) return;
      const ms = (Number(this.dataset.speed) || 5) * 1000;
      this.timer = setInterval(() => {
        if (!this.paused) this.show((this.index + 1) % this.items.length);
      }, ms);
    }

    stopRotate() {
      clearInterval(this.timer);
      this.timer = null;
    }

    show(i) {
      this.index = i;
      this.items.forEach((item, n) => item.classList.toggle('is-active', n === i));
    }
  }

  customElements.define('zenith-announcements', ZenithAnnouncements);
}
