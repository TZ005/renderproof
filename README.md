# RenderProof

RenderProof is a knowledge-grounded video delivery agent built for the DEV x
Sanity Challenge. It uses an AI SDK agent, a Sanity Knowledge Base, and the
hosted Sanity Context MCP server to produce answers that stay inside cited
source material.

## Repository layout

- `web/`: Next.js application and streaming chat API
- `studio/`: Sanity Studio schemas and seed data
- `sources/`: captured FFmpeg source documents used by the Knowledge Base

## Architecture

1. Sanity Studio models sources, claims, codecs, containers, compatibility
   rules, delivery profiles, pipeline recipes, and decisions.
2. The `production` dataset is imported from `studio/seed/seed.ndjson`.
3. Sanity Context builds a Knowledge Base from the dataset and captured FFmpeg
   documentation.
4. The Next.js server connects to Context MCP with an organization-level read
   token.
5. DeepSeek receives the MCP tools and runs a multi-step tool-calling loop.
6. The browser receives NDJSON events so tool activity, citations, and streamed
   text remain visible during an answer.

## Local development

Start the web application:

```powershell
Set-Location web
npm install
npm run dev
```

Start Sanity Studio:

```powershell
Set-Location studio
npm install
npm run dev
```

The application reads secrets from `web/.env.local`. Never commit that file.

The public Demo runs on Cloudflare Workers:

[https://renderproof.proteinpayment.com](https://renderproof.proteinpayment.com)

## Verification

```powershell
Set-Location web
npm run lint
npm run build
npm run smoke
```

The smoke test expects the local dev server at `http://127.0.0.1:3000`.
