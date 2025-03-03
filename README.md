# Solace AI Connector Web

A web application with a React frontend and Python backend.

[![PyPI - Version](https://img.shields.io/pypi/v/solace-ai-connector-web.svg)](https://pypi.org/project/solace-ai-connector-web)
[![PyPI - Python Version](https://img.shields.io/pypi/pyversions/solace-ai-connector-web.svg)](https://pypi.org/project/solace-ai-connector-web)

## Prerequisites

- Node.js and npm
- Python 3.10 and above
- Required Python dependencies

## Frontend Development

### Installation

Navigate to the frontend directory:

```sh
cd src/solace_ai_connector_web/frontend
npm install
```

Run the frontend development server:

```sh
npm run dev
```

To build the frontend for production:

```sh
npm run build
# or
npx remix vite:build
```

## Backend Development

### Building

Run this in the root of the project to build the wheel package:

```sh
python -m build -w
```

This will create a /dist folder containing the wheel file which needs to be installed as a dependency in the solace-agent-mesh project.

One suggested workflow for installing the wheel:

```sh
pip uninstall solace_ai_connector_web -y && pip install ../../web-solace/solace-ai-connector-web/dist/solace_ai_connector_web-0.1.0-py3-none-any.whl
```

## Local Development

Since static assets are served by default, development with hot reload requires some configuration:

### Update vite.config.ts

Add the server configuration:

```ts
// vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [
    remix({
      ssr: false,
      buildDirectory: "./static",
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001", // Go backend URL
        changeOrigin: true,
        secure: false, // Disable SSL verification if not using HTTPS
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
```

### Environment Variables

For local development pointing to local REST API with auth disabled:

```properties
WEBUI_RESPONSE_API_URL=http://127.0.0.1:5050/api/v1/request
```

```properties
WEBUI_FRONTEND_SERVER_URL=http://localhost:5001
WEBUI_FRONTEND_USE_AUTHORIZATION=False
WEBUI_FRONTEND_URL=http://localhost:5173
```

This configuration allows you to use `npm run dev` while still connecting to the REST API run by Solace Agent Mesh.

## Notes

- The Python server is configured to serve static files automatically
- Frontend builds are placed in the static directory in frontend/static for the server to access
