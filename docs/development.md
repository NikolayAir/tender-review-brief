# Development

Follow [Run locally](../README.md#run-locally) to clone the repository and start Vite. CI uses Node.js **26.13.1**, pinned in [`.nvmrc`](../.nvmrc). With nvm installed, prepare an existing checkout with:

```bash
nvm install
nvm use
npm ci
```

The supported Node.js line is 26.x, declared in [package.json](../package.json). Use `npm ci` to install the dependency versions recorded in the lockfile.

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

The tests check visible whitespace and Unicode line breaks, keyboard operation, disclosure reset, and 320-pixel-wide layouts. Traces are retained on failure in `test-results/`. See [browser checks for source evidence](testing-evidence.md) for additional manual checks in other browsers.

## Dependency audits

```bash
npm audit --omit=dev
npm audit
```

The first command checks production dependencies; the second also checks development tools. These commands require access to the npm registry. Treat their output as a result for the date checked and repeat both after dependency updates.

## Project structure

| Path | Responsibility |
| --- | --- |
| [`src/App.jsx`](../src/App.jsx) | Display the active brief and coordinate analysis and reset |
| [`src/components/`](../src/components) | Input controls and brief sections |
| [`src/rules/analyzeExcerpt.js`](../src/rules/analyzeExcerpt.js) | Input validation, keyword rules, and brief generation |
| [`src/rules/evidencePassages.js`](../src/rules/evidencePassages.js) | Paragraph context and merging shared passages |
| [`src/brief/`](../src/brief) | Validation of restored briefs |
| [`src/storage/`](../src/storage) | Best-effort browser session storage |
| [`tests/browser/`](../tests/browser) | Playwright regressions against the production build |
| [`.github/workflows/`](../.github/workflows) | CI and GitHub Pages deployment |

The application uses React and JavaScript with CSS. Vite builds the application; Vitest, Playwright, and ESLint provide the automated checks.

## Changing review rules

Rules are defined in [`src/rules/analyzeExcerpt.js`](../src/rules/analyzeExcerpt.js). Each rule has keywords, a technical scope, a focus area, a follow-up check, and a reviewer question. Rule order determines the order of the generated output.

When adding or changing a rule:

1. Add explicit supported terms and phrases. Word boundaries prevent matches inside longer words, and whitespace between phrase words can include line breaks.
2. Keep checks and questions phrased as suggestions for a reviewer to verify against the full tender documents.
3. Add positive and negative examples with independently stated expected scopes. Check for both missing scopes and unintended extra matches.
4. Check supporting quotations, including the surrounding paragraph and multiline phrases. Keep the original source text available for evidence.
5. Run the unit, lint, build, and browser checks. Update the [scope and limitations](../README.md#scope-and-validation) when coverage changes.

See [source passages](evidence.md) for the current evidence policy. Text matching does not determine whether a mentioned scope is included, excluded, or negated.

## CI and deployment

[CI](../.github/workflows/ci.yml) runs on pull requests, pushes to `main`, and manual dispatch. It installs the locked dependencies and checks unit tests, lint, the production build, and Chromium regressions. The workflow is also callable from another workflow in this repository.

The [deployment workflow](../.github/workflows/deploy.yml) runs on pushes to `main` and manual dispatch. It first calls CI from the same commit with read-only repository access. The deployment job waits for those checks to pass, then builds and publishes to GitHub Pages. Failed checks skip deployment. The standalone CI run on `main` remains separate from the deployment workflow's checks.

The Vite base path is `/tender-review-brief/`. Branch-protection rules are configured separately in GitHub; workflow changes do not enable them.

For a release, update the package and lockfile versions together, record the changes in [CHANGELOG.md](../CHANGELOG.md), and run the checks and audits above. After the release PR passes CI and is merged, verify the deployed application, then tag the merged commit and publish its release notes.
