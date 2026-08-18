# Portfolio Dashboard Frontend

[English](README.md) | [Türkçe](README.tr.md)

Next.js App Router frontend for the Spring Boot backend in `../PortfolioAppBE`.
It includes live holdings, portfolio charts, backend sorting, popular stocks,
watchlist management, STOMP updates, dark mode, and responsive states.

# Sorting and filtering Decision

Currently sorting/filtering handling by FE itself except 1 sorting. Ideally backend should handle sorting/filtering in order to prevent blocking FE for too long it can reduce performance. However since data is to small I used both as an example.

## Reliability decisions

- Browser API requests time out after 12 seconds.
- The Next.js proxy gives each backend operation a total 10-second deadline and
  retries safe `GET`/`HEAD` requests up to two times within it for network failures or
  `408`, `425`, `429`, `502`, `503`, and `504` responses.
- Mutating `POST`, `PUT`, and `DELETE` requests time out but are not retried
  automatically. The backend does not currently support an `Idempotency-Key`
  contract or persisted request keys. A frontend-only key cannot guarantee that
  a mutation is applied once, especially when the backend commits a change but
  its response is lost. Failed mutations therefore remain explicit user retries.
- STOMP connections use an 8-second connection timeout, reconnect after 5
  seconds, unsubscribe on unmount, and ignore callbacks after disposal.

## Run locally

Requires Node.js 22, Yarn 1.22, and the backend on port `8080`.

```bash
# Terminal 1: backend
cd ../PortfolioAppBE
docker compose up --build app

# Terminal 2: frontend
cp .env.example .env.local
nvm use
yarn install
yarn dev
```

## Run only FE with docker

docker build \
  --build-arg NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080/ws \
  -t portfolio-frontend .

docker run --rm \
  -p 3000:3000 \
  -e BACKEND_URL=http://host.docker.internal:8080 \
  portfolio-frontend


Open [http://localhost:3000](http://localhost:3000). Backend Swagger is at
[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html).

## Environment

```dotenv
BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080/ws
```

Change these values in `.env.local` when the real API or WebSocket address
changes. `BACKEND_URL` is server-only; `NEXT_PUBLIC_WEBSOCKET_URL` is exposed to
the browser and embedded during `next build`.

## Backend integration

REST calls are defined in `src/lib/portfolio-api.ts` and proxied by Next.js to
`BACKEND_URL`:

- `/api/portfolio` and `/api/portfolio/{ticker}`
- `/api/market-data/{ticker}` and `/api/market-data/{ticker}/history`
- `/api/watchlist` and `/api/watchlist/{ticker}`

Sorting uses backend query parameters such as
`/api/portfolio?sortBy=MARKET_VALUE&direction=DESC`. Popular-stock symbols are a
curated frontend list, while their quotes come from the live market-data API.

Live portfolio updates connect to `ws://localhost:8080/ws` and subscribe to
`/topic/portfolio` using STOMP.

## Docker

Run the frontend, backend, and PostgreSQL together:

```bash
docker compose up --build
```

## Checks

```bash
yarn typecheck
yarn lint
yarn test
yarn build
```

## AI disclosure

Agents.md file pointing to backend service from my local. Which AI assist me to connect the API and websockets that I implemented without hardcoded it to the prompt.
OpenAI Codex was used to help implement and verify this project.

## Screenshots

<img width="800" height="510" alt="Screenshot 2026-08-17 at 23 45 22" src="https://github.com/user-attachments/assets/a78472ad-497d-446b-8fd7-9ef957d86689" />
<img width="1632" height="462" alt="Screenshot 2026-08-17 at 23 45 10" src="https://github.com/user-attachments/assets/e7e3624b-42d9-4101-b141-f18b8eeff2d7" />
<img width="1845" height="840" alt="Screenshot 2026-08-17 at 23 44 51" src="https://github.com/user-attachments/assets/8765bd5a-941d-4ed8-a167-1599a79fa676" />
<img width="1845" height="840" alt="Screenshot 2026-08-17 at 23 45 01" src="https://github.com/user-attachments/assets/7dc0fc3f-b729-4492-bfd0-35ff39f63735" />

