import { build } from 'esbuild';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('.', import.meta.url));
await mkdir(new URL('.preview/', import.meta.url), { recursive:true });
// Render the current component once, then use plain HTML/CSS/JS in the artifact.
const bundle = await build({
  absWorkingDir:root,
  stdin:{ contents:"import React from 'react'; import { renderToStaticMarkup } from 'react-dom/server'; import { SampleSuggestionData } from './SampleSuggestionData.jsx'; import { sampleDrafts } from './sample-drafts.js'; export const markup = renderToStaticMarkup(<SampleSuggestionData showControls={false} />); export const drafts = sampleDrafts;", loader:'jsx', resolveDir:root },
  bundle:true, write:false, platform:'node', format:'esm', packages:'external', jsx:'automatic'
});
const renderer = new URL('.preview/render-reference.mjs', import.meta.url);
await writeFile(renderer, bundle.outputFiles[0].text);
const { markup, drafts } = await import(renderer.href + '?t=' + Date.now());
const style = markup.match(/<style>([\s\S]*?)<\/style>/)[1].replace("url('/images/suggestion-delivery/current-ui.png')", "url('./current-ui.png')");
const body = markup.replace(/<style>[\s\S]*?<\/style>/, '').replace(/></g, '>\n<');
const runtime = await readFile(new URL('reference-runtime.js', import.meta.url), 'utf8');
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Outcome UI — Midnight reference</title>
  <!-- Keep current-ui.png beside this HTML file for profile photos and logos. -->
  <style>
    :root { color-scheme:dark; background:#080a0b; color:#edf0f8; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif; }
    body { margin:0; padding:12px 8px 28px; }
    main { max-width:1440px; margin:0 auto; }
${style}
  </style>
</head>
<body>
<main>
${body}
</main>
<script>
const referenceDrafts = ${JSON.stringify(drafts, null, 2).replace(/</g, '\\u003c')};
${runtime}</script>
</body>
</html>
`.replace(/[ \t]+$/gm, '');
await writeFile(new URL('../../images/suggestion-delivery/outcome-ui-reference.html', import.meta.url), html);
const assetRoot = new URL('../../images/suggestion-delivery/', import.meta.url);
execFileSync('zip', ['-j', '-q', '-X', fileURLToPath(new URL('outcome-ui-reference.zip', assetRoot)), fileURLToPath(new URL('outcome-ui-reference.html', assetRoot)), fileURLToPath(new URL('current-ui.png', assetRoot))]);
await mkdir(new URL('.preview/images/suggestion-delivery/', import.meta.url), { recursive:true });
await copyFile(new URL('outcome-ui-reference.html', assetRoot), new URL('.preview/images/suggestion-delivery/outcome-ui-reference.html', import.meta.url));
await copyFile(new URL('current-ui.png', assetRoot), new URL('.preview/images/suggestion-delivery/current-ui.png', import.meta.url));
const pageURL = new URL('../../guides/open-work/suggestion-delivery-and-tables/outcome-ui.mdx', import.meta.url);
const page = await readFile(pageURL, 'utf8');
const start = '{/* OUTCOME_REFERENCE_START */}';
const end = '{/* OUTCOME_REFERENCE_END */}';
if (!page.includes(start) || !page.includes(end)) throw new Error('Outcome UI reference markers are missing.');
await writeFile(pageURL, page.slice(0, page.indexOf(start) + start.length) + '\n\n```html outcome-ui-reference.html\n' + html + '```\n\n' + page.slice(page.indexOf(end)));
console.log('Updated HTML reference, downloadable ZIP, local preview, and identical copy/paste block.');
