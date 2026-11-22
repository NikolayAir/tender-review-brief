# Development

Follow [Run locally](../README.md#run-locally) to clone the repository and start Vite. CI uses Node.js **26.13.1**, pinned in [`.nvmrc`](../.nvmrc). With nvm installed, prepare an existing checkout with:

```bash
nvm install
nvm use
npm ci
```

The supported Node.js line is 26.x, declared in [package.json](../package.json). Use `npm ci` to install the dependency versions recorded in the lockfile.

On macOS, `npm ci` can report an unreviewed install script for the optional `fsevents` dependency. The validated setup works with that script skipped. `npm install-scripts ls` lists pending scripts without changing the project; see [npm's install-script documentation](https://docs.npmjs.com/cli/v11/commands/npm-install-scripts/).

## Local commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm test` | Run the unit tests |
| `npm run lint` | Check JavaScript and JSX with ESLint |
| `npm run build` | Build the production application in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run test:browser` | Build the application and run Chromium regressions |

Run the standard checks before submitting a change:

```bash
npm test
npm run lint
npm run build
```

## Browser checks

Install Chromium once, then run the browser regressions:

```bash
npx playwright install chromium
npm run test:browser
```

The browser command starts a temporary preview at `http://127.0.0.1:4188/tender-review-brief/`. Keep port 4188 available. On Linux, use `npx playwright install --with-deps chromium` when system dependencies are missing. See [Playwright browser installation](https://playwright.dev/docs/browsers) for details.

For a local run in Chromium, Firefox, and WebKit, install the two additional engines with `npx playwright install firefox webkit`, run `npm run build`, then run `npx playwright test --browser all`.

The tests cover desktop layout, mobile navigation and editor text size, and keyboard-operated result tabs, including selection in forced colors. Desktop checks cover regeneration after scrolling through long passages and access to controls when a resized editor shows a validation error. Dialog checks cover focus and cancellation when restoring the sample, along with dismissal, reopening after scrolling, and text selection in the help guide.

Saved-result checks cover edits, reloads, regeneration, and older briefs. They verify that brief generation works when access to `sessionStorage` is blocked. When a simulated quota error prevents saving either the updated excerpt or brief, the tests check for **Excerpt changed** after reload. Source-passage checks cover the empty state for unmatched excerpts, visible whitespace, Unicode line breaks, disclosure reset, and 320-pixel-wide layouts.

Enlarged-text checks at 320 and 390 pixels verify that the header stays readable and tab labels keep whole words. Separate checks cover the footer link's placement and the visibility of the focused documentation link in a short help dialog.

Appearance checks cover changes to the browser's preferred color scheme, restoring the theme and text size after reload, and applying preferences with `localStorage` blocked. They also verify that the editor, source passages, and help scale. Appearance preferences use `localStorage`. Excerpts and briefs use `sessionStorage`.

Playwright keeps a trace in `test-results/` when a browser test fails. See [manual browser checks](testing-evidence.md) for additional checks in other browsers.

## Dependency audits

```bash
npm audit --omit=dev
npm audit
```

The first command checks production dependencies; the second also checks development tools. These commands require access to the npm registry. Treat their output as a result for the date checked and repeat both after dependency updates.

## Project structure

| Path | Responsibility |
| --- | --- |
| [`src/App.jsx`](../src/App.jsx) | Coordinate the excerpt, active brief, source association, generation, and reset |
| [`src/components/`](../src/components) | Input controls, result tabs, help dialog, status notices, and brief sections |
| [`src/rules/analyzeExcerpt.js`](../src/rules/analyzeExcerpt.js) | Input validation, keyword rules, and brief generation |
| [`src/rules/evidencePassages.js`](../src/rules/evidencePassages.js) | Paragraph context and merging shared passages |
| [`src/brief/`](../src/brief) | Validation of restored briefs |
| [`src/storage/`](../src/storage) | Best-effort browser session storage |
| [`tests/browser/`](../tests/browser) | Playwright regressions against the production build |
| [`.github/workflows/`](../.github/workflows) | CI and GitHub Pages deployment |

The application uses React and JavaScript with CSS. Vite builds the application; Vitest, Playwright, and ESLint provide the automated checks.

## Changing review rules

Rules are defined in [`src/rules/analyzeExcerpt.js`](../src/rules/analyzeExcerpt.js). Each rule has keywords, a technical scope, a focus area, a follow-up check, and a reviewer question. Rule order determines the order of items in the generated brief.

When adding or changing a rule:

1. Add explicit supported terms and phrases. Word boundaries prevent matches inside longer words, and whitespace between phrase words can include line breaks.
2. Keep checks and questions phrased as suggestions for a reviewer to verify against the full tender documents.
3. Add positive and negative examples with independently stated expected scopes. Check for both missing scopes and unintended extra matches.
4. Check supporting quotations, including the surrounding paragraph and multiline phrases. Keep the original source text available for evidence.
5. Run the unit, lint, build, and browser checks. Update the [scope and limitations](../README.md#scope-and-validation) when coverage changes.

See [source passages](evidence.md) for the current evidence policy. Text matching does not determine whether a mentioned scope is included, excluded, or negated.

## CI and deployment

[CI](../.github/workflows/ci.yml) runs on pull requests, pushes to `main`, and manual dispatch. It installs the locked dependencies and checks unit tests, lint, the production build, and Chromium regressions. The workflow is also callable from another workflow in this repository.

The [deployment workflow](../.github/workflows/deploy.yml) runs on pushes to `main` and manual dispatch. It first calls CI from the same commit with read-only repository access. When CI succeeds, the deployment job builds and publishes to GitHub Pages. If pre-deployment CI fails, GitHub Actions skips the deployment job. The standalone CI run on `main` remains separate from the deployment workflow's checks.

The Vite base path is `/tender-review-brief/`. Branch-protection rules are configured separately in GitHub; workflow changes do not enable them.

After changing either workflow, check the first deployment run on `main`: the pre-deployment checks must succeed before the deployment job starts. Open the deployed application, generate a brief, and check its supporting source passages.

## Preparing a release

1. Keep implementation, dependency, and documentation changes on a working branch. Record their release notes under **Unreleased** in [CHANGELOG.md](../CHANGELOG.md); package versions stay at the latest released version. Run the checks and both audits above.
2. Create `release/<version>` from the reviewed working branch. Its final commit updates the version in `package.json` and both root version fields in `package-lock.json`, then renames **Unreleased** to the release version.
3. Merge the working PR first. The release PR should be based on the updated `main` and contain only version and changelog finalization. If the working PR was squash-merged, recreate the release branch from the updated `main` and apply only the final release commit.
4. After the release PR passes CI and is merged, wait for deployment and verify the application. Tag the merged commit and publish the release notes from the changelog.
