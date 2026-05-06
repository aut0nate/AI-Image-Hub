# AI Art Hub

## Introduction

AI Art Hub is a dark-mode personal gallery for publishing AI-generated images and the prompts behind them.

It is designed for a single owner who wants a simple public showcase with a protected admin area for uploading, editing, and deleting images. The public site is browse-only and deliberately avoids social features.

## Features

- Public image gallery with category filtering.
- Blurred image detail modal with prompt, model, notes, and metadata.
- Single-owner admin login for protected management pages.
- Local filesystem image uploads with SQLite storage.
- Docker-based deployment for a public VPS.

## Stack

- Next.js App Router
- TypeScript and React
- SQLite with `better-sqlite3`
- Local filesystem uploads
- Docker, Docker Compose, GHCR, and GitHub Actions

## Requirements

- Node.js 22 or later
- npm
- Docker and Docker Compose
- A reverse proxy for production HTTPS, such as Nginx Proxy Manager

## Configuration (.env)

1. Create a `.env` file:

   ```bash
   cp .env.example .env
   ```

2. Update `.env` with strong production values:

   - `ADMIN_USERNAME`: owner login username.
   - `ADMIN_PASSWORD`: owner login password.
   - `SESSION_SECRET`: long random string used to sign admin sessions.
   - `DATABASE_URL`: SQLite database path.
   - `UPLOAD_DIR`: folder for uploaded images.
   - `IMAGE_TAG`: Docker image tag used by production Compose.

Example:

```env
ADMIN_USERNAME=gallery-admin
ADMIN_PASSWORD=change-this-password
SESSION_SECRET=replace-with-a-long-random-secret
DATABASE_URL=file:./data/gallery.sqlite
UPLOAD_DIR=./uploads
IMAGE_TAG=latest
```

You can generate a suitable `SESSION_SECRET` with:

```bash
openssl rand -base64 32
```

## Test Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create and update `.env`:

   ```bash
   cp .env.example .env
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`.

Useful checks:

```bash
npm run typecheck
npm run lint
npm run build
```

Manual checks:

- Confirm the public gallery loads.
- Confirm category filters work.
- Confirm image details open in the modal.
- Confirm `/admin`, `/admin/new`, and edit pages require login.
- Confirm upload, edit, and delete work after login.

## Test Locally Using Docker

Docker is useful for checking the production-style container before server deployment.

```bash
docker compose up --build
```

Open `http://127.0.0.1:3000`.

The local Compose file publishes port `3000` only on `127.0.0.1` and stores SQLite data and uploads in Docker volumes named `ai-gallery-data` and `ai-gallery-uploads`.

## Server Deployment

Production deployment uses `docker-compose.prod.yaml`, which GitHub Actions copies to `/opt/stacks/ai-gallery/docker-compose.yaml` on the VPS. The production container uses `ghcr.io/aut0nate/ai-gallery`, joins the external Docker network `edge-net`, and exposes port `3000` to Nginx Proxy Manager without publishing a host port directly.

Create `/opt/stacks/ai-gallery/.env` on the VPS with production values. Keep this file on the server and out of Git.

Nginx Proxy Manager Proxy Host settings:

```text
Domain: ai-gallery.autonate.dev
Scheme: http
Forward Hostname / IP: ai-gallery
Forward Port: 3000
```

The app container and Nginx Proxy Manager must both be attached to `edge-net`. Enable HTTPS in Nginx Proxy Manager using the normal certificate flow.

For manual server checks:

```bash
cd /opt/stacks/ai-gallery
docker compose pull
docker compose up -d
docker compose logs -f
```

Back up the SQLite database and uploads regularly from the Docker volumes or from the mounted storage location used on the VPS.

## AI-Assisted Development

AI Image Gallery was built with OpenAI Codex using GPT-5.5. This repository includes an [`AGENTS.md`](./AGENTS.md) file, which provides structured instructions and context for AI coding agents. It defines expectations, constraints, and project-specific guidance to help keep contributions consistent and reliable.

## Contributions

Contributions, ideas, and suggestions are welcome.

If you have improvements, feature ideas, or bug fixes, feel free to open an issue or submit a pull request. All contributions are appreciated and help improve the project.

## License

This project is licensed under the MIT - see the [LICENSE](./LICENSE) file for details.
