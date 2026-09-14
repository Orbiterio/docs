# Suggestion delivery design

Editable reconstruction of the supplied current UI. The docs page is at `guides/open-work/suggestion-delivery-and-tables/sample-suggestion-data.mdx`; it contains the current screenshot and the two original JSON payloads.

Run this directory with:

```sh
npm install
npm run dev
```

Open http://localhost:3002. `SampleSuggestionData.jsx` owns the sample content, appearance, and interactions. **Why copy** switches between the current UI and the earlier supplied copy. **Edit content** enables temporary inline edits; refresh resets them. Email buttons open local sample drafts for editing and copying.

Open http://localhost:3002/palettes.html to compare four color palettes. Each option links to the full interactive design with a `?palette=` query parameter; the default design at `/` uses Midnight. Shared section colors and the selected default live in `palettes.js`, and `PaletteOptions.jsx` renders the comparison page. WHY uses a 1px outline around the whole panel in every preview.

The source screenshots live in `images/suggestion-delivery/`. Profile photos and logos are shown as CSS crops of the original screenshot, retaining the original image resolution.

`npm run build` validates and bundles the prototype into the ignored `.preview/` directory. The preview server binds only to localhost.

The Mintlify `Outcome UI` page documents the current design with 11 captured states. Run `npm run reference` after design changes to regenerate `images/suggestion-delivery/outcome-ui-reference.html`, its downloadable ZIP with the image sprite, and the identical HTML block in `outcome-ui.mdx`. The reference is rendered from the current component and uses `reference-runtime.js` for plain JavaScript interactions; draft copy is shared in `sample-drafts.js`. The reference HTML expects `current-ui.png` in the same folder. Its local preview is at `http://localhost:3002/images/suggestion-delivery/outcome-ui-reference.html`. Refresh the screenshots separately when the design changes.
