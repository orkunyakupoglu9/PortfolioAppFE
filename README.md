# Financial Portfolio Dashboard

A production-minded frontend implementation of the Senior Full-Stack Engineer case. It is built with Next.js 16 App Router, strict TypeScript, Tailwind CSS, route-handler API calls, and a reconnecting WebSocket client. The repository works as a standalone demo today; the temporary data layer is deliberately isolated so a Spring Boot backend can replace it later.

## What is included

- Portfolio overview with total value, daily gain, total P&L, and top performer
- Responsive holdings table plus purpose-built mobile holding cards
- Search by ticker/company, sector and gain/loss filters, and sorting by price, change, volume, value, or symbol
- Add and remove position flows with validation, pending states, toast feedback, and retry behavior
- Portfolio performance line chart with 1D/1W/1M/1Y controls
- Watchlist with add and remove actions
- Dark/light mode with saved system-aware preference
- Skeleton, empty, inline error, full-page error, and mutation states
- Real WebSocket client with subscription, validation, reconnect/backoff, and a simulated live-price fallback
- Local Next.js REST endpoints with realistic latency and demo persistence for page refreshes
- Strict TypeScript, Zod response validation, Vitest unit tests, Docker, and GitHub Actions CI

## Stack

- Next.js 16.3 (App Router and Route Handlers)
- React 18
- TypeScript (`strict: true`, no `any`)
- Tailwind CSS 3
- Native `fetch` and browser `WebSocket`
- Zod
- Vitest + Testing Library

## Run locally

Requirements: Node.js 20.9+ and Yarn 1.22.

```bash
cp .env.example .env.local
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). The app needs no backend in demo mode. Supported demo symbols are `AAPL`, `MSFT`, `GOOGL`, `NVDA`, `TSLA`, `AMZN`, `JPM`, and `KO`.

## Run with Docker

```bash
docker compose up --build
```

The dashboard is available at [http://localhost:3000](http://localhost:3000).

## Checks

```bash
yarn typecheck
yarn lint
yarn test
yarn build
```

## Temporary API behavior

The browser already makes real HTTP requests through [src/lib/portfolio-api.ts](src/lib/portfolio-api.ts). The App Router endpoints currently call an in-memory demo repository in [src/lib/mock-portfolio-store.ts](src/lib/mock-portfolio-store.ts):

- `GET /api/portfolio`
- `POST /api/portfolio`
- `DELETE /api/portfolio/{ticker}`
- `GET /api/watchlist`
- `POST /api/watchlist`
- `DELETE /api/watchlist/{ticker}`

Demo mutations survive a page refresh while the Next.js process is running. They reset when the process restarts and are not suitable for multi-instance deployment.

## Important: replace these when the real API arrives

The integration points are marked with `TODO(API)` and `TODO(WEBSOCKET)` comments so they are easy to find:

1. Replace calls to `mock-portfolio-store` in [src/app/api/portfolio/route.ts](src/app/api/portfolio/route.ts) with `GET/POST ${BACKEND_URL}/api/portfolio`.
2. Replace the mock delete in [src/app/api/portfolio/[ticker]/route.ts](src/app/api/portfolio/%5Bticker%5D/route.ts) with `DELETE ${BACKEND_URL}/api/portfolio/{ticker}`.
3. Replace the equivalent watchlist calls under [src/app/api/watchlist](src/app/api/watchlist) if the backend exposes watchlist persistence.
4. Set `BACKEND_URL` in `.env.local`; keep credentials server-side and do not prefix them with `NEXT_PUBLIC_`.
5. Set `NEXT_PUBLIC_WEBSOCKET_URL` (for example `ws://localhost:8080/ws/market`). With no value, the UI intentionally uses its simulated price feed.
6. Update [src/lib/portfolio-schema.ts](src/lib/portfolio-schema.ts) if the real JSON field names differ, then remove [src/lib/mock-portfolio-store.ts](src/lib/mock-portfolio-store.ts).

The frontend currently expects a portfolio response shaped like:

```json
[
  {
    "ticker": "AAPL",
    "companyName": "Apple Inc.",
    "sector": "Technology",
    "shares": 100,
    "currentPrice": 232.14,
    "previousClose": 228.82,
    "changePercent": 1.45,
    "averagePrice": 183.4,
    "volume": 48320400,
    "sparkline": [214, 218, 216, 221, 232],
    "lastUpdated": "2026-08-17T08:30:00.000Z"
  }
]
```

The WebSocket client sends this after connecting:

```json
{ "type": "subscribe", "symbols": ["AAPL", "MSFT"] }
```

It accepts either a direct event or `{ "data": event }`:

```json
{
  "ticker": "AAPL",
  "currentPrice": 233.08,
  "changePercent": 1.86,
  "volume": 49210000,
  "timestamp": "2026-08-17T08:31:12.000Z"
}
```

## Suggested full-stack layout

```text
financial-portfolio-dashboard/
├── frontend/       # this project
├── backend/        # Spring Boot controller/service/repository application
└── docker-compose.yml
```

When the backend is added, extend the Compose file with the Spring Boot service and PostgreSQL/H2 configuration, and make the frontend route handlers call the backend by its Compose service name.

## AI usage disclosure

OpenAI Codex was used to interpret the supplied case document, scaffold and refine the frontend architecture, implement UI and integration code, and run static checks/tests. The resulting code was validated with TypeScript, ESLint, Vitest, and a production Next.js build.
