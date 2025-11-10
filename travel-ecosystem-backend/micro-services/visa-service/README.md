# Visa Service

Provides visa requirement data for origin/destination country pairs.

## Endpoints

- `GET /health` – service probe.
- `GET /visa?from=<country>&to=<country>` – single visa lookup.
- `POST /visa/bulk` – bulk lookup. Body example:
  ```json
  {
    "from": "IN",
    "destinations": ["US", "FR"]
  }
  ```

## Environment

```bash
PORT=4003
```

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
