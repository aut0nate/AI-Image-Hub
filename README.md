# AI Art Hub

## Introduction

AI Art Hub is a personal web app for publishing AI-generated images and the prompts behind them.

It is for people who want a simple, private-to-manage gallery where visitors can browse finished images, view prompt details, and filter the collection by category. The public site is browse-only. A single owner can sign in to upload, edit, and delete images through a protected admin area.

The app is intentionally minimal and does not include social features such as likes, comments, followers, public accounts, or social metrics.

## Features

- Publish AI-generated images with titles, prompts, categories, models, notes, and metadata
- Browse the public gallery in a dark, image-focused interface
- Filter images by category
- Open image details in a modal with the prompt and supporting information
- Sign in as the single owner to manage the gallery
- Upload, edit, and delete images from the admin area
- Store image records in SQLite and uploaded files on the local filesystem
- Run locally with npm or in Docker before deploying to a server

## Stack

- Node.js 22+
- Next.js App Router
- React
- TypeScript
- SQLite
- `better-sqlite3`
- Local filesystem uploads
- ESLint
- Docker
- Docker Compose

## Requirements

Before running this project, install:

- Node.js 22 or newer
- npm
- Docker and Docker Compose, if you want to test or deploy the app with Docker

For production use, you will also need a server and an HTTPS reverse proxy such as Nginx Proxy Manager, Caddy, Traefik, or another preferred option.

## Configuration (.env)

1. Create a `.env` file:

   ```bash
   cp .env.example .env
   ```

2. Update `.env` with the required values:

   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
   - `DATABASE_URL`
   - `UPLOAD_DIR`
   - `IMAGE_TAG`

Example `.env`:

```bash
ADMIN_USERNAME=gallery-admin
ADMIN_PASSWORD=replace-with-a-strong-password
SESSION_SECRET=replace-with-a-long-random-string
DATABASE_URL=file:./data/gallery.sqlite
UPLOAD_DIR=./uploads
IMAGE_TAG=latest
```

Environment notes:

- `ADMIN_USERNAME` is the username allowed to access the admin area.
- `ADMIN_PASSWORD` is the admin password. Use a strong unique value.
- `SESSION_SECRET` signs admin login sessions. It should be long, random, and stable for a given deployment.
- Changing `SESSION_SECRET` will sign everyone out.
- `DATABASE_URL` controls the SQLite database path for local npm development. The default `file:./data/gallery.sqlite` stores the database in the local `data/` folder.
- `UPLOAD_DIR` controls where uploaded images are stored for local npm development. The default `./uploads` stores images in the local `uploads/` folder.
- `IMAGE_TAG` controls which Docker image tag is used by the production Compose file.

You can generate a suitable `SESSION_SECRET` with:

```bash
openssl rand -base64 32
```

## Test Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create and update the local environment file:

   ```bash
   cp .env.example .env
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

Useful checks:

```bash
npm run typecheck
npm run lint
npm run build
```

After making changes, manually verify:

- The public homepage loads.
- Category filters work.
- Clicking an image opens the detail modal.
- Prompt details, model, notes, and metadata display correctly.
- `/admin`, `/admin/new`, and edit pages require login.
- Upload, edit, and delete work after signing in.

## Test Locally Using Docker

Use Docker locally when you want to test the production-style container before deploying to a server.

1. Build and start the local container:

   ```bash
   docker compose up --build
   ```

2. Open [http://localhost:3000](http://localhost:3000).

Notes:

- The local `docker-compose.yaml` file publishes port `3000` to `127.0.0.1`.
- The app reads `.env` if the file exists.
- Docker overrides `DATABASE_URL` to use `/app/data/gallery.sqlite` inside the container.
- Docker overrides `UPLOAD_DIR` to use `/app/uploads` inside the container.
- SQLite data is stored in the `ai-gallery-data` Docker volume.
- Uploaded images are stored in the `ai-gallery-uploads` Docker volume.
- The Next.js cache is stored in the `ai-gallery-next-cache` Docker volume.

## Server Deployment

You can run this on your own server by pulling the latest Docker image from `ghcr.io/aut0nate/ai-gallery:${IMAGE_TAG:-latest}`.

Use the structure that fits your own environment and preferred deployment methods. For public-facing access, put the service behind HTTPS using a reverse proxy such as Nginx Proxy Manager, Caddy, Traefik, or another preferred option.

For most Docker-based deployments:

1. Create a directory in your chosen location on your server, for example `/opt/stacks/ai-gallery`.
2. Change into this directory.
3. Ensure the `docker-compose.prod.yaml` file is saved in this directory.
4. Create a `.env` file:

   ```bash
   ADMIN_USERNAME=gallery-admin
   ADMIN_PASSWORD=replace-with-a-strong-password
   SESSION_SECRET=replace-with-a-long-random-string
   IMAGE_TAG=latest
   ```

5. Create the external Docker network or use an existing one. If you use an existing network, update the `docker-compose.prod.yaml` file accordingly.

   ```bash
   docker network create edge-net
   ```

6. Start the public image:

   ```bash
   docker compose -f docker-compose.prod.yaml up -d
   ```

7. Connect your reverse proxy to the app container on port `3000`.
8. Verify the public URL after deployment.

Example production files:

- `docker-compose.prod.yaml`
- `.env`

After deployment, verify:

- The public homepage loads.
- `/login` loads.
- Admin login works.
- Existing images and prompt details are still present after restarting the container.
- Uploads remain available after restarting the container.

Back up the SQLite database and uploaded images regularly from the Docker volumes or from your chosen mounted storage location.

## AI-Assisted Development

AI Art Hub was built with AI-assisted development. This repository includes an [`AGENTS.md`](./AGENTS.md) file, which provides structured instructions and context for AI coding agents. It defines expectations, constraints, and project-specific guidance to help keep contributions consistent and reliable.

## Contributions

Contributions, ideas, and suggestions are welcome.

If you have improvements, feature ideas, or bug fixes, feel free to open an issue or submit a pull request. All contributions are appreciated and help improve the project.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
