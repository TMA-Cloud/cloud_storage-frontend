# Setup

This project relies on environment variables for connecting to the backend API and to the ONLYOFFICE Document Server. Create a `.env` file at the project root based on `.env.example` and provide values for the following variables:

| Variable                       | Description                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`            | Base URL of the backend API (e.g. `http://localhost:3000`).                        |
| `VITE_ONLYOFFICE_JS_URL`       | URL to the ONLYOFFICE Document Server API script.                                  |
| `VITE_SUPPORTED_TYPES_VERSION` | Optional version string used for cache busting when fetching supported MIME types. |

Install dependencies using npm:

```bash
npm install
```

After that you can run the development server or build the project. See [development instructions](development.md) for the available commands.
