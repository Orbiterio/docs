import { build } from 'esbuild';
import { readFile, writeFile, mkdir, copyFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { sampleContacts } from './sample-contacts.js';

const root = fileURLToPath(new URL('.', import.meta.url));
const previewRoot = new URL('.preview-leverage/images/suggestion-delivery/', import.meta.url);
await mkdir(previewRoot, { recursive: true });
const bundle = await build({
  absWorkingDir: root,
  stdin: { contents: "import React from 'react'; import { renderToStaticMarkup } from 'react-dom/server'; import { LeverageLoop, contactActions } from './LeverageLoop.jsx'; import { leverageDrafts } from './leverage-data.js'; export const markup = renderToStaticMarkup(<LeverageLoop showControls={false} />); export const drafts = leverageDrafts; export const actions = contactActions;", loader: 'jsx', resolveDir: root },
  bundle: true, write: false, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic'
});
const renderer = new URL('.preview-leverage/render-reference.mjs', import.meta.url);
await writeFile(renderer, bundle.outputFiles[0].text);
const { markup, drafts, actions } = await import(renderer.href + '?t=' + Date.now());
const styles = [...markup.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(match => match[1]).join('\n').replace("url('/images/suggestion-delivery/current-ui.png')", 'none');
const body = markup.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<link[^>]+rel="preload"[^>]*\/>/g, '').replaceAll('/assets/leverage-loop/', './leverage-loop-assets/').replace(/></g, '>\n<');
const runtime = await readFile(new URL('leverage-reference-runtime.js', import.meta.url), 'utf8');
const recipientRuntime = await readFile(new URL('recipient-reference-runtime.js', import.meta.url), 'utf8');
const serialize = value => JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Leverage Loop UI — Midnight reference</title>
  <!-- Keep the leverage-loop-assets folder beside this HTML file. -->
  <style>
    :root { color-scheme:dark; background:#080a0b; color:#edf0f8; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif; }
    body { margin:0; padding:12px 8px 28px; }
    main { max-width:1440px; margin:0 auto; }
${styles}
  </style>
</head>
<body>
<main>
${body}
</main>
<script>
const referenceDrafts = ${serialize(drafts)};
const referenceActions = ${serialize(actions)};
const referenceContacts = ${serialize(sampleContacts)};
${recipientRuntime}
${runtime}</script>
</body>
</html>
`.replace(/[ \t]+$/gm, '');
const assetRoot = new URL('../../images/suggestion-delivery/', import.meta.url);
await writeFile(new URL('leverage-loop-ui-reference.html', assetRoot), html);
await cp(new URL('assets/leverage-loop/', import.meta.url), new URL('leverage-loop-assets/', assetRoot), { recursive: true });
execFileSync('zip', ['-q', '-r', '-X', 'leverage-loop-ui-reference.zip', 'leverage-loop-ui-reference.html', 'leverage-loop-assets'], { cwd: fileURLToPath(assetRoot) });
await copyFile(new URL('leverage-loop-ui-reference.html', assetRoot), new URL('leverage-loop-ui-reference.html', previewRoot));
await cp(new URL('leverage-loop-assets/', assetRoot), new URL('leverage-loop-assets/', previewRoot), { recursive: true });
const pageURL = new URL('../../guides/open-work/suggestion-delivery-and-tables/leverage-loop-ui.mdx', import.meta.url);
const page = await readFile(pageURL, 'utf8');
const start = '{/* LEVERAGE_REFERENCE_START */}';
const end = '{/* LEVERAGE_REFERENCE_END */}';
if (!page.includes(start) || !page.includes(end)) throw new Error('Leverage Loop reference markers are missing.');
await writeFile(pageURL, page.slice(0, page.indexOf(start) + start.length) + '\n\n```html leverage-loop-ui-reference.html\n' + html + '```\n\n' + page.slice(page.indexOf(end)));
console.log('Updated Leverage Loop HTML, image bundle, local reference preview, and identical docs code block.');
