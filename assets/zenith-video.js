if (!customElements.get('zenith-video')) {
  customElements.define(
    'zenith-video',
    class ZenithVideo extends HTMLElement {
      connectedCallback() {
        this.video = this.querySelector('video');
        this.button = this.querySelector('[data-video-toggle]');
        if (!this.video || !this.button) return;
        this.button.addEventListener('click', () => this.toggle());
        this.video.addEventListener('pause', () => this.setPlaying(false));
      }

      toggle() {
        if (this.video.paused) {
          document.querySelectorAll('zenith-video').forEach((other) => other !== this && other.pause());
          this.video.play();
          this.setPlaying(true);
        } else {
          this.pause();
        }
      }

      pause() {
        this.video?.pause();
        this.setPlaying(false);
      }

      setPlaying(playing) {
        this.classList.toggle('is-playing', playing);
        this.button.setAttribute('aria-pressed', String(playing));
        this.video.controls = playing;
      }
    }
  );
}
