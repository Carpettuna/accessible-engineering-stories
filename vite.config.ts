// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

import { projectSlugs } from "./src/content/project-slugs";

/**
 * Static export for GitHub Pages.
 *
 * The workflow (.github/workflows/deploy-pages.yml) sets both variables.
 * Without them the build is unchanged, so publishing from Lovable keeps
 * producing the server bundle it serves today.
 *
 * BASE_PATH is the sub-path the site is served from: "/<repo-name>/" for a
 * project site, "/" for a user/org site or a connected custom domain.
 * Vite's `base` also feeds TanStack Router's basepath, so every in-app link
 * and asset URL is prefixed automatically.
 */
const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.BASE_PATH ?? "/";

/** Every route the site can serve, so the Pages build writes a real HTML file for each. */
const pages = [
  { path: "/" },
  { path: "/projects" },
  { path: "/about" },
  { path: "/skills" },
  { path: "/contact" },
  ...projectSlugs.map((slug) => ({ path: `/projects/${slug}` })),
];

export default defineConfig({
  vite: { base: basePath },
  tanstackStart: {
    pages,
    prerender: staticExport
      ? { enabled: true, autoStaticPathsDiscovery: false, crawlLinks: false }
      : undefined,
  },
  // The Pages build needs no server: prerendered HTML plus the client bundle is
  // the whole site. Lovable's own build keeps its Cloudflare server bundle.
  nitro: staticExport ? false : undefined,
});
