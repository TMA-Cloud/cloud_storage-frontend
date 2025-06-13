# Features

The application provides a web interface for a cloud storage service. Major features include:

- **Authentication** – users sign in to obtain an access token stored in a cookie.
- **File management** – upload files (public or private), download, delete, and update privacy, protection and read‑only flags.
- **Search and pagination** – browse files page by page and search by name.
- **Image previews** – thumbnails are fetched from the backend and displayed next to files. Clicking an image opens a larger preview.
- **Document editing** – files can be opened in OnlyOffice using the `/file/[id]` route when the Document Server URL is configured.
- **Real‑time updates** – a WebSocket connection listens for events about file changes so the list stays in sync without refreshing.

The UI is built with Tailwind CSS and Lucide icons.
