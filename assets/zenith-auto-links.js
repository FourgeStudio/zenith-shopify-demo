/* Zenith: brand and policy names in visible text become links.
     "Amare Group" / "AmareGroup"                → https://amaregroup.ph/ (new tab)
     "Refunds and Returns", "Refund/Return(s) Policy" → /policies/refund-policy
     "Shipping Policy"                             → /policies/shipping-policy
     "Privacy Policy"                              → /policies/privacy-policy
     "Terms of Service", "Terms and Conditions"    → /policies/terms-of-service
   Text only — attributes (alt, title, meta), existing links, headings, FAQ questions, menus, form fields and
   code are left alone, and a page never links to itself. Written links in content stay the primary source
   (crawlable); this catches mentions typed later. A MutationObserver covers content added after load
   (Judge.me reviews, cart drawer, section re-renders). */
(() => {
  if (window.zenithAutoLinks) return;
  window.zenithAutoLinks = true;

  const RULES = [
    { re: /amare\s?group/i, href: 'https://amaregroup.ph/', cls: 'zenith-amare-link', external: true },
    { re: /refunds?\s+(?:and|&)\s+returns?|(?:refund|returns?)\s+policy/i, href: '/policies/refund-policy', cls: 'zenith-policy-link' },
    { re: /shipping\s+policy/i, href: '/policies/shipping-policy', cls: 'zenith-policy-link' },
    { re: /privacy\s+policy/i, href: '/policies/privacy-policy', cls: 'zenith-policy-link' },
    { re: /terms\s+of\s+service|terms\s+(?:and|&)\s+conditions/i, href: '/policies/terms-of-service', cls: 'zenith-policy-link' },
  ].filter((r) => r.external || location.pathname !== r.href);

  const ANY = new RegExp(RULES.map((r) => `(${r.re.source})`).join('|'), 'gi');
  const TEST = new RegExp(ANY.source, 'i');
  const SKIP = 'a, button, script, style, noscript, textarea, input, select, option, code, pre, svg, [contenteditable]';
  // Policy names are left as plain text in titles, FAQ questions (clicking would follow the link instead of opening
  // the answer), menus and form labels.
  const POLICY_SKIP = 'summary, h1, h2, h3, h4, h5, h6, nav, label, .zenith-doc__toc';

  const linkify = (textNode) => {
    const text = textNode.nodeValue;
    const parent = textNode.parentElement;
    if (!parent || parent.closest(SKIP)) return;
    const policyOk = !parent.closest(POLICY_SKIP);

    const fragment = document.createDocumentFragment();
    let last = 0;
    ANY.lastIndex = 0;
    for (let match; (match = ANY.exec(text)); ) {
      const rule = RULES[match.slice(1).findIndex((g) => g !== undefined)];
      if (!rule.external && !policyOk) continue;
      if (match.index > last) fragment.append(text.slice(last, match.index));
      const a = document.createElement('a');
      a.href = rule.href;
      a.className = rule.cls;
      if (rule.external) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      a.textContent = match[0];
      fragment.append(a);
      last = match.index + match[0].length;
    }
    if (last === 0) return;
    if (last < text.length) fragment.append(text.slice(last));
    textNode.replaceWith(fragment);
  };

  const scan = (root) => {
    if (!root || root.nodeType !== 1 || root.closest(SKIP)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (TEST.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
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
