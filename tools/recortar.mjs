// Remove o fundo do mascote e gera versões recortadas (PNG + WebP) para o site.
// Uso: node tools/recortar.mjs <entrada.png> <pasta-saida>
import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [input, outDir] = process.argv.slice(2);
const src = await readFile(resolve(input));

const blob = await removeBackground(new Blob([src], { type: 'image/png' }), {
  model: 'medium',
  output: { format: 'image/png', quality: 1 },
});
const cut = Buffer.from(await blob.arrayBuffer());

// recorta a área transparente e amplia 2x com bom filtro (a original é pequena)
const trimmed = await sharp(cut).trim().png().toBuffer();
const meta = await sharp(trimmed).metadata();
const up = sharp(trimmed).resize({ width: meta.width * 2, kernel: 'lanczos3' }).sharpen({ sigma: 0.6 });

await up.clone().png({ compressionLevel: 9 }).toFile(resolve(outDir, 'mascote-foguete.png'));
await up.clone().webp({ quality: 90, alphaQuality: 100 }).toFile(resolve(outDir, 'mascote-foguete.webp'));
console.log('ok', meta.width * 2, 'x', Math.round(meta.height * 2));
