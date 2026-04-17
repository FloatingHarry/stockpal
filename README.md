# StockPal

StockPal is a gamified stock-companion web demo built with Next.js, React, TypeScript, and Tailwind CSS.

It is designed as a mock-first product demo for a lightweight retail-investor intelligence experience rather than a trading terminal. The interface combines:

- a market brief feed
- a lightweight market snapshot
- persona-driven companion commentary
- a pixel-art dashboard with chat-style interactions

## Preview

![StockPal dashboard preview](./docs/stockpal-dashboard.png)

## Current Scope

The current project is implemented as a stable demo with a modular data pipeline and API-style architecture.

The homepage experience is driven through:

- `raw news -> normalize -> rank -> companion generation -> render`

Key implemented ideas:

- mock-first market intelligence dashboard
- structured event transformation from raw finance-news inputs
- heuristic ranking and board mapping
- persona-conditioned companion commentary
- unified API routes for dashboard and feed generation

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Custom CSS animation and pixel UI styling

## Running the Project

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Project Structure

Important folders and files:

- `app/` - routes and API handlers
- `components/` - dashboard UI components
- `lib/raw-news.ts` - mock raw finance-news inputs
- `lib/news-normalizer.ts` - event normalization and tagging
- `lib/news-ranker.ts` - heuristic ranking and selection
- `lib/companion-generator.ts` - persona-based commentary generation
- `lib/demo-content.ts` - scenario library and demo content

## Product Positioning

StockPal is not intended to provide investment advice.

It is positioned as:

- a stock-intelligence demo
- a companion-style market dashboard
- a product-design and data-pipeline showcase

## Planned / Experimental Extensions

The following modules are planned as future extensions and are not fully integrated into the current code path:

- investor-discussion sentiment modeling
- stock-level and sector-level sentiment signal generation
- optional real-data providers for news and quote ingestion
- optional LLM-based commentary generation

One planned extension is a Chinese BERT-based sentiment classification module for investor-forum text. The intended goal is to:

- classify retail-investor discussion sentiment
- aggregate daily stock-level and sector-level sentiment signals
- surface trend views alongside market events and companion commentary

In the current version, sentiment-style signals are represented through mock scenarios and rule-based presentation logic to validate the product experience before integrating a full model pipeline.

## Why This Project Exists

This project is meant to demonstrate:

- front-end product implementation
- dashboard information architecture
- mock-first system design
- extensible API/provider abstraction
- structured data processing before content generation

## Future Direction

Potential next steps include:

- integrating real productized data providers
- adding a sentiment pipeline for forum and discussion text
- introducing lightweight evaluation for generated commentary
- expanding the dashboard into a richer intelligence product
