if (!customElements.get('zenith-carousel')) {
  customElements.define(
    'zenith-carousel',
    class ZenithCarousel extends HTMLElement {
      connectedCallback() {
        this.track = this.querySelector('.zenith-carousel__track');
        if (!this.track) return;
        this.slides = Array.from(this.track.children);
        this.prev = this.querySelector('[data-carousel-prev]');
        this.next = this.querySelector('[data-carousel-next]');
        this.dotsWrap = this.querySelector('.zenith-carousel__dots');

        this.prev?.addEventListener('click', () => this.go(-1));
        this.next?.addEventListener('click', () => this.go(1));
        this.track.addEventListener('scroll', () => this.onScroll(), { passive: true });

        // Mouse drag = swipe (touch already scrolls natively). No native image/link dragging, and a drag
        // doesn't count as a click on the link or card under the pointer.
        this.track.addEventListener('dragstart', (e) => e.preventDefault());
        this.track.addEventListener('pointerdown', (e) => this.dragStart(e));
        this.track.addEventListener(
          'click',
          (e) => {
            if (!this.justDragged) return;
            e.preventDefault();
            e.stopPropagation();
          },
          true
        );

        this.resizeObserver = new ResizeObserver(() => this.update());
        this.resizeObserver.observe(this.track);

        this.autoplay = Number(this.dataset.autoplay) || 0;
        if (this.autoplay && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          this.addEventListener('mouseenter', () => this.stop());
          this.addEventListener('focusin', () => this.stop());
          this.addEventListener('mouseleave', () => this.start());
          this.addPauseButton();
          this.start();
        }
      }

      // Pause/play for autoplay (WCAG 2.2.2), same markup as snippets/zenith-pause-button.liquid.
      // Goes beside the arrows / in the controls row; carousels without controls get it under the track.
      addPauseButton() {
        if (this.pauseButton) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'zenith-pause zenith-carousel__pause';
        button.setAttribute('aria-pressed', 'false');
        const label = `Pause ${(this.dataset.slideLabel || 'slide').toLowerCase()}s`;
        button.innerHTML =
          '<svg class="zenith-icon zenith-pause__pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M6.5 5h4v14h-4zM13.5 5h4v14h-4z"/></svg>' +
          '<svg class="zenith-icon zenith-pause__play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 5.5v13l10.5-6.5z"/></svg>' +
          `<span class="visually-hidden">${label}</span>`;
        button.addEventListener('click', () => {
          this.paused = button.getAttribute('aria-pressed') !== 'true';
          button.setAttribute('aria-pressed', String(this.paused));
          if (this.paused) this.stop();
          else this.start();
        });
        const arrows = this.querySelector('.zenith-carousel__arrows');
        const controls = this.querySelector('.zenith-carousel__controls');
        if (arrows) arrows.prepend(button);
        else if (controls) controls.append(button);
        else {
          button.classList.add('zenith-carousel__pause--solo');
          this.append(button);
        }
        this.pauseButton = button;
      }

      disconnectedCallback() {
        this.resizeObserver?.disconnect();
        this.stop();
      }

      get step() {
        const [first, second] = this.slides;
        if (!first) return this.track.clientWidth;
        return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
      }

      // Visible content width: bleeding tracks pad their scrollport so the first card sits on the page margin.
      get viewport() {
        const style = getComputedStyle(this.track);
        const pad = (parseFloat(style.scrollPaddingLeft) || 0) + (parseFloat(style.scrollPaddingRight) || 0);
        return this.track.clientWidth - pad;
      }

      get pageCount() {
        const perPage = Math.max(1, Math.round(this.viewport / this.step));
        return Math.max(1, this.slides.length - perPage + 1);
      }

      get index() {
        return Math.round(this.track.scrollLeft / this.step);
      }

      go(direction) {
        this.scrollToIndex(this.index + direction);
      }

      scrollToIndex(i) {
        const max = this.pageCount - 1;
        const target = i > max ? 0 : i < 0 ? max : i;
        this.track.scrollTo({ left: target * this.step });
      }

      dragStart(e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        if (this.track.scrollWidth <= this.track.clientWidth + 2) return;
        if (e.target.closest('button, input, select, textarea, iframe, video')) return;
        const startX = e.clientX;
        const startLeft = this.track.scrollLeft;
        let moved = false;
        const move = (ev) => {
          const dx = ev.clientX - startX;
          if (!moved && Math.abs(dx) > 5) {
            moved = true;
            this.track.classList.add('is-dragging');
            this.track.style.scrollSnapType = 'none';
            this.track.style.scrollBehavior = 'auto';
          }
          if (moved) this.track.scrollLeft = startLeft - dx;
        };
        const up = () => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          window.removeEventListener('pointercancel', up);
          if (!moved) return;
          this.track.classList.remove('is-dragging');
          this.track.style.scrollBehavior = '';
          const delta = this.track.scrollLeft - startLeft;
          const from = Math.round(startLeft / this.step);
          let to = Math.round(this.track.scrollLeft / this.step);
          // A short flick still moves one slide
          if (to === from && Math.abs(delta) > this.step * 0.15) to = from + Math.sign(delta);
          to = Math.max(0, Math.min(this.pageCount - 1, to));
          this.track.scrollTo({ left: to * this.step, behavior: 'smooth' });
          setTimeout(() => {
            this.track.style.scrollSnapType = '';
          }, 450);
          this.justDragged = true;
          setTimeout(() => {
            this.justDragged = false;
          }, 50);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
      }

      start() {
        this.stop();
        if (this.paused) return;
        this.timer = setInterval(() => this.go(1), this.autoplay * 1000);
      }

      stop() {
        clearInterval(this.timer);
      }

      onScroll() {
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() => this.updateState());
      }

      update() {
        // data-start: open scrolled to that slide (1-based), once, as soon as the track has a size
        if (!this.startApplied && this.track.clientWidth) {
          this.startApplied = true;
          const start = (Number(this.dataset.start) || 1) - 1;
          if (start > 0 && this.track.scrollWidth > this.track.clientWidth + 2) {
            this.track.scrollTo({ left: Math.min(start, this.pageCount - 1) * this.step, behavior: 'instant' });
          }
        }
        // All slides fit: .is-static hides the controls (sections can also center the slides)
        this.classList.toggle('is-static', this.track.scrollWidth <= this.track.clientWidth + 2);
        if (this.dotsWrap) {
          const count = this.pageCount;
          if (this.dotsWrap.children.length !== count) {
            this.dotsWrap.replaceChildren(
              ...Array.from({ length: count }, (_, i) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'zenith-carousel__dot';
                dot.setAttribute('aria-label', `${this.dataset.slideLabel || 'Slide'} ${i + 1}`);
                dot.addEventListener('click', () => this.scrollToIndex(i));
                return dot;
              })
            );
          }
          this.dotsWrap.hidden = count < 2;
        }
        this.updateState();
      }

      updateState() {
        const i = this.index;
        const atEnd = this.track.scrollLeft + this.track.clientWidth >= this.track.scrollWidth - 2;
        const scrollable = this.track.scrollWidth > this.track.clientWidth + 2;
        if (this.prev) this.prev.disabled = !scrollable || (!this.autoplay && i === 0);
        if (this.next) this.next.disabled = !scrollable || (!this.autoplay && atEnd);
        Array.from(this.dotsWrap?.children || []).forEach((dot, n) => {
          dot.setAttribute('aria-current', String(n === Math.min(i, this.pageCount - 1)));
        });
      }
    }
  );
}
