if (!customElements.get('zenith-countdown')) {
  customElements.define(
    'zenith-countdown',
    class ZenithCountdown extends HTMLElement {
      connectedCallback() {
        clearInterval(this.timer);
        this.end = Date.parse(this.dataset.end);
        if (Number.isNaN(this.end)) return;
        this.units = {};
        ['days', 'hours', 'minutes', 'seconds'].forEach((unit) => {
          const el = this.querySelector(`[data-unit="${unit}"]`);
          if (el) this.units[unit] = el;
        });
        this.tick(true);
        this.timer = setInterval(() => this.tick(false), 1000);
      }

      disconnectedCallback() {
        clearInterval(this.timer);
      }

      tick(initial) {
        const remaining = Math.max(0, this.end - Date.now());
        const s = Math.floor(remaining / 1000);
        const values = {
          days: Math.floor(s / 86400),
          hours: Math.floor((s % 86400) / 3600),
          minutes: Math.floor((s % 3600) / 60),
          seconds: s % 60,
        };
        for (const [unit, el] of Object.entries(this.units)) {
          const text = String(values[unit]).padStart(2, '0');
          if (el.textContent === text) continue;
          el.textContent = text;
          if (!initial) {
            el.classList.remove('is-rolling');
            void el.offsetWidth;
            el.classList.add('is-rolling');
          }
        }
        if (remaining === 0) {
          clearInterval(this.timer);
          this.classList.add('is-expired');
          if (this.dataset.hideExpired === 'true') {
            this.closest('[data-countdown-wrapper]')?.setAttribute('hidden', '');
          }
        }
      }
    }
  );
}
