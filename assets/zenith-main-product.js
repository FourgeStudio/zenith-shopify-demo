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

      disconnectedCallback() {
        if (this.track && this.onScroll) this.track.removeEventListener('scroll', this.onScroll);
        cancelAnimationFrame(this.frame);
      }

      /* ---------- Gallery ---------- */
      initGallery() {
        if (!this.track || this.thumbs.length === 0) return;

        this.thumbs.forEach((thumb) => {
          thumb.addEventListener('click', () => this.goToSlide(Number(thumb.dataset.thumb) || 0));
        });

        this.onScroll = () => {
          cancelAnimationFrame(this.frame);
          this.frame = requestAnimationFrame(() => this.setActiveThumb(this.currentIndex()));
        };
        this.track.addEventListener('scroll', this.onScroll, { passive: true });

        // Phones: open on the "Start at image" slide (section setting), once the track has a size.
        const start = (Number(this.dataset.startMobile) || 1) - 1;
        if (start > 0 && start < this.track.children.length && window.matchMedia('(max-width: 749px)').matches) {
          const apply = () => {
            if (!this.track.clientWidth) return false;
            this.track.scrollTo({ left: start * this.step, behavior: 'instant' });
            this.setActiveThumb(start);
            return true;
          };
          if (!apply()) {
            const observer = new ResizeObserver(() => {
              if (apply()) observer.disconnect();
            });
            observer.observe(this.track);
          }
        }
      }

      get step() {
        // Same measurement zenith-carousel.js uses: distance between two slides, or one slide's width.
        if (this.carousel && typeof this.carousel.step === 'number' && this.carousel.step > 0) {
          return this.carousel.step;
        }
        const slides = this.track.children;
        if (slides.length > 1) return slides[1].offsetLeft - slides[0].offsetLeft;
        return slides.length ? slides[0].offsetWidth : this.track.clientWidth;
      }

      currentIndex() {
        const step = this.step;
        if (!step) return 0;
        return Math.max(0, Math.min(this.track.children.length - 1, Math.round(this.track.scrollLeft / step)));
      }

      goToSlide(index) {
        if (this.carousel && typeof this.carousel.scrollToIndex === 'function') {
          this.carousel.scrollToIndex(index);
        } else {
          this.track.scrollTo({ left: index * this.step });
        }
        this.setActiveThumb(index);
      }

      setActiveThumb(index) {
        this.thumbs.forEach((thumb, i) => {
          const active = i === index;
          thumb.classList.toggle('is-active', active);
          if (active) {
            thumb.setAttribute('aria-current', 'true');
          } else {
            thumb.removeAttribute('aria-current');
          }
        });
        const active = this.thumbs[index];
        const list = active && active.closest('.zenith-mp__thumbs');
        if (!active || !list || list.scrollWidth <= list.clientWidth + 2) return;
        // Keep the active thumbnail in view without scrolling the page.
        const listRect = list.getBoundingClientRect();
        const itemRect = active.getBoundingClientRect();
        const left = list.scrollLeft + (itemRect.left - listRect.left) - (list.clientWidth - itemRect.width) / 2;
        list.scrollTo({ left, behavior: 'smooth' });
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
              if (soldOut) soldOut.classList.toggle('hidden', available);
            }
          });
        });
      }
    }
  );
}
