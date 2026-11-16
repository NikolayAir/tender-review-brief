# Changelog

## Unreleased

This version preserves more source context in supporting quotations and brings
the excerpt and brief together in a compact review workspace.

### Changed

- Open a short How to use guide inside the application, with keyboard-accessible
  modal controls and a link to the full documentation on GitHub.
- Place the editor beside the brief on desktop, with a compact application bar
  and Overview, Checks, and Source passages tabs. On narrow screens, move to the
  generated result and provide a link back to editing.
- Select the earliest matching term or phrase for each review rule, preferring
  the longest phrase when matches start at the same position.
- Quote the complete source paragraphs spanned by a match, preserving related
  values, units, lists, restrictions, and exclusions within those paragraphs.
- Merge overlapping source passages and list their matched technical scopes in
  rule order so shared context appears once.
- Preserve source punctuation, internal spaces, tabs, and line breaks. Display
  Unicode line and paragraph separators as line breaks while retaining the
  original source characters in the generated brief.
- Collapse passages longer than 1,000 UTF-16 code units by default, with their
  complete text available through a keyboard-accessible disclosure.

### Fixed

- Start the help guide at its first step when reopened. Keep text-selection and
  cross-boundary pointer gestures from dismissing it accidentally.
- Bring an off-screen result header back into view after desktop regeneration.
  Keep the editor's controls reachable when textarea resizing or input errors
  make the panel too tall to remain pinned.
- Identify briefs based on an earlier excerpt, including after reloading a saved
  session. Ask for regeneration when an older saved brief has no recorded source
  text, while keeping its result available.
- Prevent supporting quotations from cutting off decimal values, abbreviations,
  section references, URLs, or matched phrases spanning multiple lines.
- Reset a long passage to its collapsed state when its content changes, including
  replacements with the same length and source offsets. Preserve disclosure
  state when regenerating unchanged input or switching result tabs.
- Keep long unbroken text and deep tab indentation within narrow layouts.
- Clarify wording about supporting source passages and browser processing; use
  plain language in accessibility checks and questions.

### Testing and maintenance

- Add Chromium regression tests for source formatting, Unicode separators,
  keyboard operation, disclosure reset, and 320-pixel-wide layouts; run them in CI.
- Cover desktop layout, result-tab keyboard navigation, mobile focus, and source
  association through edits, reloads, regeneration, and sample reset, including
  legacy saved briefs and unavailable storage. Add regressions for desktop
  regeneration after scrolling and resized editors with validation errors.
- Check help-dialog focus, dismissal, narrow layouts, and preservation of the
  current excerpt and result tab, including repeated opening and text-selection
  gestures.
- Require successful CI checks for the same commit before GitHub Pages deployment.
- Expand unit tests for paragraph context, shared passages, multiline phrases,
  maximum-length input, and disclosure markup.
- Document evidence selection, browser setup, and repeatable manual checks in
  the [source passage guide](docs/evidence.md), [development guide](docs/development.md),
  and [browser testing guide](docs/testing-evidence.md).
- Organize the README around the review workflow, local setup, scope, and support.
- Add [private vulnerability reporting guidance](SECURITY.md).
- Update Vite to 8.3.5, Vitest to 5.0.5, Browserslist to 4.29.4, and related
  lockfile dependencies.
- Update the transitive development dependency Zod to 4.6.7 to address
  [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).
- Update ESLint to 10.15.0 and its transitive minimatch dependency to 11.0.8 to
  address [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
- Standardize local development, CI, and deployment on Node.js 26.x, pinned to
  26.13.1 in `.nvmrc`.

The analyzer still uses explicit keyword rules and does not interpret whether
requirements are included, excluded, or negated. Existing tab-session briefs
retain their previous quotations until a new brief is generated.

## 0.1.0 — 2026-08-04

- Introduce deterministic review briefs from pasted public construction tender
  excerpts, with technical scopes, review focus areas, follow-up checks,
  reviewer questions, and supporting source passages.
- Provide browser-only processing, input validation, a bundled sample,
  tab-session persistence, and a responsive React interface.
- Add automated unit, lint, and build checks and GitHub Pages deployment.

See the [v0.1.0 release](https://github.com/NikolayAir/tender-review-brief/releases/tag/v0.1.0)
for the original release notes.
