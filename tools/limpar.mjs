// Limpa a máscara do recorte do mascote:
// binariza o alfa, faz uma "abertura" morfológica (remove fiapos finos de raio/névoa)
// e mantém os pedaços conectados grandes (mascote, braço, foguete).
// Uso (de dentro de tools/): node limpar.mjs <entrada.png> <pasta-saida> [raio=2] [fracaoMin=0.02]
import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [input, outDir, rArg = '2', fracArg = '0.02'] = process.argv.slice(2);
const R = Number(rArg), MIN_FRAC = Number(fracArg);
const src = await readFile(resolve(input));
const blob = await removeBackground(new Blob([src], { type: 'image/png' }), {
  model: 'medium',
  output: { format: 'image/png', quality: 1 },
});
const cut = Buffer.from(await blob.arrayBuffer());
const { data, info } = await sharp(cut).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, N = W * H;

const A = new Uint8Array(N);
for (let i = 0; i < N; i++) A[i] = data[i * 4 + 3] > 140 ? 1 : 0;

const morph = (m, r, erode) => {
  const out = new Uint8Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let v = erode ? 1 : 0;
    outer: for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;
      const xx = x + dx, yy = y + dy;
      const s = xx < 0 || yy < 0 || xx >= W || yy >= H ? 0 : m[yy * W + xx];
      if (erode && !s) { v = 0; break outer; }
      if (!erode && s) { v = 1; break outer; }
    }
    out[y * W + x] = v;
  }
  return out;
};
const opened = morph(morph(A, R, true), R, false);

// componentes conectados
const lab = new Int32Array(N); const sizes = [0]; let cur = 0;
const stack = new Int32Array(N);
for (let i = 0; i < N; i++) {
  if (!opened[i] || lab[i]) continue;
  cur++; let sp = 0, size = 0; stack[sp++] = i; lab[i] = cur;
  while (sp) {
    const p = stack[--sp]; size++;
    const x = p % W, y = (p / W) | 0;
    if (x > 0 && opened[p - 1] && !lab[p - 1]) { lab[p - 1] = cur; stack[sp++] = p - 1; }
    if (x < W - 1 && opened[p + 1] && !lab[p + 1]) { lab[p + 1] = cur; stack[sp++] = p + 1; }
    if (y > 0 && opened[p - W] && !lab[p - W]) { lab[p - W] = cur; stack[sp++] = p - W; }
    if (y < H - 1 && opened[p + W] && !lab[p + W]) { lab[p + W] = cur; stack[sp++] = p + W; }
  }
  sizes.push(size);
}
const biggest = Math.max(...sizes);
const keep = new Uint8Array(N);
for (let i = 0; i < N; i++) keep[i] = lab[i] && sizes[lab[i]] >= biggest * MIN_FRAC ? 1 : 0;
console.log('componentes mantidos:', sizes.filter((s) => s >= biggest * MIN_FRAC).length, 'de', cur);

// dilata 2px e aplica ao alfa original (preserva antialias da borda)
const grown = morph(keep, 2, false);
for (let i = 0; i < N; i++) if (!grown[i]) data[i * 4 + 3] = 0;

const clean = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
const trimmed = await sharp(clean).trim().png().toBuffer();
const meta = await sharp(trimmed).metadata();
const up = sharp(trimmed).resize({ width: meta.width * 2, kernel: 'lanczos3' }).sharpen({ sigma: 0.6 });
await up.clone().png({ compressionLevel: 9 }).toFile(resolve(outDir, 'mascote-foguete.png'));
await up.clone().webp({ quality: 90, alphaQuality: 100 }).toFile(resolve(outDir, 'mascote-foguete.webp'));
console.log('ok', meta.width * 2, 'x', meta.height * 2);
