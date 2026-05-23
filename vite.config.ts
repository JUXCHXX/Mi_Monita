// @lovable.dev/vite-tanstack-config already includes TanStack Start, React, Tailwind,
// tsconfig paths and the usual dev helpers, so we only customize deployment behavior here.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
    prerender: { enabled: true },
    pages: [{ path: "/" }],
    spa: { enabled: false },
  },
});
