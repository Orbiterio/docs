import { context } from 'esbuild';
import { copyFile, cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
await mkdir(new URL('.preview-leverage/assets/', import.meta.url), { recursive: true });
await copyFile(new URL('index.html', import.meta.url), new URL('.preview-leverage/index.html', import.meta.url));
await cp(new URL('assets/leverage-loop/', import.meta.url), new URL('.preview-leverage/assets/leverage-loop/', import.meta.url), { recursive: true });
const build = await context({ absWorkingDir: root, entryPoints: ['leverage-main.jsx'], outfile: '.preview-leverage/app.js', bundle: true, jsx: 'automatic', sourcemap: true, logLevel: 'info' });
if (process.argv.includes('--build')) {
  await build.rebuild();
  await build.dispose();
} else {
  await build.watch();
  await build.serve({ port: 3003, host: '127.0.0.1', servedir: '.preview-leverage' });
  console.log('Leverage Loop design: http://localhost:3003');
}
