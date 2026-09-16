if (!customElements.get('zenith-countdown')) {
  customElements.define(
    'zenith-countdown',
    class ZenithCountdown extends HTMLElement {
      connectedCallback() {
        this.end = Date.parse(this.dataset.end);
        if (Number.isNaN(this.end)) return;
        this.units = {
          days: this.querySelector('[data-unit="days"]'),
          hours: this.querySelector('[data-unit="hours"]'),
          minutes: this.querySelector('[data-unit="minutes"]'),
          seconds: this.querySelector('[data-unit="seconds"]'),
        };
        this.tick();
        this.timer = setInterval(() => this.tick(), 1000);
      }

      disconnectedCallback() {
        clearInterval(this.timer);
      }

      tick() {
        const remaining = Math.max(0, this.end - Date.now());
        const s = Math.floor(remaining / 1000);
        const values = {
          days: Math.floor(s / 86400),
          hours: Math.floor((s % 86400) / 3600),
          minutes: Math.floor((s % 3600) / 60),
          seconds: s % 60,
        };
        for (const [unit, el] of Object.entries(this.units)) {
          if (el) el.textContent = String(values[unit]).padStart(2, '0');
        }
        if (remaining === 0) {
          clearInterval(this.timer);
          this.classList.add('is-expired');
          if (this.dataset.hideExpired === 'true') this.closest('[data-countdown-wrapper]')?.setAttribute('hidden', '');
        }
      }
    }
  );
}
