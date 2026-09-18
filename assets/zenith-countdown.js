// Slot-machine countdown (snippets/zenith-countdown.liquid).
// Days/hours/minutes/seconds: each digit is a reel [old, new]; a changed digit rolls up (old out the top, new in from below).
// Hundredths: CSS reels spin continuously; JS only syncs their phase to the real remaining time.
if (!customElements.get('zenith-countdown')) {
  customElements.define(
    'zenith-countdown',
    class ZenithCountdown extends HTMLElement {
      connectedCallback() {
        this.stop();
        this.end = Date.parse(this.dataset.end);
        if (Number.isNaN(this.end)) return;
        this.units = [...this.querySelectorAll('[data-unit]')].map((el) => ({
          name: el.dataset.unit,
          el,
          text: el.parentElement.querySelector('[data-unit-text]'),
          reels: [],
          value: null,
        }));
        this.tick = this.tick.bind(this);
        this.paint(true);
        this.syncSpin();
        if (this.remaining() > 0) this.schedule();
        else this.expire();
      }

      disconnectedCallback() {
        this.stop();
      }

      stop() {
        clearTimeout(this.timer);
      }

      remaining() {
        return Math.max(0, this.end - Date.now());
      }

      // Next tick lands just after the next whole second, so the seconds reel changes on time.
      schedule() {
        this.timer = setTimeout(this.tick, (this.remaining() % 1000) + 20);
      }

      tick() {
        this.paint(false);
        if (this.remaining() > 0) this.schedule();
        else this.expire();
      }

      paint(initial) {
        const s = Math.floor(this.remaining() / 1000);
        const values = {
          days: Math.floor(s / 86400),
          hours: Math.floor((s % 86400) / 3600),
          minutes: Math.floor((s % 3600) / 60),
          seconds: s % 60,
        };
        for (const unit of this.units) {
          const text = String(values[unit.name]).padStart(2, '0');
          if (text === unit.value) continue;
          unit.value = text;
          if (unit.text) unit.text.textContent = text;
          this.setDigits(unit, text, !initial);
        }
      }

      setDigits(unit, text, animate) {
        while (unit.reels.length < text.length) unit.reels.unshift(this.createReel(unit));
        while (unit.reels.length > text.length) unit.reels.shift().root.remove();
        [...text].forEach((digit, i) => this.roll(unit.reels[i], digit, animate));
      }

      createReel(unit) {
        if (!unit.reels.length) unit.el.textContent = '';
        const root = document.createElement('span');
        root.className = 'zenith-countdown__reel';
        const strip = document.createElement('span');
        strip.className = 'zenith-countdown__strip';
        strip.append(document.createElement('span'), document.createElement('span'));
        root.append(strip);
        unit.el.prepend(root);
        return { root, strip, digit: null };
      }

      roll(reel, digit, animate) {
        if (reel.digit === digit) return;
        const [from, to] = reel.strip.children;
        from.textContent = reel.digit ?? digit;
        to.textContent = digit;
        reel.digit = digit;
        reel.strip.classList.remove('is-rolling');
        if (!animate) return;
        void reel.strip.offsetWidth; // restart the animation
        reel.strip.classList.add('is-rolling');
      }

      // Start each hundredths reel at the phase that matches the real remaining time.
      syncSpin() {
        const ms = this.remaining() % 1000;
        this.querySelectorAll('.zenith-countdown__strip--spin').forEach((strip, i) => {
          const period = i === 0 ? 1000 : 100;
          const left = ms % period;
          strip.style.animationDelay = `-${period - left}ms`;
        });
      }

      expire() {
        this.stop();
        this.classList.add('is-expired');
        if (this.dataset.hideExpired === 'true') {
          this.closest('[data-countdown-wrapper]')?.setAttribute('hidden', '');
        }
      }
    }
  );
}
