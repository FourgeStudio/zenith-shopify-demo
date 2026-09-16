if (!customElements.get('zenith-show-more')) {
  customElements.define(
    'zenith-show-more',
    class ZenithShowMore extends HTMLElement {
      connectedCallback() {
        this.button = this.querySelector('[data-show-more-button]');
        this.button?.addEventListener('click', () => this.reveal());
      }

      reveal() {
        const items = this.querySelectorAll('[data-show-more-item]');
        items.forEach((item) => item.classList.remove('hidden'));
        this.button.closest('.zenith-reviews__more')?.remove();
      }
    }
  );
}
