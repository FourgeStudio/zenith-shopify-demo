/* Zenith background video (snippets/zenith-bg-video.liquid): muted loop, no controls.
   The <video>/<iframe> is created only when the element nears the viewport, plays while visible and pauses off screen.
   Reduced motion: never mounted, the cover image stays. */
if (!customElements.get('zenith-bg-video')) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  class ZenithBgVideo extends HTMLElement {
    connectedCallback() {
      if (reduceMotion.matches || !this.dataset.src || this.observer) return;
      this.observer = new IntersectionObserver(
        (entries) => {
          const visible = entries[entries.length - 1].isIntersecting;
          if (visible && !this.media) this.mount();
          this.toggle(visible);
        },
        { rootMargin: '200px 0px' }
      );
      this.observer.observe(this);
    }

    disconnectedCallback() {
      if (this.observer) this.observer.disconnect();
      this.observer = null;
    }

    mount() {
      if (this.dataset.kind === 'youtube') {
        const frame = document.createElement('iframe');
        frame.src = this.dataset.src;
        frame.title = this.dataset.title || 'Video';
        frame.allow = 'autoplay; encrypted-media; picture-in-picture';
        frame.tabIndex = -1;
        frame.setAttribute('frameborder', '0');
        // YouTube paints black before the first frame: fade in a moment after load
        frame.addEventListener('load', () => setTimeout(() => this.classList.add('is-ready'), 800), { once: true });
        this.media = frame;
      } else {
        const video = document.createElement('video');
        video.muted = true;
        video.defaultMuted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.preload = 'auto';
        video.src = this.dataset.src;
        video.addEventListener('playing', () => this.classList.add('is-ready'), { once: true });
        this.media = video;
      }
      this.appendChild(this.media);
    }

    toggle(play) {
      const media = this.media;
      if (!media) return;
      if (media.tagName === 'VIDEO') {
        if (play) {
          const attempt = media.play();
          if (attempt) attempt.catch(() => {});
        } else {
          media.pause();
        }
      } else if (media.contentWindow && this.classList.contains('is-ready')) {
        media.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: play ? 'playVideo' : 'pauseVideo', args: [] }),
          '*'
        );
      }
    }
  }

  customElements.define('zenith-bg-video', ZenithBgVideo);
}
