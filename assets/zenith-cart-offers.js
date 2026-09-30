/* Zenith: animates the cart goal panel (snippets/zenith-cart-offers.liquid) across cart changes.
   Dawn swaps in freshly rendered HTML on every change, so the new panel remembers the last one's fill width:
   it starts there and slides to its own, and a checkpoint reached by this change pops as the fill arrives.
   First render on page load shows the bar as-is. Drawer and cart page are tracked separately. */
if (!customElements.get('zenith-cart-offers')) {
  const last = {};
  const POP_DELAY = 550; // ms into the 0.7s fill slide

  customElements.define(
    'zenith-cart-offers',
    class extends HTMLElement {
      connectedCallback() {
        const fill = this.querySelector('.zenith-cart-offers__fill');
        if (!fill) return;
        const steps = [...this.querySelectorAll('.zenith-cart-offers__step')];
        const key = this.dataset.context || 'drawer';
        const now = {
          width: fill.style.width,
          reached: steps.map((step) => step.classList.contains('is-reached')),
        };
        const prev = last[key];
        last[key] = now;
        if (!prev || prev.width === now.width) return;

        fill.style.transition = 'none';
        fill.style.width = prev.width;
        fill.offsetWidth; // commit the old width before sliding
        fill.style.transition = '';
        fill.style.width = now.width;

        steps.forEach((step, i) => {
          if (now.reached[i] && !prev.reached[i]) setTimeout(() => step.classList.add('is-pop'), POP_DELAY);
        });
      }
    }
  );
}
