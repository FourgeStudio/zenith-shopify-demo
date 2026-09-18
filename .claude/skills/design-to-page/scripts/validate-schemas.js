// Check section / block / theme-settings schemas against Shopify upload rules that `theme check` misses.
// Shopify REJECTS the whole file on any of these (the GitHub sync then keeps the old file and can
// commit it back over yours on the next editor save).
// Usage: node validate-schemas.js [repoRoot]   → exit 1 when anything is wrong.
const fs = require('fs');
const path = require('path');

const repo = process.argv[2] || '.';
const problems = [];
const err = (where, msg) => problems.push(`${where}: ${msg}`);

function checkSetting(where, st, ids) {
  const at = `${where} › ${st.id || st.type}`;
  if (st.id) {
    if (ids.has(st.id)) err(at, 'duplicate id');
    ids.add(st.id);
  }
  // Translation keys (t:...) are resolved by Shopify — not checkable here.
  const has = (k) => Object.prototype.hasOwnProperty.call(st, k) && !(typeof st[k] === 'string' && st[k].startsWith('t:'));
  switch (st.type) {
    case 'range': {
      const { min, max, step = 1 } = st;
      if (![min, max, step].every((n) => typeof n === 'number')) { err(at, 'min/max/step must be numbers'); break; }
      const steps = (max - min) / step;
      if (steps > 101) err(at, `too many steps: (${max}-${min})/${step} = ${steps} (max 101)`);
      if (steps < 2) err(at, `only ${steps} step(s) — use at least 2 (or a select)`);
      if (Math.abs(steps - Math.round(steps)) > 1e-9) err(at, 'max is not reachable in whole steps from min');
      if (!has('default')) err(at, 'range needs a default');
      else if (st.default < min || st.default > max) err(at, `default ${st.default} outside ${min}-${max}`);
      else if (Math.abs((st.default - min) / step - Math.round((st.default - min) / step)) > 1e-9) err(at, `default ${st.default} not on step ${step}`);
      if (st.unit && st.unit.length > 3) err(at, `unit "${st.unit}" longer than 3 chars`);
      break;
    }
    case 'select':
    case 'radio':
      if (!Array.isArray(st.options) || !st.options.length) err(at, 'needs options');
      else if (has('default') && !st.options.some((o) => o.value === st.default)) err(at, `default "${st.default}" not in options`);
      break;
    case 'checkbox':
      if (has('default') && typeof st.default !== 'boolean') err(at, 'checkbox default must be true/false');
      break;
    case 'number':
      if (has('default') && typeof st.default !== 'number') err(at, 'number default must be a number');
      break;
    case 'text':
    case 'textarea':
    case 'html':
      if (has('default') && st.default === '') err(at, 'empty-string default (omit it instead)');
      break;
    case 'richtext':
      if (has('default') && !/^\s*<(p|ul|ol|h[1-6])[\s>]/.test(st.default)) err(at, 'richtext default must start with <p>, <ul>, <ol> or <h1-6>');
      break;
    case 'inline_richtext':
      if (has('default') && /<(p|div|ul|ol|h[1-6])[\s>]/.test(st.default)) err(at, 'inline_richtext default cannot contain block tags');
      break;
    case 'url':
      if (has('default') && !['/collections', '/collections/all'].includes(st.default)) err(at, `url default "${st.default}" not allowed (only /collections or /collections/all)`);
      break;
    case 'color':
      if (has('default') && st.default !== '' && !/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(st.default)) err(at, `color default "${st.default}" is not a hex colour`);
      break;
    case 'image_picker':
    case 'video':
    case 'collection':
    case 'product':
    case 'blog':
    case 'page':
    case 'link_list':
      break;
  }
  if (!['header', 'paragraph', 'color_scheme_group'].includes(st.type) && !st.label) err(at, 'missing label');
  if (st.type === 'header' && !st.content) err(at, 'header needs content');
}

function checkSchema(where, schema) {
  const ids = new Set();
  for (const st of schema.settings || []) checkSetting(where, st, ids);
  const blockTypes = new Set();
  for (const b of schema.blocks || []) {
    if (blockTypes.has(b.type)) err(where, `duplicate block type ${b.type}`);
    blockTypes.add(b.type);
    if (b.type === '@app') continue;
    if (!b.name) err(`${where} › block ${b.type}`, 'block needs a name');
    const bids = new Set();
    for (const st of b.settings || []) checkSetting(`${where} › block ${b.type}`, st, bids);
  }
  if (schema.max_blocks > 50) err(where, 'max_blocks > 50');
  for (const p of schema.presets || []) {
    for (const b of p.blocks || []) if (!blockTypes.has(b.type)) err(`${where} › preset "${p.name}"`, `unknown block type ${b.type}`);
  }
}

for (const f of fs.readdirSync(path.join(repo, 'sections')).filter((f) => f.endsWith('.liquid'))) {
  const src = fs.readFileSync(path.join(repo, 'sections', f), 'utf8');
  const m = src.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  if (!m) continue;
  let schema;
  try { schema = JSON.parse(m[1]); } catch (e) { err(`sections/${f}`, 'schema is not valid JSON: ' + e.message); continue; }
  checkSchema(`sections/${f}`, schema);
}

const ts = JSON.parse(fs.readFileSync(path.join(repo, 'config/settings_schema.json'), 'utf8'));
const themeIds = new Set();
for (const group of ts) for (const st of group.settings || []) checkSetting(`settings_schema › ${group.name}`, st, themeIds);

console.log(problems.length ? problems.join('\n') : 'all schemas pass Shopify upload rules');
process.exit(problems.length ? 1 : 0);
