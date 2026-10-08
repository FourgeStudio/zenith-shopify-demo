// Zenith · Policy pages: phone numbers and email addresses in the policy text become tel:/mailto: links.
// Text already inside a link is left alone. Loaded by layout/theme.liquid on Zenith-rendered policy pages only.
(() => {
  const body = document.querySelector('.zenith-doc--policy .zenith-doc__body');
  if (!body) return;
  // +63 977 444 3717 / +639774443717 / 0977-444-3717, and name@domain.tld
  const pattern = /(\+63[\s-]?9\d{2}[\s-]?\d{3}[\s-]?\d{4}|\b09\d{2}[\s-]?\d{3}[\s-]?\d{4}\b)|([A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,})/g;
  const probe = new RegExp(pattern.source); // no /g: .test() must not move lastIndex
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement.closest('a, script, style') || !probe.test(node.nodeValue)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const text = node.nodeValue;
    const frag = document.createDocumentFragment();
    let last = 0;
    pattern.lastIndex = 0;
    for (const m of text.matchAll(pattern)) {
      frag.append(text.slice(last, m.index));
      const a = document.createElement('a');
      if (m[1]) {
        const digits = m[1].replace(/\D/g, '');
        a.href = 'tel:+' + (digits.startsWith('63') ? digits : '63' + digits.slice(1));
      } else {
        a.href = 'mailto:' + m[2];
      }
      a.textContent = m[0];
      frag.append(a);
      last = m.index + m[0].length;
    }
    frag.append(text.slice(last));
    node.replaceWith(frag);
  });
})();
