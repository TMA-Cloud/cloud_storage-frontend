# Project Structure

```
├─ src
│  ├─ lib
│  │  ├─ api        # TypeScript helpers for calling the backend API
│  │  ├─ components # Reusable Svelte components
│  │  ├─ stores     # Svelte stores used across pages
│  │  └─ utils      # Utility functions
│  ├─ routes        # SvelteKit route definitions
│  └─ app.css       # Global styles
├─ static            # Static assets served as-is
├─ svelte.config.js  # SvelteKit configuration
├─ vite.config.ts    # Vite configuration
└─ package.json
```

Configuration files for ESLint, Prettier and TypeScript are located in the project root.
