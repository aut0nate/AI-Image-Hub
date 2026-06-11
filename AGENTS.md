# AI Image Hub

## Project Overview

AI Image Hub is a dark-mode-only personal gallery for sharing AI-generated images and the prompts behind them. The public site is browse-only. The owner can log in to upload, edit, and delete images.

There are no social features: do not add likes, comments, followers, public accounts, or social metrics.

## Tools, Languages, And Frameworks

- Next.js with the App Router
- TypeScript
- React
- SQLite via `better-sqlite3`
- Local filesystem uploads
- Docker and Docker Compose for VPS deployment

## Local Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Environment Variables

Copy `.env.example` to `.env` and set strong values before production use.

- `APP_URL`: public base URL used for Authentik callback and post-login redirects
- `AUTHENTIK_ISSUER`: Authentik application issuer, usually `https://auth.example.com/application/o/<slug>`
- `AUTHENTIK_CLIENT_ID`: Authentik OAuth2/OpenID client ID
- `AUTHENTIK_CLIENT_SECRET`: Authentik OAuth2/OpenID client secret
- `AUTHENTIK_ADMIN_EMAIL`: owner email allowed to access the admin area
- `AUTHENTIK_REDIRECT_URI`: optional override for the callback URL
- `SESSION_SECRET`: long random string used to sign admin sessions
- `DATABASE_URL`: SQLite database path, for example `file:./data/gallery.sqlite`
- `UPLOAD_DIR`: folder for uploaded images, for example `./uploads`

Generate session secrets with `openssl rand -base64 48`. Configure Authentik as a confidential OAuth2/OpenID Provider with redirect URI `<APP_URL>/auth/callback` or `<APP_URL>/admin/auth/callback` and scopes `openid`, `profile`, and `email`.

Never commit `.env`, Authentik client secrets, credentials, database files, uploaded images, or private keys.

## Code Style Guidelines

- Use British English for UI text, comments, documentation, and example content.
- Keep the app dark-mode only.
- Prefer simple server-side code and clear React components over unnecessary abstractions.
- Keep public gallery behaviour separate from admin-only mutation behaviour.
- Use semantic labels and accessible controls for uploads, filters, modal close buttons, and forms.

## Testing Instructions

Before handing off changes, run:

```bash
npm run typecheck
npm run lint
npm run build
```

Manually verify:

- public gallery loads seeded images
- category filters work
- clicking an image opens the blurred modal with prompt details
- login protects `/admin`, `/admin/new`, and edit pages
- upload, edit, and delete work after login
- Docker Compose preserves SQLite data and uploads after restart

## Security Considerations

- Admin access is intentionally single-owner only.
- Admin identity is verified through Authentik OpenID Connect.
- Only the email configured in `AUTHENTIK_ADMIN_EMAIL` may access the admin area.
- Sessions are stored in signed HTTP-only cookies with server-side expiry checks.
- Uploaded files must be images and should remain size-limited.
- Do not hardcode secrets or credentials.
- Keep uploaded files and SQLite data in persistent volumes on the VPS.

## Deployment Notes

Build and run with Docker Compose:

```bash
docker compose up --build -d
```

The local Compose file maps the app to `127.0.0.1:3001` and bind-mounts `./data` to `/app/data` and `./uploads` to `/app/uploads`. The production Compose file uses persistent Docker volumes for `/app/data` and `/app/uploads`.

## Project Rules

- Optimise for local testing first, then Docker deployment.
- Keep the gallery minimal, cinematic, and focused on image and prompt.
- Do not copy the inspiration screenshots directly.
- Do not add social features unless explicitly requested in a future planning stage.
