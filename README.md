# Taskboard

A small full-stack app:

- **Frontend:** static HTML/CSS/JS in `public/`
- **Backend:** a Netlify Function (`netlify/functions/tasks.mjs`) exposing a REST API at `/api/tasks`
- **Database:** Netlify Database (serverless Postgres), accessed with `@netlify/database`

## API

| Method | Path             | Body                       | Result            |
|--------|------------------|----------------------------|-------------------|
| GET    | `/api/tasks`     |                            | list of tasks     |
| POST   | `/api/tasks`     | `{ "title": "..." }`       | created task      |
| PATCH  | `/api/tasks/:id` | `{ "done": true }` / `{ "title": "..." }` | updated task |
| DELETE | `/api/tasks/:id` |                            | `{ "deleted": id }` |

## Run locally

Requires Node 20.12+ and Netlify CLI 26+ (`npm install` installs a current CLI locally).

```bash
npm install
npx netlify login
npx netlify link          # or `npx netlify init` to create a new site
npm run dev               # starts a local database and the site at http://localhost:8888
npx netlify database migrations apply   # in a second terminal: creates the tasks table locally
```

Migrations live in `netlify/database/migrations/`. Locally they are applied manually (command
above); on deploy Netlify applies them automatically.

## Deploy

1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site > Import an existing project**, pick the repo.
   Build settings are read from `netlify.toml` (publish `public`, functions `netlify/functions`).
3. The database is provisioned automatically on deploy because `@netlify/database` is installed.
   Migrations are applied before the site goes live. (Requires a Credit-based Netlify plan.)
4. Deploy. Or from the CLI: `npx netlify deploy --prod`.
