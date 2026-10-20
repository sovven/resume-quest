// node build.mjs  →  dist/简历大冒险.html + dist/简历大冒险-手机版.html (双击即可离线打开)
//                    dist/artifact.html + dist/artifact-mobile.html (发布到 claude.ai 用)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(root, 'src/index.html'), 'utf8');
const font = readFileSync(join(root, 'assets/fonts/fusion-pixel-zh_hans.woff2')).toString('base64');

const FONT_URL = 'url("../assets/fonts/fusion-pixel-zh_hans.woff2")';
if (!src.includes(FONT_URL)) throw new Error('font url not found in src/index.html');
const full = src.replace(FONT_URL, `url("data:font/woff2;base64,${font}")`);

const pick = (a, b) => {
  const i = full.indexOf(a), j = full.indexOf(b);
  if (i < 0 || j < 0) throw new Error(`marker ${a} missing`);
  return full.slice(i + a.length, j).trim();
};
// The artifact host wraps the page in its own doctype/head/body, so ship only the inner parts.
const artifact = pick('<!--HEAD-->', '<!--/HEAD-->') + '\n' + pick('<!--BODY-->', '<!--/BODY-->') + '\n';

// Phone build: same source, MOBILE flag on (bottom nav, gamepad, sheet dialogs).
const FLAG = '/*MOBILE*/false';
if (!full.includes(FLAG)) throw new Error('MOBILE flag not found');
const toMobile = s => s.replace(FLAG, 'true').replace('<title>简历大冒险</title>', '<title>简历大冒险 手机版</title>');

mkdirSync(join(root, 'dist'), { recursive: true });
const out = {
  'dist/简历大冒险.html': full,
  'dist/简历大冒险-手机版.html': toMobile(full),
  'dist/artifact.html': artifact,
  'dist/artifact-mobile.html': toMobile(artifact)
};
const kb = s => (Buffer.byteLength(s) / 1024).toFixed(0) + ' KB';
for (const [f, s] of Object.entries(out)) { writeFileSync(join(root, f), s); console.log(f.padEnd(28), kb(s)); }
