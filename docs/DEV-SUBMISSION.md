---
title: "RenderProof: A video delivery agent that refuses to guess"
published: false
tags: devchallenge, sanitychallenge, sanity, ai
---

*This is a submission for the [Sanity Challenge, Path One: Ship an Agent That Queries Real Content](https://dev.to/challenges/sanity-2026-09-16).*

## What I Built

RenderProof is a video delivery planning agent. It helps creators and video engineers choose codec, container, and FFmpeg settings without pretending that every recommendation is equally trustworthy.

The problem is not a lack of video encoding advice. The problem is that advice has scope, versions, dependencies, and conflicts. A rule can be valid for one codec but not another, for one container but not another, or for one source but not the next. A generic chatbot can produce a plausible FFmpeg command while silently mixing incompatible constraints.

RenderProof takes a different approach. It treats Sanity as the source of truth for structured claims, compatibility rules, delivery profiles, pipeline recipes, and editorial decisions. Before it answers, the agent retrieves those records through Sanity Context MCP. If the Knowledge Base does not establish a fact, RenderProof says so.

One deliberately tested example is `libx264` with `nal-hrd=cbr` and MP4. The captured FFmpeg documentation says the combination is not allowed in MP4. Another Knowledge Base source suggested MKV or MPEG-TS as a fallback. RenderProof surfaced the conflict instead of choosing whichever answer sounded more convenient. I resolved the conflict in Sanity by selecting the claim supported by the current evidence: no fallback container was established by the indexed source. That decision is now preserved as a Knowledge Base instruction for future rebuilds.

## Demo

Live application:

[https://renderproof.proteinpayment.com](https://renderproof.proteinpayment.com)

Try:

> Can I use libx264 nal-hrd=cbr for MP4, and is any fallback container established by the Knowledge Base?

The interface shows the actual MCP tool activity while the answer streams. In the tested path it reaches `initial_context` and `knowledge_base_read`.

## Code

Repository:

[https://github.com/TZ005/renderproof](https://github.com/TZ005/renderproof)

The repository contains:

- `web/`: Next.js application, DeepSeek integration, MCP client, streaming API, and UI
- `studio/`: Sanity Studio schemas and seeded content
- `sources/`: captured FFmpeg source documents used by the Knowledge Base
- `docs/`: challenge checklist, demo script, and submission draft

## How I Used Sanity

### Structured content

The Sanity dataset models:

- `sourceDocument`
- `sourceClaim`
- `codecProfile`
- `containerProfile`
- `compatibilityRule`
- `deliveryProfile`
- `pipelineRecipe`
- `decision`

This structure matters because the answer depends on relationships. A compatibility rule points to the codec and container it applies to. A claim points to its original source and a stable locator. A delivery profile references the codec, container, and constraints that shape the recommendation. A decision selects a claim when sources conflict.

The seed dataset contains 29 documents. The Knowledge Base contains 14 built entries across three sources: the structured Sanity dataset, the FFmpeg Codecs documentation, and the FFmpeg Formats documentation.

### Sanity Context MCP

The server connects to a hosted Sanity Context MCP endpoint with an organization-level Context Viewer token. The token remains server-side and is stored as a Cloudflare Worker secret in production.

The agent uses the Vercel AI SDK MCP client, exposes MCP tools to DeepSeek, and runs a multi-step tool loop. The browser receives NDJSON events so it can display:

- which MCP tools are running
- which tools completed
- the streamed answer
- the citations included by the model

### Knowledge Base decisions

The conflict between "use MPEG-TS" and "no fallback is established" is the most useful demonstration of the approach. Sanity Context placed the claims side by side. I selected the evidence-bounded claim, resolved the issue, and the result became a standing instruction.

That means the important behavior is not only a prompt instruction. It is represented as data and carried through future builds.

## Sanity Project Details

Project ID:

```text
84r0129y
```

Dataset:

```text
production
```

## Agent Session

<!-- Upload the curated Codex session, make it public, and embed it here before publishing. -->

## What Makes This Agent Different

RenderProof is useful because the structured content changes the result:

- It refuses to recommend `nal-hrd=cbr` for MP4 when the indexed source prohibits it.
- It distinguishes "not documented" from "safe."
- It preserves source provenance and conflict decisions.
- It can generate FFmpeg commands only from options supported by retrieved evidence.
- It reports missing destination or platform specifications instead of inventing limits.

The agent is not a generic video chatbot with a vector store attached. It is a constraint-oriented delivery assistant whose answers depend on the relationships and decisions stored in Sanity.
