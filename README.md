# WanderQuest

Travel planning app for organizing trips: dates, budget, activities, weather, and nearby attractions in one place.

**Live:** [wanderquest.omar-daghestani.com](https://wanderquest.omar-daghestani.com)

## Stack

| Layer | Tech |
|---|---|
| Client | React 18, Vite, Tailwind CSS, React Router |
| Server | Node.js, Express, Sequelize |
| Database | PostgreSQL |
| External APIs | Google Places (attractions + photos), OpenWeather (forecasts) |
| Hosting | Vercel (client) · DigitalOcean droplet behind nginx (API) |

## Features

- Email/password accounts with JWT auth
- Create, edit, and delete itineraries with dates, budget, and activities
- Weather forecast and top attractions with photos for each destination
- Every itinerary is scoped to its owner

## Security

- Google API key never leaves the server; place photos are served through a rate-limited proxy (`/api/places/photos/:ref`)
- Exact-match CORS allowlist, `helmet` security headers, and rate limiting on auth routes
- Request validation on auth and itinerary routes (`express-validator`); updates only accept editable fields
- Generic error responses, so internal details are never sent to clients

## Run locally

Requires Node.js 18+ and PostgreSQL.

```bash
npm run install-deps                  # root, server, and client packages
cp server/.env.example server/.env    # then fill in values
cp client/.env.example client/.env
createdb wanderquest_db               # or: npm run db:create
npm run db:migrate
npm run dev                           # API on :5000, client on :5173
```

### Server environment (`server/.env`)

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | Signs auth tokens. **Required**: the server refuses to start without it |
| `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | Local Postgres connection (development) |
| `DATABASE_URL` | Postgres connection string (production) |
| `GOOGLE_PLACES_API_KEY` | Google Places API |
| `OPENWEATHER_API_KEY` | OpenWeather API |
| `CLIENT_URL` | Extra allowed frontend origin(s), comma-separated |
| `PORT` | API port (default `5000`) |
| `NODE_ENV` | `production` on the server |

### Client environment (`client/.env`)

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API base URL, e.g. `http://localhost:5000/api` |

## Health check

`GET /api/health` → `{ "status": "ok" }`
