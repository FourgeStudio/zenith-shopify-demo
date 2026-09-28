/* Zenith: every "Amare Group" / "AmareGroup" in visible text links to https://amaregroup.ph/.
   Text only — attributes (alt, title, meta), existing links, form fields and code are left alone.
   A MutationObserver covers content added later (Judge.me reviews, cart drawer, section re-renders). */
(() => {
  if (window.zenithAmareLink) return;
  window.zenithAmareLink = true;

  const URL = 'https://amaregroup.ph/';
  const PATTERN = /amare\s?group/gi;
  const SKIP = 'a, button, script, style, noscript, textarea, input, select, option, code, pre, svg, [contenteditable], .zenith-amare-link';

  const linkify = (textNode) => {
    const text = textNode.nodeValue;
    PATTERN.lastIndex = 0;
    if (!PATTERN.test(text)) return;
    const parent = textNode.parentElement;
    if (!parent || parent.closest(SKIP)) return;

    const fragment = document.createDocumentFragment();
    let last = 0;
    PATTERN.lastIndex = 0;
    for (let match; (match = PATTERN.exec(text)); ) {
      if (match.index > last) fragment.append(text.slice(last, match.index));
      const a = document.createElement('a');
      a.href = URL;
      a.target = '_blank';
      a.rel = 'noopener';
      a.className = 'zenith-amare-link';
      a.textContent = match[0];
      fragment.append(a);
      last = match.index + match[0].length;
    }
    if (last < text.length) fragment.append(text.slice(last));
    textNode.replaceWith(fragment);
  };

  const scan = (root) => {
    if (!root || root.nodeType !== 1 || root.closest(SKIP)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (/amare\s?group/i.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const hits = [];
    while (walker.nextNode()) hits.push(walker.currentNode);
    hits.forEach(linkify);
  };

  const start = () => {
    scan(document.body);
    let queued = new Set();
    let timer = null;
    new MutationObserver((mutations) => {
      mutations.forEach((m) => m.addedNodes.forEach((n) => queued.add(n.nodeType === 3 ? n.parentElement : n)));
      clearTimeout(timer);
      timer = setTimeout(() => {
        const nodes = queued;
        queued = new Set();
        nodes.forEach((n) => n && n.isConnected && scan(n));
      }, 150);
    }).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
