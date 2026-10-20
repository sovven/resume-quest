// node build.mjs  →  dist/简历大冒险.html + dist/简历大冒险-手机版.html (双击即可离线打开)
//                    dist/artifact.html + dist/artifact-mobile.html (发布到 claude.ai 用)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { deflateSync } from 'node:zlib';
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
// GitHub Pages: one link for any phone browser, no Claude needed. Both pages share one origin → one save.
const PWA = `<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="简历大冒险">
<meta name="theme-color" content="#5c94fc">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon.png">
<link rel="icon" href="icon.png">`;
const PHONE_JUMP = `<script>if(matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<700&&!/[?&]pc\b/.test(location.search))location.replace('m.html'+location.hash)</script>`;
const toSite = (s, extra = '') => s.replace('<!--HEAD-->', '<!--HEAD-->\n' + PWA + '\n' + extra);
mkdirSync(join(root, 'site'), { recursive: true });
out['site/index.html'] = toSite(full, PHONE_JUMP);
out['site/m.html'] = toSite(toMobile(full));
out['site/manifest.webmanifest'] = JSON.stringify({
  name: '简历大冒险', short_name: '简历大冒险', start_url: 'm.html', display: 'standalone',
  background_color: '#5c94fc', theme_color: '#5c94fc', icons: [{ src: 'icon.png', sizes: '192x192', type: 'image/png' }]
}, null, 2);
writeFileSync(join(root, 'site/icon.png'), qblockPng(12));

// 16×16 "?" block, scaled up, as a PNG (no deps).
function qblockPng(k) {
  const art = [
    'kkkkkkkkkkkkkkkk', 'kyyyyyyyyyyyyyyk', 'kyhyyyyyyyyyyhyk', 'kyyyyykkkkyyyyyk', 'kyyyykkyykkyyyyk', 'kyyyykkyykkyyyyk',
    'kyyyyyyyykkyyyyk', 'kyyyyyyykkyyyyyk', 'kyyyyyykkyyyyyyk', 'kyyyyyykkyyyyyyk', 'kyyyyyyyyyyyyyyk', 'kyyyyyykkyyyyyyk',
    'kyyyyyykkyyyyyyk', 'kyhyyyyyyyyyyhyk', 'kyyyyyyyyyyyyyyk', 'kkkkkkkkkkkkkkkk'];
  const pal = { k: [20, 16, 30], y: [248, 184, 0], h: [252, 224, 168] };
  const n = 16 * k, raw = Buffer.alloc((n * 3 + 1) * n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) raw.set(pal[art[(y / k) | 0][(x / k) | 0]], y * (n * 3 + 1) + 1 + x * 3);
  const crcT = Array.from({ length: 256 }, (_, c) => { for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = buf => { let c = ~0; for (const v of buf) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (~c) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(n, 0); ih.writeUInt32BE(n, 4); ih[8] = 8; ih[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const kb = s => (Buffer.byteLength(s) / 1024).toFixed(0) + ' KB';
for (const [f, s] of Object.entries(out)) { writeFileSync(join(root, f), s); console.log(f.padEnd(28), kb(s)); }
