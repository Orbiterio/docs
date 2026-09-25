# Warm Intro design reference

Design-only proposal for the full-screen Warm Intro setup, public mobile invitation, email family, and tracking modal. The published specification is `guides/open-work/warm-intro-feature/warm-intro-design.mdx`.

The editable, self-contained source is `images/warm-intro/warm-intro-reference.html`. Open it directly in a browser, or serve the docs repository and visit that path. No package installation or network dependency is required. The ZIP contains the exact same HTML plus a short README.

## Visual references

The current Outcome and Leverage Loop references in `design/suggestion-delivery/SuggestionStyles.jsx` and `palettes.js` supply the Midnight palette, borders, fields, compact profile language, and action treatment. The user-supplied 13 images from `~/Downloads/Warm_Intro/` were reviewed as older concept references, not implementation instructions or final styling. The new public page follows the current dark product style. Email uses a light inbox canvas.

## Selected setup direction

Direction 1 is the starting point: three mini email composers side by side, aligned beneath horizontal stages. Each draft has an independent preview and review action. The participant strip and expandable WHY span the workspace; the sequence has one final start action. Below 651 px, composers stack while stage navigation stays horizontal.

## Prototype coverage

- Edit all three message subjects and bodies together; review each independently; switch which contact is asked first without losing edits.
- Changing a recipient email invalidates that request and the final review, and updates the final recipient list. Per-message previews and public-page previews preserve edits.
- Start the local sequence, then open the tracking record. Started drafts cannot be edited.
- Preview the public first and second invitation; accept or decline, with an optional note visible only in sender detail.
- The second acceptance shows a pending-send confirmation before a short local timer simulates completion. No emails are sent.
- Browse email variants, history filters, search, detail, and cancellation.
- Initials, names, companies, context, and historical records are illustrative.

State is in memory only. Refreshing resets the reference. Generation, durable autosave, recipient-link access control, delivery, retries, real timestamps, and production recovery are specified in the design page and are not implemented here. This is not an application build.

## Reference routes

Append query parameters to the HTML filename:

- `?view=setup`: setup (default).
- `?view=recipient&state=first`: public first invitation.
- `?view=recipient&state=second`: public second invitation.
- Other public states: `accepted-first`, `accepted-second`, `introduced`, `decline`, `declined`, `expired`, `cancelled`, `error`.
- `?view=emails&email=0`: first email; `1` second, `2` final, `3` neutral closure.
- `?view=tracking`: history; append `&detail=current` for Avery and Sarah's detail.
- `capture=1`: hide the design toolbar and state selector for documentation screenshots.
- `mobile=1`: edge-to-edge public phone view.

## Verification

The design was exercised with a temporary headless browser: recipient-specific edits after reordering, review invalidation, sequence launch, locking launched drafts, sequential consent, pending versus sent confirmation, private decline note, history filters/search, and cancellation retaining prior acceptance. No horizontal overflow was observed at 320, 390, 740, 1024, and 1440 pixels across all four surfaces. The MDX page was compiled with the repository's installed MDX compiler. These are prototype checks, not production integration tests.

The selected three-composer setup was rechecked for visible parallel drafts, stage focus, independent review, address validation, previews, order switching, launch locking, and overflow at 320, 390, 650, 740, 1024, and 1440 px. See `verification.json` for this revision and the original checks.

Screenshots `01` through `10` in `images/warm-intro/` were captured from this HTML. Regenerate screenshots and the ZIP when changing the reference. The build-plan page stays untouched until the design is reviewed.
