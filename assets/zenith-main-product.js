/* Zenith · Product page header — sections/zenith-main-product.liquid.
   Thumbnails <-> main carousel sync, the zero-padded quantity stepper and the minimal variant picker.
   All queries are scoped to the element so two instances on one page stay independent. */
if (!customElements.get('zenith-main-product')) {
  customElements.define(
    'zenith-main-product',
    class ZenithMainProduct extends HTMLElement {
      connectedCallback() {
        this.carousel = this.querySelector('zenith-carousel');
        this.track = this.querySelector('.zenith-mp__track');
        this.thumbs = Array.from(this.querySelectorAll('[data-thumb]'));

        this.initGallery();
        this.initQuantity();
        this.initVariants();
      }

      /* ---------- Gallery ---------- */
      // Slides, loop and the phone start image live in zenith-carousel (data-loop, data-start-mobile);
      // this keeps the thumbnails in step with it.
      initGallery() {
        if (!this.track || this.thumbs.length === 0) return;
        this.thumbs.forEach((thumb) => {
          thumb.addEventListener('click', () => this.goToSlide(Number(thumb.dataset.thumb) || 0));
        });
        this.thumbList = this.querySelector('.zenith-mp__thumbs');
        if (this.thumbList) {
          // Endless strip once the thumbnails overflow (checked again when the layout changes)
          this.thumbObserver = new ResizeObserver(() => this.loopThumbs());
          this.thumbObserver.observe(this.thumbList);
        }
        if (this.carousel) {
          this.carousel.addEventListener('zenith-carousel:change', (e) => this.setActiveThumb(e.detail.index));
          if (Number.isFinite(this.carousel.index)) this.setActiveThumb(this.carousel.index);
        }
      }

      goToSlide(index) {
        if (this.carousel && typeof this.carousel.scrollToIndex === 'function') {
          this.carousel.scrollToIndex(index);
        } else {
          this.track.scrollTo({ left: index * this.track.clientWidth });
        }
        this.setActiveThumb(index);
      }

      // One copy of the thumbnails on each side of the real ones; the strip centres whichever copy of
      // the active thumbnail is nearest, and when it comes to rest in a copy it jumps (invisibly) back
      // to the same spot in the real set. Copies are hidden from screen readers and the tab order.
      loopThumbs() {
        const list = this.thumbList;
        if (this.thumbsLooped || !list.clientWidth || list.scrollWidth <= list.clientWidth + 2) return;
        const items = Array.from(list.children);
        const copy = (item) => {
          const clone = item.cloneNode(true);
          clone.classList.add('is-clone');
          clone.setAttribute('aria-hidden', 'true');
          clone.querySelectorAll('[data-thumb]').forEach((button) => {
            button.tabIndex = -1;
            button.removeAttribute('aria-current');
            button.addEventListener('click', () => this.goToSlide(Number(button.dataset.thumb) || 0));
          });
          clone.querySelectorAll('img').forEach((img) => {
            img.loading = 'lazy';
          });
          return clone;
        };
        const head = items.map(copy);
        list.prepend(...head);
        list.append(...items.map(copy));
        this.thumbsLooped = true;
        this.thumbSet = items[0].offsetLeft - head[0].offsetLeft;
        this.allThumbs = Array.from(list.querySelectorAll('[data-thumb]'));
        list.style.scrollBehavior = 'auto';
        list.scrollLeft += this.thumbSet;
        list.style.scrollBehavior = '';
        list.addEventListener(
          'scroll',
          () => {
            clearTimeout(this.thumbSettle);
            this.thumbSettle = setTimeout(() => this.normalizeThumbs(), 150);
          },
          { passive: true }
        );
        const current = this.carousel && this.carousel.index;
        this.setActiveThumb(Number.isFinite(current) ? current : 0, 'instant');
      }

      normalizeThumbs() {
        const list = this.thumbList;
        const set = this.thumbSet;
        if (!this.thumbsLooped || !set) return;
        let left = list.scrollLeft;
        if (left < set * 0.5) left += set;
        else if (left > set * 1.5) left -= set;
        else return;
        list.style.scrollBehavior = 'auto';
        list.scrollLeft = left;
        list.style.scrollBehavior = '';
      }

      setActiveThumb(index, behavior) {
        this.thumbs.forEach((thumb, i) => {
          if (i === index) thumb.setAttribute('aria-current', 'true');
          else thumb.removeAttribute('aria-current');
        });
        const all = this.allThumbs || this.thumbs;
        all.forEach((thumb) => thumb.classList.toggle('is-active', Number(thumb.dataset.thumb) === index));
        const list = this.thumbList;
        if (!list || list.scrollWidth <= list.clientWidth + 2) return;
        // Keep the active thumbnail in view without scrolling the page: centre the nearest copy of it.
        const listRect = list.getBoundingClientRect();
        let best = null;
        all.forEach((thumb) => {
          if (Number(thumb.dataset.thumb) !== index) return;
          const rect = thumb.getBoundingClientRect();
          const left = list.scrollLeft + (rect.left - listRect.left) - (list.clientWidth - rect.width) / 2;
          if (best === null || Math.abs(left - list.scrollLeft) < Math.abs(best - list.scrollLeft)) best = left;
        });
        if (best !== null) list.scrollTo({ left: best, behavior: behavior || 'smooth' });
      }

      /* ---------- Quantity ---------- */
      initQuantity() {
        this.qtyInput = this.querySelector('.zenith-mp__qty-input');
        if (!this.qtyInput) return;
        this.qtyPad = Number(this.qtyInput.dataset.pad) || 0;
        this.qtyMin = Number(this.qtyInput.dataset.min) || 1;

        this.querySelectorAll('[data-qty-step]').forEach((button) => {
          button.addEventListener('click', () => {
            this.setQuantity(this.readQuantity() + (Number(button.dataset.qtyStep) || 0));
          });
        });

        this.qtyInput.addEventListener('change', () => this.setQuantity(this.readQuantity()));
        this.qtyInput.addEventListener('blur', () => this.setQuantity(this.readQuantity()));
      }

      readQuantity() {
        const value = parseInt(this.qtyInput.value, 10);
        return Number.isFinite(value) ? value : this.qtyMin;
      }

      setQuantity(value) {
        const next = Math.max(this.qtyMin, value);
        this.qtyInput.value = this.qtyPad ? String(next).padStart(this.qtyPad, '0') : String(next);
      }

      /* ---------- Variants ---------- */
      initVariants() {
        const inputs = Array.from(this.querySelectorAll('.zenith-mp__variant-input'));
        if (inputs.length === 0) return;
        const idInput = this.querySelector('.product-variant-id');
        const priceEl = this.querySelector('[data-price]');
        const compareEl = this.querySelector('[data-compare]');
        const submit = this.querySelector('[type="submit"]');

        inputs.forEach((input) => {
          input.addEventListener('change', () => {
            if (!input.checked) return;
            if (idInput) {
              idInput.value = input.value;
              idInput.disabled = input.dataset.available !== 'true';
            }
            if (priceEl && input.dataset.price) priceEl.textContent = input.dataset.price;
            if (compareEl) {
              compareEl.textContent = input.dataset.compare || '';
              compareEl.classList.toggle('zenith-mp__price-compare--hidden', !input.dataset.compare);
            }
            if (submit) {
              const available = input.dataset.available === 'true';
              submit.disabled = !available;
              // zenith-add-to-cart renders both labels; swap which one is visible.
              const label = submit.querySelector('span:not(.sold-out-message)');
              const soldOut = submit.querySelector('.sold-out-message');
              if (label) label.classList.toggle('hidden', !available);
              // A sold-out variant opened by ?variant= renders "Sold out" in the label span; restore the real label.
              if (label && available && this.dataset.atcLabel) label.textContent = this.dataset.atcLabel;
              if (soldOut) soldOut.classList.toggle('hidden', available);
            }
          });
        });
      }
    }
  );
}
