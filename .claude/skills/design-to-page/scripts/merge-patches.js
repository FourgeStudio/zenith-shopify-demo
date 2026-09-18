// Validate section patches against their {% schema %}, then (with --write) merge them into a template / section group.
// A patch = <patchDir>/<section key>.json holding the COMPLETE section object (type, settings, blocks, block_order[, disabled]).
// Usage: node merge-patches.js <repoRoot> <templates/page.json | sections/x-group.json> <patchDir> [--write]
// Checks: unknown setting ids, range min/max/step, select/radio options, checkbox types, block types, block_order, max_blocks.
const fs = require('fs');
const path = require('path');

const [repo, target, patchDir, flag] = process.argv.slice(2);
if (!repo || !target || !patchDir) {
  console.error('usage: node merge-patches.js <repoRoot> <template.json> <patchDir> [--write]');
  process.exit(2);
}
const targetPath = path.join(repo, target);
const raw = fs.readFileSync(targetPath, 'utf8');
const header = raw.match(/^\/\*[\s\S]*?\*\/\s*/)?.[0] ?? '';
const tpl = JSON.parse(raw.slice(header.length));

function schemaOf(type) {
  const s = fs.readFileSync(path.join(repo, 'sections', type + '.liquid'), 'utf8');
  const m = s.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  return JSON.parse(m[1]);
}

function checkSettings(where, defs, values, errs) {
  const byId = Object.fromEntries(defs.filter((d) => d.id).map((d) => [d.id, d]));
  for (const [k, v] of Object.entries(values || {})) {
    const d = byId[k];
    if (!d) { errs.push(`${where}: unknown setting "${k}"`); continue; }
    if (d.type === 'range') {
      if (typeof v !== 'number') errs.push(`${where}.${k}: range value not a number (${v})`);
      else {
        if (v < d.min || v > d.max) errs.push(`${where}.${k}: ${v} outside ${d.min}-${d.max}`);
        const steps = (v - d.min) / (d.step || 1);
        if (Math.abs(steps - Math.round(steps)) > 1e-6) errs.push(`${where}.${k}: ${v} not on step ${d.step} from ${d.min}`);
      }
    }
    if ((d.type === 'select' || d.type === 'radio') && !d.options.some((o) => o.value === v))
      errs.push(`${where}.${k}: "${v}" not in options`);
    if (d.type === 'checkbox' && typeof v !== 'boolean') errs.push(`${where}.${k}: checkbox not boolean`);
  }
}

const errs = [];
const patches = fs.readdirSync(patchDir).filter((f) => f.endsWith('.json'));
for (const f of patches) {
  const key = f.replace(/\.json$/, '');
  const p = JSON.parse(fs.readFileSync(path.join(patchDir, f), 'utf8'));
  const isNew = !tpl.sections[key];
  if (!isNew && p.type !== tpl.sections[key].type) errs.push(`${key}: type ${p.type} != ${tpl.sections[key].type}`);
  const schema = schemaOf(p.type);
  checkSettings(key, schema.settings || [], p.settings, errs);
  const blockDefs = Object.fromEntries((schema.blocks || []).map((b) => [b.type, b]));
  for (const [bid, b] of Object.entries(p.blocks || {})) {
    const bd = blockDefs[b.type] || (b.type.startsWith('shopify://') || blockDefs['@app'] ? { settings: null } : null);
    if (!bd) { errs.push(`${key}.${bid}: unknown block type ${b.type}`); continue; }
    if (bd.settings) checkSettings(`${key}.${bid}`, bd.settings, b.settings, errs);
  }
  for (const bid of p.block_order || []) if (!p.blocks?.[bid]) errs.push(`${key}: block_order has missing ${bid}`);
  for (const bid of Object.keys(p.blocks || {})) if (!(p.block_order || []).includes(bid)) errs.push(`${key}: block ${bid} not in block_order`);
  if (schema.max_blocks && Object.keys(p.blocks || {}).length > schema.max_blocks)
    errs.push(`${key}: ${Object.keys(p.blocks).length} blocks > max ${schema.max_blocks}`);
  if (flag === '--write') {
    tpl.sections[key] = p;
    if (isNew) console.log(`${key}: NEW section — add it to "order" yourself`);
  }
}
console.log(`patches: ${patches.length}`);
console.log(errs.length ? errs.join('\n') : 'no schema errors');
if (flag === '--write') {
  if (errs.length) { console.log('not written (fix errors first)'); process.exit(1); }
  fs.writeFileSync(targetPath, header + JSON.stringify(tpl, null, 2) + '\n');
  console.log(`${target} written`);
}
