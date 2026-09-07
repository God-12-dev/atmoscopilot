# WeatherGPT

**AI-Powered Multilingual Weather Intelligence Platform**
*"Ask the Weather. Understand the Risk. Take Action."*

Real-time weather, forecasts, alerts, AI-grounded chat, rule-based advisories, and a location-aware map — built on Next.js, Prisma/PostgreSQL, NextAuth, OpenWeather, and OpenAI. No mock data in the normal app flow: if a required API key is missing, the UI says so explicitly instead of showing fake numbers.

## Core principle: real data first

- Weather, forecasts, and location search are never faked. If `WEATHER_API_KEY` is missing, every weather-dependent page shows **"Weather service is not configured..."** instead of silently substituting placeholder data.
- The AI Assistant is grounded in the same real weather data — it's given the actual current conditions, forecast, and alerts as context and instructed never to invent numbers. If `OPENAI_API_KEY` is missing, it shows a config error instead of canned responses.
- Alerts show an honest **"no active alerts"** only when the provider actually reports none. If the free-tier key doesn't have alert access enabled, the app tells you that explicitly (see Alerts page and Environment Variables below) rather than pretending it checked.
- Climate Intelligence page: no historical climate dataset is wired up, so it says so plainly and is structured to plug one in later — it does not manufacture trend statistics.

## Features

- **Dashboard** — real current conditions, hourly + daily forecast, charts, alert banner, embedded map — all tied to one selected location, never a hardcoded city
- **Location search** — real OpenWeather geocoding, debounced, with loading/empty/error states; "use my current location" via browser Geolocation + reverse geocoding
- **AI Assistant** — chat grounded in real weather data; understands "what about tomorrow" via conversation history, and "weather in X" via on-the-fly geocoding of mentioned places; language selector (8 languages) and voice input/output via the browser's built-in Speech APIs
- **Advisories** — deterministic, rule-based guidance for citizens, farmers, and disaster-management use cases, computed directly from real weather (not an AI guess) and clearly labeled as such
- **Alerts** — real severe weather alerts where the provider supports them
- **Climate Intelligence** — honest placeholder, ready for a real historical dataset
- **Locations** — save/remove/set-default, click to switch the active dashboard location, all scoped per user
- **History** — past AI conversations, per user
- **Settings** — units, notification prefs, default AI language, light/dark/system theme
- Light and dark themes with a real visual hierarchy (soft background, lifted cards, subtle borders — not flat white)

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma + PostgreSQL · NextAuth (Credentials) · OpenAI API · OpenWeather API (Current Weather, 5 day/3 hour Forecast, Geocoding, best-effort One Call 3.0 for alerts) · Recharts · browser Web Speech API

## Environment variables

```
DATABASE_URL=
OPENAI_API_KEY=
WEATHER_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

- **`WEATHER_API_KEY`** — a standard free OpenWeather key (https://openweathermap.org/api) covers Current Weather, 5 day/3 hour Forecast, and Geocoding — everything except severe alerts. Alerts need the separate One Call 3.0 subscription; without it, the Alerts page always reads "no active alerts," which the page itself explains.
- **`NEXTAUTH_SECRET`** — must be named exactly this (not `AUTH_SECRET`). NextAuth's own session-verification helpers, used in `middleware.ts`, read this variable name by default; a mismatch silently breaks protected-route access even after a successful login.
- None of these are ever sent to the browser — every weather/AI/DB call happens in server-side API routes (`app/api/**`).

## Setup

```bash
npm install
# fill in .env.local with the variables above
npx prisma generate
npx prisma migrate dev --name weathergpt-schema-update
npm run dev
```

If you're upgrading from a database that already ran the original `init` migration, the command above will add the new columns (`Location.state`, `FavoriteLocation.isDefault`, `User.language`) without touching your existing data.

## Production build / deploy

```bash
npm run build
npm run start
```

Same Vercel deployment notes as before: set the same env vars in Project Settings, point `DATABASE_URL` at a hosted Postgres instance (Neon/Supabase), and run `npx prisma migrate deploy` once against production.

## Project structure (what changed most recently)

```
lib/
  weather.ts       Real OpenWeather calls only. Throws WeatherConfigError if no key — never mocks.
  ai.ts             Real OpenAI call, WeatherGPT system prompt, language support, location-mention resolution.
  advisories.ts     Pure, deterministic rule-based advisories (no AI, no server-only imports — safe client-side).
  use-location.ts   Selected-location state. No hardcoded default city.
  use-weather.ts    Shared client hook: fetch/clear weather consistently across pages.
app/api/
  weather/                Current + forecast + alerts for given coordinates
  location/search/        Real geocoding search
  location/current/       Reverse geocode (for "use my current location")
  ai/                     Chat, grounded in real weather, saved to Postgres
  locations/              Saved/favorite locations CRUD + set-default
  settings/               User preferences incl. language
components/
  location-search.tsx     Debounced real search + geolocation button + empty/error states
  location-map.tsx         Real OpenStreetMap embed tied to actual coordinates
  state.tsx                 Shared LoadingState / ErrorState / ConfigErrorState / EmptyState
app/{dashboard,forecast,alerts,advisories,climate,locations,assistant,history,settings}/
```

## Manual test procedure

1. **Location search**: Dashboard → search "Manvi" → select it → dashboard updates fully (weather, forecast, map) with no leftover data from a previous location.
2. **Current location**: click the locate button next to search → allow permission → real coordinates resolve to a real place name and real weather.
3. **Save & switch**: Locations → search & save a place → it appears in the list → click it → dashboard switches to it → star it to set as default.
4. **AI grounded in real data**: Assistant → ask "Will it rain today?" → answer reflects the real forecast for your selected location.
5. **AI resolves a different place**: Assistant → ask "What is the weather in Manvi?" while another location is selected → answer uses Manvi's real data.
6. **Language**: Assistant → switch language to Kannada → ask a question → response comes back in Kannada.
7. **Voice**: Assistant → click the mic icon → speak a question (Chrome/Edge) → transcript fills the input; click the speaker icon on a reply to hear it read aloud.
8. **Advisories**: Advisories page → switch between Citizens/Farmers/Disaster Management tabs → guidance reflects real current conditions (e.g. high rain chance → "carry an umbrella").
9. **Themes**: Settings → toggle Light/Dark/System → confirm no white-on-white or black-on-black anywhere, including charts and dropdowns.
10. **Missing key behavior**: temporarily blank out `WEATHER_API_KEY` → Dashboard/Forecast/Alerts/Assistant all show a clear "Weather service is not configured" message — never fake numbers.

## Remaining limitations (being upfront)

- **Multilingual support is response-language only**, not a translated UI. The AI Assistant answers in the selected language; the rest of the app (buttons, labels, other pages) is still English. Full UI localization (8 languages × every page) is a much larger i18n project not attempted here.
- **Voice interaction uses the browser's built-in Web Speech API** (free, no external service) — works in Chrome/Edge, degrades gracefully (mic button simply doesn't appear) elsewhere. It's not a production-grade voice pipeline (no wake word, no noise handling, accuracy depends on the browser's engine).
- **Climate Intelligence has no real data source connected** — by design, per the "never fabricate" requirement. It's structurally ready for a historical dataset (OpenWeather History API, NASA POWER, IMD archives, etc.) but none is wired up.
- **Severe weather alerts depend on OpenWeather's One Call 3.0 subscription tier.** A standard free key will always show "no active alerts," which the Alerts page explains — but it's a real gap if you need alerts specifically and haven't upgraded the key.
- **The map is a static OpenStreetMap embed**, not an interactive Leaflet/Mapbox layer — it's real and coordinate-accurate, but doesn't support click-to-select-location or custom overlays.
- **Advisories are simple threshold rules** (rain %, temp, wind), not agronomic or meteorological models — good for a demo/hackathon, not for real farm decision-making without expert review.
- **`prisma generate`'s engine binary couldn't be verified in the sandbox this was built in** (network-restricted); it compiled cleanly through TypeScript/ESLint/webpack, and will generate normally in your own environment where `npx prisma migrate dev` already succeeded.

## Recommended next features (hackathon pitch ideas)

- Wire a real historical dataset into Climate Intelligence (even a small NASA POWER integration would make that page live)
- Persist `WeatherSnapshot` rows (the Prisma model already exists but isn't populated) to build real historical trend charts over the app's own usage
- Full UI translation via `next-intl` for true multilingual support, not just AI responses
- Push notifications for severe alerts (would need a paid alert-tier key + a notification channel)
- Replace the static map with an interactive one supporting click-to-select-location
