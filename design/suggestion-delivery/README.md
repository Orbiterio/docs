# Suggestion delivery design

Editable reconstruction of the supplied current UI. The docs page is at `guides/open-work/suggestion-delivery-and-tables/sample-suggestion-data.mdx`; it contains the current screenshot and the two original JSON payloads.

Run this directory with:

```sh
npm install
npm run dev
```

Open http://localhost:3002. `SampleSuggestionData.jsx` owns the sample content, appearance, and interactions. **Why copy** switches between the current UI and the earlier supplied copy. **Edit content** enables temporary inline edits; refresh resets them. Email buttons open local sample drafts for editing and copying.

The source screenshots live in `images/suggestion-delivery/`. Profile photos and logos are shown as CSS crops of the original screenshot, retaining the original image resolution.

`npm run build` validates and bundles the prototype into the ignored `.preview/` directory. The preview server binds only to localhost.
