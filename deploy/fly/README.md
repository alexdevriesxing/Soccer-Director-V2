# Fly.io Deployment

This repository is ready to run on Fly.io as a single Machine with one persistent volume for the SQLite database.

## Why this shape

- The app already ships as one Docker container.
- Fly Volumes are a good fit for a single-writer SQLite database.
- This game should stay on exactly one Machine until the save database moves off SQLite. Fly volumes are regional and are not replicated automatically between Machines.

## One-time setup

1. Install `flyctl` and log in.
2. Create the app:

```bash
flyctl apps create <app-name>
```

3. Create the persistent volume in the same region as `primary_region` in [`fly.toml`](../../fly.toml):

```bash
flyctl volumes create soccer_director_data \
  --app <app-name> \
  --region ams \
  --size 5
```

4. Set the production secrets:

```bash
flyctl secrets set \
  FRONTEND_URL="https://<app-name>.fly.dev" \
  JWT_SECRET="$(openssl rand -hex 32)" \
  --app <app-name>
```

5. Deploy:

```bash
flyctl deploy --remote-only --config fly.toml --app <app-name>
```

The container will initialize and seed the SQLite database on first boot, then reuse the same volume on later deploys.

## GitHub Actions deployment

The repo includes [`.github/workflows/fly-deploy.yml`](../../.github/workflows/fly-deploy.yml).

Set these before relying on CI deploys:

- GitHub Actions secret: `FLY_API_TOKEN`
- GitHub Actions variable: `FLY_APP_NAME`

After that, pushes to `main` will deploy automatically and you can also trigger the workflow manually.

## Operational notes

- Keep the Fly app at a single Machine while SQLite is the production database.
- The volume starts at `5 GB` and is configured to auto-extend in [`fly.toml`](../../fly.toml).
- The health check target is `GET /health`.
