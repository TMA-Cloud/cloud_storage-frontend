#!/bin/sh
set -euo pipefail

# Startup log
echo "Starting TMA Cloud Frontend"

# Ensure directory exists (in case of mounts)
mkdir -p /app/static /app/build/client

# Inject runtime env variables into frontend
cat <<EOT > /app/static/env.js
window.__env = {
  API_BASE_URL: "${API_BASE_URL:-}",
  ONLYOFFICE_JS_URL: "${ONLYOFFICE_JS_URL:-}",
  SUPPORTED_TYPES_VERSION: "${SUPPORTED_TYPES_VERSION:-}"
};
EOT

# Propagate configuration to built client assets so the browser can read it
if [ -d /app/build/client ]; then
    cp /app/static/env.js /app/build/client/env.js
    rm -f /app/build/client/env.js.gz /app/build/client/env.js.br
fi

# Log final configuration for easier debugging (Uncomment blow line to enable)
#echo "Injected runtime configuration:" >&2
#cat /app/static/env.js >&2

# Finally, run the application
exec "$@"
