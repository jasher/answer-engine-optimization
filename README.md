# AEO Readiness Check

A web application that audits what AI answer engines (ChatGPT, Perplexity, Gemini, Claude) can read from a website and provides actionable, copy-pasteable code fixes (JSON-LD structured data, `llms.txt`, `robots.txt` diffs, heading structures) to improve answer engine optimization.

## Features

- **5-Pillar Score**: Measures crawler access, structured data, agent endpoints, content clarity, and answer engine visibility.
- **Deterministic Technical Audit**: Tests bot allowlists, schema.org markup, heading hierarchy, clean Markdown support, and Content Signals without guessing.
- **Live AI Visibility**: Queries answer engines for real buyer-intent questions to check brand citation share.
- **Linkup.so Search & Grounding**: Integrated [Linkup.so](https://linkup.so) client for deep search, structured competitor discovery, and citation verification.
- **Auto-Generated Fixes**: Provides copy-pasteable JSON-LD snippets, `llms.txt` definitions, and `robots.txt` rules.
- **Downloadable Fix Plan**: One-click export of a full `.md` report tailored for LLM agents (Claude Code, Cursor, Codex).

## Project Structure

```
.
├── index.html        # Main AEO web interface
├── app.js            # Frontend application logic & SSE pipeline handler
├── style.css         # AEO-specific styles
├── lib/
│   └── linkup.js     # Linkup.so API client (Search, Deep Extraction & Competitors)
├── css/
│   ├── style.css     # Base layout, typography & theme stylesheet
│   └── lab-share.css # Social share widget styles
├── js/
│   └── lab-share.js  # Social share widget logic
├── images/           # Wordmark, logos and icons
├── fonts/            # Web fonts (Aeonik / SpaceGrotesk / Pangram)
├── docs/
│   └── prd.md        # Product Requirement Document (PRD)
├── tests/
│   └── linkup.test.js # Unit tests for Linkup integration
└── .github/
    └── workflows/
        └── deploy.yml # GitHub Actions static deployment workflow
```

## Running Locally

Since this is a static web application, you can run it with any local HTTP server:

### Using Python:
```bash
python3 -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

### Using Node / npx:
```bash
npx serve .
```

## Backend API & Linkup Configuration

The frontend in [`app.js`](./app.js) connects to your backend API or a local Worker (`http://localhost:8787` when served from `localhost` / `127.0.0.1`), or via the `?api=` query parameter.

### Linkup Integration ([`lib/linkup.js`](./lib/linkup.js))

The project includes a zero-dependency Linkup client for backend workers and Node runtimes:

```javascript
import { LinkupClient } from './lib/linkup.js';

const linkup = new LinkupClient({ apiKey: process.env.LINKUP_API_KEY });

// 1. Competitor discovery with structured JSON schema
const competitors = await linkup.findCompetitors('supabase.com');

// 2. Live Citation Verification
const citation = await linkup.checkCitation('best open source backend database', 'supabase.com');
console.log(citation.isCited, citation.rank, citation.snippet);
```

### Running Tests
```bash
npm test
```

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings > Pages** in your GitHub repository.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. Pushing to `main` or `master` will automatically publish the application.
