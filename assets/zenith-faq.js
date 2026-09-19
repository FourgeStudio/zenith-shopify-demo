/* Zenith FAQ: smooth open/close for browsers without native details animation (Safari, Firefox).
   Chrome/Edge animate natively in zenith-faq.css (interpolate-size + ::details-content), so this does nothing there.
   One delegated listener for every .zenith-faq__item on the page (FAQ + contact sections, theme editor re-renders). */
(() => {
  if (window.zenithFaqMotion) return;
  window.zenithFaqMotion = true;

  const native = CSS.supports('interpolate-size', 'allow-keywords') && CSS.supports('selector(::details-content)');
  if (native || !('animate' in Element.prototype)) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener('click', (event) => {
    const summary = event.target.closest('.zenith-faq__question');
    if (!summary || reduceMotion.matches) return;
    const item = summary.parentElement;
    const answer = item && item.querySelector('.zenith-faq__answer');
    if (!answer) return;
    event.preventDefault();

    // Clicking mid-animation reverses it from the current height
    const opening = item.zenithAnim ? !item.zenithOpening : !item.open;
    // A closed answer can report a stale height: start from 0 unless it's open or mid-animation.
    // Bottom padding animates too, or it would hold the closed answer open by its own size.
    const shown = item.open || item.zenithAnim;
    const from = shown ? answer.getBoundingClientRect().height : 0;
    const fromPad = shown ? getComputedStyle(answer).paddingBottom : '0px';
    if (item.zenithAnim) item.zenithAnim.cancel();

    item.open = true;
    item.classList.toggle('is-closing', !opening);
    const to = opening ? answer.getBoundingClientRect().height : 0;
    const toPad = opening ? getComputedStyle(answer).paddingBottom : '0px';

    answer.style.overflow = 'hidden';
    const anim = answer.animate(
      {
        height: [`${from}px`, `${to}px`],
        paddingBottom: [fromPad, toPad],
        opacity: opening ? [0, 1] : [1, 0],
      },
      { duration: 350, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
    );
    item.zenithAnim = anim;
    item.zenithOpening = opening;

    anim.onfinish = () => {
      if (!opening) item.open = false;
      item.classList.remove('is-closing');
      answer.style.overflow = '';
      item.zenithAnim = null;
      anim.cancel(); // drop the fill so the answer is back to its natural height
    };
  });
})();
