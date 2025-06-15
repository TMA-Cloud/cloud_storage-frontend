# Setup

TMA Cloud frontend uses environment variables to connect to the backend API and the ONLYOFFICE Document Server. Copy `.env.example` to `.env` and fill in the following keys:

| Variable                       | Description                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`            | URL of the backend API, for example `http://localhost:3000`.                      |
| `VITE_ONLYOFFICE_JS_URL`       | Location of the ONLYOFFICE Document Server script.                                |
| `VITE_SUPPORTED_TYPES_VERSION` | Optional version string used to bust caches when retrieving supported MIME types. |

Install the dependencies:

```bash
npm install
```

After installation you can start the development server or create a production build. See [development.md](development.md) for available commands.
