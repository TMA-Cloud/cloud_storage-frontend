# Development

TMA Cloud uses [Vite](https://vitejs.dev/) and [SvelteKit](https://kit.svelte.dev/). The following npm scripts are available:

| Command           | Description                                                                      |
| ----------------- | -------------------------------------------------------------------------------- |
| `npm run dev`     | Start the development server. (App will be available at `http://localhost:5173`) |
| `npm run build`   | Produce a production build in the `build/` directory.                            |
| `npm run preview` | Preview the production build locally.                                            |
| `node build`      | Start the production server after building.                                      |
| `npm run lint`    | Run ESLint and Prettier.                                                         |
| `npm run format`  | Format the source code using Prettier.                                           |
| `npm run check`   | Type check the project using `svelte-check`.                                     |

## Docker helpers

The provided `Makefile` includes tasks to build and run a Docker container:

| Target              | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `make docker-build` | Build the production image.                            |
| `make docker-run`   | Run the image with the required environment variables. |

See [docker.md](docker.md) for full instructions.
