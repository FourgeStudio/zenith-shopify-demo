/* Zenith video card player: an uploaded <video>, or a YouTube embed (data-youtube-src) created on the first tap.
   One video plays at a time; playback pauses when the card leaves the screen. */
if (!customElements.get('zenith-video')) {
  let youTubeWarm = false;
  const warmYouTube = () => {
    if (youTubeWarm) return;
    youTubeWarm = true;
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://www.youtube-nocookie.com';
    document.head.append(link);
  };

  customElements.define(
    'zenith-video',
    class ZenithVideo extends HTMLElement {
      connectedCallback() {
        this.video = this.querySelector('video');
        this.youtubeSrc = this.dataset.youtubeSrc;
        this.button = this.querySelector('[data-video-toggle]');
        if ((!this.video && !this.youtubeSrc) || !this.button) return;

        this.onToggle = () => this.toggle();
        this.onPause = () => this.setPlaying(false);
        this.onPlay = () => this.setPlaying(true);
        this.button.addEventListener('click', this.onToggle);
        if (this.youtubeSrc) {
          // Open the connection to YouTube when a tap is likely (hover / touch / keyboard focus), not at page load
          this.onWarm = () => warmYouTube();
          this.addEventListener('pointerenter', this.onWarm, { once: true });
          this.addEventListener('touchstart', this.onWarm, { once: true, passive: true });
          this.button.addEventListener('focus', this.onWarm, { once: true });
        }
        if (this.video) {
          this.video.addEventListener('pause', this.onPause);
          this.video.addEventListener('play', this.onPlay);
        }

        // Stop playback when the card is swiped or scrolled out of view.
        if ('IntersectionObserver' in window) {
          this.observer = new IntersectionObserver(
            ([entry]) => {
              if (!entry.isIntersecting) this.pause();
            },
            { threshold: 0.25 }
          );
          this.observer.observe(this);
        }
      }

      disconnectedCallback() {
        this.observer?.disconnect();
        this.button?.removeEventListener('click', this.onToggle);
        if (this.onWarm) {
          this.removeEventListener('pointerenter', this.onWarm);
          this.removeEventListener('touchstart', this.onWarm);
          this.button?.removeEventListener('focus', this.onWarm);
        }
        this.video?.removeEventListener('pause', this.onPause);
        this.video?.removeEventListener('play', this.onPlay);
      }

      toggle() {
        if (this.classList.contains('is-playing')) {
          this.pause();
        } else {
          this.play();
        }
      }

      play() {
        // One video at a time across the page.
        document.querySelectorAll('zenith-video').forEach((other) => {
          if (other !== this && typeof other.pause === 'function') other.pause();
        });
        this.setPlaying(true);

        if (this.video) {
          const attempt = this.video.play();
          if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(() => this.setPlaying(false));
          }
          return;
        }

        if (!this.frame) {
          this.frame = document.createElement('iframe');
          this.frame.className = 'zenith-video-card__frame';
          this.frame.src = `${this.youtubeSrc}&origin=${encodeURIComponent(window.location.origin)}`;
          this.frame.title = this.dataset.title || 'YouTube video';
          this.frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
          // YouTube refuses embeds without a referrer (error 153)
          this.frame.referrerPolicy = 'strict-origin-when-cross-origin';
          this.frame.allowFullscreen = true;
          this.frame.setAttribute('frameborder', '0');
          this.prepend(this.frame);
        } else {
          this.command('playVideo');
        }
      }

      pause() {
        if (this.video) {
          if (!this.video.paused) this.video.pause();
        } else if (this.frame && this.classList.contains('is-playing')) {
          this.command('pauseVideo');
        }
        this.setPlaying(false);
      }

      command(func) {
        this.frame?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
      }

      setPlaying(playing) {
        if (!this.button) return;
        this.classList.toggle('is-playing', playing);
        this.button.setAttribute('aria-pressed', String(playing));
        if (this.video) this.video.controls = playing;
      }
    }
  );
}
