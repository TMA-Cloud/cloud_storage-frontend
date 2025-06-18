# TMA Cloud Frontend

A modern SvelteKit web application that simplifies cloud-based file storage and management.

## Key Features

- Upload and download files
- Rename files effortlessly
- Preview images and edit documents through OnlyOffice
- Manage privacy, protection and read‑only settings
- Receive real‑time updates via WebSocket events

## Quick Start

1. Copy `.env.example` to `.env` and fill in your API settings.
   Running `npm run dev` will generate `static/env.js` from this file. For
   production builds the container rewrites `static/env.js` with runtime
   values when starting and mirrors it to `build/client/env.js`.
2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start a development server:

   ```bash
   npm run dev
   ```

Refer to [docs/setup.md](docs/setup.md) for environment setup and [docs/development.md](docs/development.md) for additional commands.

## Documentation

- [Setup](docs/setup.md)
- [Development](docs/development.md)
- [Features](docs/features.md)
- [Project Structure](docs/structure.md)
- [Docker](docs/docker.md)
