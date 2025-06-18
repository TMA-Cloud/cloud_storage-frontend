# Docker Guide

This document explains how to build and run the **TMA Cloud Frontend** container image.

## Building the image

Use the provided `Makefile` to build a production ready image. The
`VERSION` is read from `vite.config.ts` and the current git commit is
embedded at build time.

```bash
make docker-build
```

This produces an image tagged `tma-cloud-frontend:<version>` where
`<version>` matches the value in `vite.config.ts`.

## Pre-built images

Images built from the `main` branch are published automatically to
the GitHub Container Registry (GHCR). You can pull the latest image
with:

```bash
docker pull ghcr.io/tma-cloud/tma-cloud-frontend:latest
```

Replace `latest` with a version tag if you need a specific release.

## Running the container

The container expects three environment variables which are written to `static/env.js` at startup and
copied into the built assets so the browser can read them:

- `API_BASE_URL` – URL of the backend API
- `ONLYOFFICE_JS_URL` – path to the ONLYOFFICE Document Server script
- `SUPPORTED_TYPES_VERSION` – optional cache-busting version string

Example run command:

```bash
make docker-run ENV_FILE=.env
```

Alternatively you can also run the image manually:

```bash
docker run --rm -p 3000:3000 --env-file .env tma-cloud-frontend:<version>
```

When the container starts, the `docker-entrypoint.sh` script writes the values
from these variables into `/app/static/env.js` and mirrors that file to
`/app/build/client/env.js`. The resulting configuration is logged to help with
troubleshooting.

All configuration options are described in [setup.md](setup.md).
