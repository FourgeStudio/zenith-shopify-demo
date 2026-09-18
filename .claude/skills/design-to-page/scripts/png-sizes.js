// List every PNG under a folder with pixel size and file size (reads the PNG header only).
// Usage: node png-sizes.js "design/<page>"
const fs = require('fs');
const path = require('path');

const root = process.argv[2] || 'design';
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

for (const f of walk(root).filter((f) => /\.png$/i.test(f))) {
  const b = fs.readFileSync(f);
  const alpha = b[25] === 6 || b[25] === 4 ? ' alpha' : '';
  console.log(`${b.readUInt32BE(16)}x${b.readUInt32BE(20)}${alpha}`.padEnd(16), `${(b.length / 1024) | 0}KB`.padEnd(8), f);
}
