# Financial Portfolio Dashboard — Frontend

Next.js App Router frontend for the completed Spring Boot service in the sibling `../PortfolioAppBE` directory. The application uses the backend’s real REST DTOs, validation errors, Yahoo Finance history, PostgreSQL persistence, and STOMP portfolio stream; there is no mock data layer.

## Features

- Live portfolio summary: total value, daily P&L, daily percentage, allocation, and best/worst performer
- Persisted holding create, share-quantity update, and delete flows
- Live quote table with search, gain/loss filtering, and backend-powered price/change/value/volume sorting
- Top-10 popular-stock strip with live quotes and one-click watchlist actions
- Aggregated portfolio chart backed by `/api/market-data/{ticker}/history`
- Persisted watchlist add/remove flows with backend conflict validation
- STOMP subscription to `/topic/portfolio` with reconnect and stream-error handling
- Dark/light mode; desktop, tablet, and mobile layouts
- Skeleton, chart, empty, full-page, mutation, retry, and toast states
- Strict TypeScript, Zod validation, Vitest, Docker, and CI

## Stack

- Next.js 16.3 App Router and Route Handlers
- React 18, TypeScript, and Tailwind CSS
- `@stomp/stompjs` over native WebSocket
- Native `fetch`, Zod, Vitest, and Testing Library
- Yarn 1.22

## Local run

Requirements: Node.js 20.9+, Yarn 1.22, and the backend running on port `8080`.

Start the backend first:

```bash
cd ../PortfolioAppBE
docker compose up --build app
```

Then start this frontend:

```bash
cp .env.example .env.local
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). Backend Swagger is available at [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html).

## Run the complete stack with Docker

The frontend Compose file builds the sibling backend and starts PostgreSQL, Spring Boot, and Next.js:

```bash
docker compose up --build
```

Use `docker compose down` to stop the stack. Add `-v` only when you intentionally want to delete the PostgreSQL volume and reset seeded holdings.

## Environment

```dotenv
# Server-side target used by Next.js Route Handlers
BACKEND_URL=http://localhost:8080

# Browser-visible native WebSocket handshake URL
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080/ws
```

`BACKEND_URL` remains server-only. `NEXT_PUBLIC_WEBSOCKET_URL` is embedded during `next build`; pass it as a Docker build argument for non-local deployments.

## Backend integration

The browser’s REST calls live in [src/lib/portfolio-api.ts](src/lib/portfolio-api.ts). Next.js handlers proxy them to `BACKEND_URL`, keeping backend topology server-side:

| Method | Frontend route | Spring Boot route |
| --- | --- | --- |
| GET, POST | `/api/portfolio` | `/api/portfolio` |
| GET, PUT, DELETE | `/api/portfolio/{ticker}` | `/api/portfolio/{ticker}` |
| GET | `/api/market-data/{ticker}` | `/api/market-data/{ticker}` |
| GET | `/api/market-data/{ticker}/history` | `/api/market-data/{ticker}/history` |
| GET, POST | `/api/watchlist` | `/api/watchlist` |
| GET, DELETE | `/api/watchlist/{ticker}` | `/api/watchlist/{ticker}` |

The proxy preserves backend status codes and structured error bodies. If Spring Boot cannot be reached, it returns a compatible `503 BACKEND_UNAVAILABLE` response so the existing retry and toast states remain consistent.

Portfolio sorting calls the backend with its native query contract, for example
`/api/portfolio?sortBy=MARKET_VALUE&direction=DESC`. Popular-stock cards load live
data through `/api/market-data/{ticker}`; the ten symbols are a curated UI list,
not an investment recommendation or a separate backend dataset.

### WebSocket

The browser connects directly to the backend using STOMP:

- Handshake: `ws://localhost:8080/ws`
- Subscription: `/topic/portfolio`
- Success event: `PORTFOLIO_UPDATE` with the complete `PortfolioSummaryResponse`
- Failure event: `PORTFOLIO_UPDATE_ERROR` with `errorCode` and `errorMessage`
- Reconnect delay: 5 seconds

Contract schemas are centralized in [src/lib/portfolio-schema.ts](src/lib/portfolio-schema.ts) and mirror the Java response records in `../PortfolioAppBE/src/main/java/com/example/portfolioappbe/dto/response`.

## Checks

```bash
yarn typecheck
yarn lint
yarn test
yarn build
```

## AI usage disclosure

OpenAI Codex was used to interpret the case, inspect the backend controllers/DTOs, implement and verify the frontend integration, and run automated checks. The resulting code and contracts remain directly reviewable.
