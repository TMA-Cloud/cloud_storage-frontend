# Setup

TMA Cloud frontend reads configuration from `static/env.js` at runtime.
Copy `.env.example` to `.env` and add your values. When running `npm run dev`
these variables are written into `static/env.js` automatically.
When running in Docker the container overwrites this file with the provided
environment variables and mirrors it to `build/client/env.js`.

| Variable                  | Description                                                                       |
| ------------------------- | --------------------------------------------------------------------------------- |
| `API_BASE_URL`            | URL of the backend API, for example `http://localhost:3000`.                      |
| `ONLYOFFICE_JS_URL`       | Location of the ONLYOFFICE Document Server script.                                |
| `SUPPORTED_TYPES_VERSION` | Optional version string used to bust caches when retrieving supported MIME types. |

Install the dependencies:

```bash
npm install
```

After installation you can start the development server or create a production build. See [development.md](development.md) for available commands.
If you prefer running the app in Docker, the image accepts the same environment variables at runtime. See [docker.md](docker.md) for details on building and running the container.
