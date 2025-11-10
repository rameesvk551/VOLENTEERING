# Travel Data Service

Aggregates travel articles, tips, and local experiences. Optionally enriches data with Tavily.

## Endpoints

- `GET /health`
- `GET /articles?city=<name>&country=<country>&limit=<n>`
- `GET /tips?city=<name>&country=<country>`
- `GET /experiences?city=<name>&country=<country>&type=<type>`

## Environment

```bash
PORT=4004
TAVILY_API_KEY=your_tavily_api_key_here
```

Tavily key is optional.

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
