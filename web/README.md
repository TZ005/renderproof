# RenderProof

RenderProof is a Next.js agent that answers video delivery questions through a
Sanity Context MCP endpoint backed by a Knowledge Base.

## Local setup

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Set these values in `.env.local`:

- `SANITY_API_READ_TOKEN`: organization-level Sanity Context Viewer token
- `DEEPSEEK_API_KEY`: DeepSeek API key

Secrets stay server-side and are never exposed to the browser.

## Verification

```powershell
npm run lint
npm run build
curl.exe -X POST http://localhost:3000/api/chat `
  -H "Content-Type: application/json" `
  -d '{"messages":[{"role":"user","content":"What should I verify before delivering an H.264 MP4?"}]}'
```

The server logs completed MCP tool names. A successful response should contain
facts and citations retrieved from the Sanity Knowledge Base.

## Cloudflare deployment

The production application runs on Cloudflare Workers with the Cloudflare
`vinext` adapter:

```powershell
npm run build:vinext
npm run deploy:vinext
```

Non-secret runtime settings live in `wrangler.jsonc`. Set production secrets
through Wrangler rather than putting them in the repository:

```powershell
npx wrangler secret put SANITY_API_READ_TOKEN
npx wrangler secret put DEEPSEEK_API_KEY
```

Production URL: [https://renderproof.proteinpayment.com](https://renderproof.proteinpayment.com)
