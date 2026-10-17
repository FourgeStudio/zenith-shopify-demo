if (!customElements.get('zenith-carousel')) {
  customElements.define(
    'zenith-carousel',
    class ZenithCarousel extends HTMLElement {
      connectedCallback() {
        this.track = this.querySelector('.zenith-carousel__track');
        if (!this.track) return;
        this.slides = Array.from(this.track.children);
        // Keyboard users can focus the scrolling strip and move it with the arrow keys (QA A-04)
        if (!this.track.hasAttribute('tabindex')) this.track.tabIndex = 0;
        if (!this.track.hasAttribute('aria-label')) this.track.setAttribute('aria-label', `${this.dataset.slideLabel || 'Slide'}s, scrollable`);
        this.prev = this.querySelector('[data-carousel-prev]');
        this.next = this.querySelector('[data-carousel-next]');
        this.dotsWrap = this.querySelector('.zenith-carousel__dots');

        // data-loop: endless slides (only once the slides overflow; checked on layout changes). Copies of the last / first slides sit before / after the real ones
        // (hidden from screen readers and keyboard); when the scroll comes to rest on a copy it jumps,
        // without animation, to the real slide it copies.
        this.clones = 0;
        this.wantsLoop = this.hasAttribute('data-loop') && this.slides.length > 1;

        this.prev?.addEventListener('click', () => this.go(-1));
        this.next?.addEventListener('click', () => this.go(1));
        this.track.addEventListener('scroll', () => this.onScroll(), { passive: true });
        if ('onscrollend' in window) this.track.addEventListener('scrollend', () => this.normalize());

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

        // Once the shopper moves the slides, layout changes no longer re-apply the start slide.
        ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach((type) =>
          this.track.addEventListener(
            type,
            () => {
              this.touched = true;
            },
            { passive: true }
          )
        );

        this.resizeObserver = new ResizeObserver(() => this.update());
        this.resizeObserver.observe(this.track);

        this.autoplay = Number(this.dataset.autoplay) || 0;
        if (this.autoplay && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          this.addEventListener('mouseenter', () => this.stop());
          this.addEventListener('focusin', () => this.stop());
          this.addEventListener('mouseleave', () => this.start());
          // data-pause-button="false": no pause button (client 2026-10-17); hover / focus still pause it
          if (this.dataset.pauseButton !== 'false') this.addPauseButton();
          // A video started in a slide stops the auto-advance for good
          this.addEventListener('click', (e) => {
            if (e.target.closest('.zenith-video-card__play, video, iframe')) {
              this.paused = true;
              this.stop();
            }
          });
          this.start();
        }
      }

      addClones() {
        // Enough copies to fill the visible width past either end (+1 for the peeking card)
        const perView = Math.ceil(this.track.clientWidth / this.step) + 1;
        const count = Math.min(this.slides.length, Math.max(2, perView));
        const copy = (slide) => {
          const clone = slide.cloneNode(true);
          clone.classList.add('is-clone');
          clone.setAttribute('aria-hidden', 'true');
          // Copies stay clickable (a video card in view can be played) but out of the tab order
          clone.querySelectorAll('a, button, iframe, video, [tabindex]').forEach((el) => el.setAttribute('tabindex', '-1'));
          clone.removeAttribute('id');
          clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
          clone.querySelectorAll('img').forEach((img) => {
            img.removeAttribute('fetchpriority');
            img.loading = 'lazy';
          });
          return clone;
        };
        const head = this.slides.slice(-count).map(copy);
        const tail = this.slides.slice(0, count).map(copy);
        this.track.prepend(...head);
        this.track.append(...tail);
        this.clones = count;
        this.dispatchEvent(new CustomEvent('zenith-carousel:cloned'));
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
        if (this.clones) return this.slides.length;
        const perPage = Math.max(1, Math.round(this.viewport / this.step));
        return Math.max(1, this.slides.length - perPage + 1);
      }

      // Scroll position of a real slide (the copies in front shift every real slide by `clones` steps)
      leftOf(i) {
        return (i + this.clones) * this.step;
      }

      get index() {
        const slot = Math.round(this.track.scrollLeft / this.step) - this.clones;
        if (!this.clones) return slot;
        const n = this.slides.length;
        return ((slot % n) + n) % n;
      }

      scrollTrack(left, behavior) {
        this.track.scrollTo(behavior ? { left, behavior } : { left });
      }

      go(direction) {
        this.touched = true;
        if (this.clones) {
          // Step onto the copy beside an end slide; normalize() then jumps to the real one.
          const slot = Math.round(this.track.scrollLeft / this.step) - this.clones;
          this.scrollTrack(this.leftOf(slot + direction));
          return;
        }
        this.scrollToIndex(this.index + direction);
      }

      scrollToIndex(i, behavior) {
        this.touched = true;
        if (this.clones) {
          this.scrollTrack(this.leftOf(i), behavior);
          return;
        }
        const max = this.pageCount - 1;
        const target = i > max ? 0 : i < 0 ? max : i;
        this.scrollTrack(target * this.step, behavior);
      }

      // Loop: resting on a copy → jump to the real slide without animation.
      normalize() {
        if (!this.clones || this.dragging) return;
        const n = this.slides.length;
        const slot = Math.round(this.track.scrollLeft / this.step);
        let real = slot;
        if (slot < this.clones) real = slot + n;
        else if (slot >= this.clones + n) real = slot - n;
        if (real === slot) return;
        this.track.style.scrollSnapType = 'none';
        this.track.style.scrollBehavior = 'auto';
        this.track.scrollLeft = real * this.step;
        requestAnimationFrame(() => {
          this.track.style.scrollSnapType = '';
          this.track.style.scrollBehavior = '';
        });
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
            this.dragging = true;
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
          this.dragging = false;
          this.track.classList.remove('is-dragging');
          this.track.style.scrollBehavior = '';
          const step = this.step;
          const delta = this.track.scrollLeft - startLeft;
          const from = Math.round(startLeft / step);
          let to = Math.round(this.track.scrollLeft / step);
          // A short flick still moves one slide
          if (to === from && Math.abs(delta) > step * 0.15) to = from + Math.sign(delta);
          const last = this.clones ? this.track.children.length - 1 : this.pageCount - 1;
          to = Math.max(0, Math.min(last, to));
          this.track.scrollTo({ left: to * step, behavior: 'smooth' });
          setTimeout(() => {
            this.track.style.scrollSnapType = '';
            this.normalize();
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
        if (this.clones && !('onscrollend' in window)) {
          clearTimeout(this.settle);
          this.settle = setTimeout(() => this.normalize(), 150);
        }
      }

      // Start slide (1-based): data-start-mobile on phones, otherwise data-start. Re-applied on every
      // layout change until the shopper moves the slides, so late CSS or images can't leave it on slide 1.
      get startIndex() {
        const mobile = window.matchMedia('(max-width: 749px)').matches && this.dataset.startMobile;
        const start = (Number(mobile || this.dataset.start) || 1) - 1;
        return Math.max(0, Math.min(this.slides.length - 1, start));
      }

      update() {
        if (this.wantsLoop && !this.clones && this.track.clientWidth && this.track.scrollWidth > this.track.clientWidth + 2) {
          this.addClones();
        }
        if (!this.touched && this.track.clientWidth) {
          const start = this.startIndex;
          if (this.clones) {
            this.track.scrollTo({ left: this.leftOf(start), behavior: 'instant' });
          } else if (start > 0 && this.track.scrollWidth > this.track.clientWidth + 2) {
            this.track.scrollTo({ left: Math.min(start, this.pageCount - 1) * this.step, behavior: 'instant' });
          }
        }
        // All slides fit: .is-static hides the controls (sections can also center the slides)
        this.classList.toggle('is-static', !this.clones && this.track.scrollWidth <= this.track.clientWidth + 2);
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
        const loops = this.clones || this.autoplay;
        if (this.prev) this.prev.disabled = !scrollable || (!loops && i === 0);
        if (this.next) this.next.disabled = !scrollable || (!loops && atEnd);
        Array.from(this.dotsWrap?.children || []).forEach((dot, n) => {
          dot.setAttribute('aria-current', String(n === Math.min(i, this.pageCount - 1)));
        });
        if (i !== this.lastIndex) {
          this.lastIndex = i;
          this.dispatchEvent(new CustomEvent('zenith-carousel:change', { detail: { index: i } }));
        }
      }
    }
  );
}
