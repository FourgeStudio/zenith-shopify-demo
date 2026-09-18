if (!customElements.get('zenith-video')) {
  customElements.define(
    'zenith-video',
    class ZenithVideo extends HTMLElement {
      connectedCallback() {
        this.video = this.querySelector('video');
        this.button = this.querySelector('[data-video-toggle]');
        if (!this.video || !this.button) return;

        this.onToggle = () => this.toggle();
        this.onPause = () => this.setPlaying(false);
        this.onPlay = () => this.setPlaying(true);
        this.button.addEventListener('click', this.onToggle);
        this.video.addEventListener('pause', this.onPause);
        this.video.addEventListener('play', this.onPlay);

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
        this.video?.removeEventListener('pause', this.onPause);
        this.video?.removeEventListener('play', this.onPlay);
      }

      toggle() {
        if (this.video.paused) {
          this.play();
        } else {
          this.pause();
        }
      }

      play() {
        // One video at a time across the page.
        document.querySelectorAll('zenith-video').forEach((other) => {
          if (other !== this && typeof other.pause === 'function') other.pause();
        });
        this.setPlaying(true);
        const attempt = this.video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(() => this.setPlaying(false));
        }
      }

      pause() {
        if (!this.video) return;
        if (!this.video.paused) this.video.pause();
        this.setPlaying(false);
      }

      setPlaying(playing) {
        if (!this.video || !this.button) return;
        this.classList.toggle('is-playing', playing);
        this.button.setAttribute('aria-pressed', String(playing));
        this.video.controls = playing;
      }
    }
  );
}
