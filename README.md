# Tender Review Brief

Technical review briefs from public construction tender excerpts.

The application uses predefined keyword rules to suggest technical scopes, review focus areas, follow-up checks, and questions. Reviewers check the supporting source passages against the complete tender documents. All text processing runs in the browser.

[Open the application](https://nikolayair.github.io/tender-review-brief/)

![Bundled excerpt beside the review overview and detected technical scopes](docs/images/tender-review-brief-overview.png)

## Review workflow

1. Choose **Restore sample** to try the example, or paste public, non-confidential text into **Tender excerpt**.
2. Choose **Generate review brief**. Review the detected scopes and focus areas in **Overview**, then the suggested checks and questions in **Checks**.
3. Open **Source passages** to read the supporting quotations. Check the complete tender documents before deciding what needs further investigation.

On narrow screens, generation moves to the result; **Edit excerpt** returns to the input. On wider screens, the editor and brief appear side by side; generation brings an off-screen result back into view.

Editing the excerpt leaves the previous result visible with an **Excerpt changed** notice. Generate again to update it. The brief saves its source text, so the notice also works after a reload when browser storage is available.

![Source passages tab showing one quotation shared by five technical scopes](docs/images/tender-review-brief-results.png)

## How it works

The React interface checks the input and applies English and selected French keyword rules. Matching uses word boundaries to avoid terms embedded inside longer words. The bundled example uses the same rules as pasted text. No backend, API key, or external text-processing service is required.

```mermaid
flowchart LR
    accTitle: Generating a review brief
    accDescr: When Generate review brief is selected, a bundled sample or pasted excerpt is validated. Valid input is matched against keyword rules to produce a brief. Empty input or more than 50,000 UTF-16 code units produces an input error.
    input["Bundled sample<br/>or pasted excerpt"] --> validate("Validate input")
    validate -->|Valid| rules("Match keywords")
    rules --> brief["Review brief"]
    validate -->|Invalid| error["Input error"]
    classDef processing fill:#3b82f633
    class validate,rules processing
```

For each matched rule, the brief quotes the paragraphs containing its earliest match. Overlapping passages appear once, and long quotes can be expanded without losing text. See [how source passages are selected](docs/evidence.md) for paragraph boundaries, formatting, and limits.

When browser storage is available, the current excerpt and last generated brief are saved separately in `sessionStorage` and restored on reload. Storage is best-effort; the application provides no document history or shared workspace.

## Run locally

Use Node.js **26.13.1**, pinned in [`.nvmrc`](.nvmrc) and used by CI. With [Git](https://git-scm.com/downloads) and [nvm](https://github.com/nvm-sh/nvm) installed:

```bash
git clone https://github.com/NikolayAir/tender-review-brief.git
cd tender-review-brief
nvm install
nvm use
npm ci
npm run dev
```

Open the local URL printed by Vite. If you use another Node.js manager, select the pinned version before running `npm ci`. The supported Node.js line is 26.x, declared in [package.json](package.json).

See [development](docs/development.md) for checks, browser setup, rule changes, and deployment.

## Scope and validation

The rules cover structural works, fire safety, accessibility, building envelope, water and drainage systems, site access and phasing, and technical documentation. Input is limited to 50,000 characters, counted as JavaScript UTF-16 code units.

Matching identifies declared keywords; it does not interpret whether work is included, excluded, or negated. If no rule matches, the brief asks for manual review. French coverage is limited to selected construction terms. Conditions outside the quoted paragraphs may still affect a requirement.

Automated tests cover matching, quote preservation, stored-brief validation, storage failures, result status after edits and reloads, keyboard interaction, and narrow layouts. The rules have not been validated against a representative collection of tenders, so no accuracy estimate is claimed. See [browser checks](docs/testing-evidence.md) for repeatable manual examples.

PDF ingestion, URL fetching, OCR, brief export, saved reviewer decisions, authentication, and shared review sessions are not implemented. Briefs restored from older sessions keep their previous content until a new brief is generated.

Human technical review is required. Generated briefs do not constitute legal, regulatory, safety, compliance, or engineering determinations.

## Documentation

| Document | Contents |
| --- | --- |
| [Source passages](docs/evidence.md) | Match selection, paragraph context, shared quotes, formatting, and limits |
| [Development](docs/development.md) | Local checks, browser setup, project structure, rule changes, and deployment |
| [Browser checks](docs/testing-evidence.md) | Manual examples for quote formatting, result status, keyboard interaction, and narrow layouts |

## Releases and support

See the [changelog](CHANGELOG.md) and [GitHub Releases](https://github.com/NikolayAir/tender-review-brief/releases) for versioned release notes. Documentation on `main` describes current development; use the documentation at a release tag for that version.

Use [GitHub Issues](https://github.com/NikolayAir/tender-review-brief/issues) for reproducible bugs and feature requests. Report suspected vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

No open-source license is currently granted. All rights reserved.

You may view this repository and use GitHub's standard platform features. Copying, redistribution, modification, or reuse beyond those features requires prior permission.
