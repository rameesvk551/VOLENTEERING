# Weather Service

Standalone microservice that exposes weather data fetched from the OpenWeather API.

## Endpoints

- `GET /health` – basic service health check.
- `GET /weather?city=<name>&country=<code>` – current weather and five day forecast.

## Environment

Copy `.env.example` to `.env` and set the following values:

```bash
PORT=4001
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm start
```
