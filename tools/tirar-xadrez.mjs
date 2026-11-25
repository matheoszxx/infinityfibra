// Remove um fundo xadrez "pintado" (prévia de transparência achatada na imagem).
// Preenche a partir das bordas todo pixel cinza-neutro claro conectado ao fundo,
// depois suaviza a borda (anti-serrilhado) e tira o halo cinza dos pixels de contorno.
// Uso (de dentro de tools/): node tirar-xadrez.mjs <entrada.png> <pasta-saida>
import sharp from 'sharp';
import { resolve } from 'node:path';

const [input, outDir] = process.argv.slice(2);
const { data, info } = await sharp(resolve(input)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, N = W * H;

const isChecker = (i) => {
  const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
  const neutral = Math.max(r, g, b) - Math.min(r, g, b) <= 14;
  return neutral && r >= 135;
};

// flood fill a partir das bordas
const bg = new Uint8Array(N);
const stack = [];
for (let x = 0; x < W; x++) { stack.push(x, (H - 1) * W + x); }
for (let y = 0; y < H; y++) { stack.push(y * W, y * W + W - 1); }
while (stack.length) {
  const p = stack.pop();
  if (bg[p] || !isChecker(p)) continue;
  bg[p] = 1;
  const x = p % W, y = (p / W) | 0;
  if (x > 0) stack.push(p - 1);
  if (x < W - 1) stack.push(p + 1);
  if (y > 0) stack.push(p - W);
  if (y < H - 1) stack.push(p + W);
}

// alfa: fundo = 0; pixels do objeto vizinhos do fundo ficam semi-transparentes
for (let p = 0; p < N; p++) {
  if (bg[p]) { data[p * 4 + 3] = 0; continue; }
  const x = p % W, y = (p / W) | 0;
  let n = 0, tot = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const xx = x + dx, yy = y + dy;
    if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
    tot++; if (bg[yy * W + xx]) n++;
  }
  if (n) {
    data[p * 4 + 3] = Math.round(255 * (1 - (n / tot) * 0.7));
    // escurece levemente o halo claro do contorno
    for (let c = 0; c < 3; c++) data[p * 4 + c] = Math.round(data[p * 4 + c] * 0.85);
  }
}

const out = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
const trimmed = await sharp(out).trim().png().toBuffer();
const meta = await sharp(trimmed).metadata();
const up = sharp(trimmed).resize({ width: meta.width * 2, kernel: 'lanczos3' }).sharpen({ sigma: 0.6 });
await up.clone().png({ compressionLevel: 9 }).toFile(resolve(outDir, 'mascote-foguete-v2.png'));
await up.clone().webp({ quality: 90, alphaQuality: 100 }).toFile(resolve(outDir, 'mascote-foguete-v2.webp'));
console.log('ok', meta.width * 2, 'x', meta.height * 2);
