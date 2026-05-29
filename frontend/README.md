# ERP Stage 1 Frontend

Frontend-only React + TypeScript implementation for Stage 1: mock authentication, Clients, Products, Categories, and Owner-only Users management.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Demo login

- Account ID: `MTR10237`
- Email: `owner@example.com`
- Password: `Password1`

## Backend swap point

All data access goes through `src/api/client.ts`. It is currently an in-memory mock implementation with simulated latency and typed request/response shapes from `src/api/types.ts`. Replace function bodies with `fetch()` calls to the Go REST API later without changing UI components.
