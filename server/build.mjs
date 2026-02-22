import * as esbuild from 'esbuild';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = `${__dirname}/dist`;
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

await esbuild.build({
  entryPoints: [`${__dirname}/src/index.ts`],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: `${outDir}/index.js`,
  packages: 'external',
});
