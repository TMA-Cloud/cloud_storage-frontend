# Development

The project uses [Vite](https://vitejs.dev/) and [SvelteKit](https://kit.svelte.dev/). The following npm scripts are available:

| Command           | Description                                                                      |
| ----------------- | -------------------------------------------------------------------------------- |
| `npm run dev`     | Start the development server. Add `-- --open` to automatically open the browser. |
| `npm run build`   | Create a production build in the `build/` folder.                                |
| `npm run preview` | Preview the production build locally.                                            |
| `node build`      | Start the production server after running `npm run build`.                       |
|                   |
| `npm run lint`    | Run ESLint and Prettier checks.                                                  |
| `npm run format`  | Format the source code using Prettier.                                           |
| `npm run check`   | Type check the project using `svelte-check`.                                     |

Run the development server after installing dependencies:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.
