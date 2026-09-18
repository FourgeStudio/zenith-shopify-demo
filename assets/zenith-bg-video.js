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
      if (this.onMessage) window.removeEventListener('message', this.onMessage);
    }

    mount() {
      if (this.dataset.kind === 'youtube') {
        const frame = document.createElement('iframe');
        // origin= lets the player send its state back to this page (postMessage)
        frame.src = `${this.dataset.src}&origin=${encodeURIComponent(window.location.origin)}`;
        frame.title = this.dataset.title || 'Video';
        frame.allow = 'autoplay; encrypted-media; picture-in-picture';
        // YouTube refuses embeds without a referrer (error 153)
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.tabIndex = -1;
        frame.setAttribute('frameborder', '0');
        // Fade in only once YouTube reports "playing" (its spinner/logo stay hidden behind the cover image).
        // Blocked autoplay → no "playing" → the cover image stays. No messages at all → fade in after 6s.
        this.onMessage = (event) => {
          if (event.source !== frame.contentWindow) return;
          this.heard = true;
          let data;
          try {
            data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          } catch (e) {
            return;
          }
          const state = data && data.info && typeof data.info === 'object' ? data.info.playerState : data && data.info;
          // YouTube shows its title and a pause button for a few seconds after (re)starting: keep the cover up until they fade
          if (state === 1 && !this.classList.contains('is-ready') && !this.revealTimer) {
            this.revealTimer = setTimeout(() => {
              this.revealTimer = null;
              this.classList.add('is-ready');
            }, 3500);
          }
          // Loop without YouTube's playlist mode (that pins Shorts buttons and prev/next over the video)
          if (state === 0 && this.visible) {
            this.classList.remove('is-ready');
            // restart once the cover has faded back in (0.4s), so the restart buttons are never seen
            setTimeout(() => {
              this.command('seekTo', [0, true]);
              this.command('playVideo');
            }, 450);
          }
        };
        window.addEventListener('message', this.onMessage);
        frame.addEventListener(
          'load',
          () => {
            // Like YouTube's own API script: repeat the handshake until the player answers
            let tries = 0;
            const hello = setInterval(() => {
              if (this.heard || ++tries > 24) {
                clearInterval(hello);
                if (!this.heard) this.classList.add('is-ready');
                return;
              }
              frame.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*');
            }, 250);
          },
          { once: true }
        );
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
      this.visible = play;
      const media = this.media;
      if (!media) return;
      if (media.tagName === 'VIDEO') {
        if (play) {
          const attempt = media.play();
          if (attempt) attempt.catch(() => {});
        } else {
          media.pause();
        }
      } else if (this.heard) {
        // Paused off screen → back to the cover, so YouTube's resume buttons stay hidden too
        if (!play) this.classList.remove('is-ready');
        this.command(play ? 'playVideo' : 'pauseVideo');
      }
    }

    command(func, args = []) {
      this.media?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
    }
  }

  customElements.define('zenith-bg-video', ZenithBgVideo);
}
