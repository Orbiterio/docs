import { context } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
await mkdir(new URL('.preview/images/suggestion-delivery/', import.meta.url), { recursive: true });
await copyFile(new URL('index.html', import.meta.url), new URL('.preview/index.html', import.meta.url));
await copyFile(new URL('../../images/suggestion-delivery/current-ui.png', import.meta.url), new URL('.preview/images/suggestion-delivery/current-ui.png', import.meta.url));
const build = await context({ absWorkingDir: root, entryPoints: ['main.jsx'], outfile: '.preview/app.js', bundle: true, jsx: 'automatic', sourcemap: true, logLevel: 'info' });
if (process.argv.includes('--build')) {
  await build.rebuild();
  await build.dispose();
} else {
  await build.watch();
  await build.serve({ port: 3002, host: '127.0.0.1', servedir: '.preview' });
  console.log('Suggestion design: http://localhost:3002');
}
