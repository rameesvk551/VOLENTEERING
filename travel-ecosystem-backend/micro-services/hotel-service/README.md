# Hotel Service

Standalone microservice that returns curated hotel data and optional RapidAPI results.

## Endpoints

- `GET /health` – health probe.
- `GET /hotels?city=<name>&country=<country>&limit=<n>` – hotel listings.

## Environment

```bash
PORT=4002
RAPIDAPI_KEY=your_rapidapi_key_here
```

RapidAPI key is optional; curated static data is used when it is missing.

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm start
```
