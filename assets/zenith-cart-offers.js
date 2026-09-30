/* Zenith: animates the cart goal panel (snippets/zenith-cart-offers.liquid).
   - Drawer opens (empty cart included): the fill grows from 0 at a steady speed once the drawer has slid in,
     and each reached checkpoint pops as the fill passes it.
   - Cart changes while the panel is on screen: Dawn swaps in fresh HTML, so the new panel starts at the last
     one's fill width and slides to its own; a checkpoint reached by the change pops as the fill arrives.
   Drawer and cart page are tracked separately. Nothing moves under prefers-reduced-motion. */
if (!customElements.get('zenith-cart-offers')) {
  const last = {};
  const POP_DELAY = 550; // ms into the 0.7s change slide
  const OPEN_DELAY = 250; // ms: Dawn's drawer slide (--duration-default 200ms) plus a beat
  const MS_PER_PCT = 12; // open fill speed: the whole track in 1.2s
  const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pctOf = (value) => parseFloat(value) || 0;

  const pop = (step, delay) => {
    step.classList.remove('is-pop');
    setTimeout(() => step.classList.add('is-pop'), delay);
  };

  const replay = (panel) => {
    const fill = panel.querySelector('.zenith-cart-offers__fill');
    if (!fill || still()) return;
    const target = fill.style.width;
    const duration = pctOf(target) * MS_PER_PCT;
    fill.style.transition = 'none';
    fill.style.width = '0%';
    fill.offsetWidth; // commit 0 before growing
    fill.style.transition = `width ${duration}ms linear ${OPEN_DELAY}ms`;
    fill.style.width = target;
    fill.addEventListener('transitionend', () => (fill.style.transition = ''), { once: true });
    // Checkpoints turn gold as the fill reaches them, not before.
    panel.querySelectorAll('.zenith-cart-offers__step.is-reached').forEach((step) => {
      step.classList.remove('is-reached', 'is-pop');
      setTimeout(() => step.classList.add('is-reached', 'is-pop'), OPEN_DELAY + pctOf(step.style.left) * MS_PER_PCT);
    });
  };

  const watched = new WeakSet();
  const watchDrawer = (drawer) => {
    if (!drawer || watched.has(drawer)) return;
    watched.add(drawer);
    let open = drawer.classList.contains('active');
    new MutationObserver(() => {
      const now = drawer.classList.contains('active');
      if (now && !open) drawer.querySelectorAll('zenith-cart-offers').forEach(replay);
      open = now;
    }).observe(drawer, { attributes: true, attributeFilter: ['class'] });
  };

  customElements.define(
    'zenith-cart-offers',
    class extends HTMLElement {
      connectedCallback() {
        const fill = this.querySelector('.zenith-cart-offers__fill');
        if (!fill) return;
        const drawer = this.closest('cart-drawer');
        watchDrawer(drawer);
        const steps = [...this.querySelectorAll('.zenith-cart-offers__step')];
        const key = this.dataset.context || 'drawer';
        const now = {
          width: fill.style.width,
          reached: steps.map((step) => step.classList.contains('is-reached')),
        };
        const prev = last[key];
        last[key] = now;
        // A closed drawer replays from 0 when it opens instead.
        if (!prev || prev.width === now.width || still() || (drawer && !drawer.classList.contains('active'))) return;

        fill.style.transition = 'none';
        fill.style.width = prev.width;
        fill.offsetWidth; // commit the old width before sliding
        fill.style.transition = '';
        fill.style.width = now.width;

        steps.forEach((step, i) => {
          if (now.reached[i] && !prev.reached[i]) pop(step, POP_DELAY);
        });
      }
    }
  );
}
