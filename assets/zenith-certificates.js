/* Certificates: a click on a certificate image opens it large in a lightbox (<dialog>) instead of a new tab.
   Links with data-zenith-lightbox keep their href as the no-JS fallback. One dialog per page. */
(() => {
  if (window.zenithCertLightbox) return;
  window.zenithCertLightbox = true;

  let dialog;
  let img;

  const build = () => {
    dialog = document.createElement('dialog');
    dialog.className = 'zenith-lightbox';
    dialog.setAttribute('aria-label', 'Certificate');
    dialog.innerHTML =
      '<button type="button" class="zenith-lightbox__close" aria-label="Close">' +
      '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '</button><img class="zenith-lightbox__img" alt="">';
    img = dialog.querySelector('img');
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    // Click on the backdrop (outside the image) closes it.
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('zenith-lightbox-open');
      img.removeAttribute('src');
    });
    document.body.appendChild(dialog);
  };

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-zenith-lightbox]');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (!dialog) build();
    img.src = link.href;
    img.alt = link.dataset.alt || '';
    document.documentElement.classList.add('zenith-lightbox-open');
    dialog.showModal();
  });
})();
