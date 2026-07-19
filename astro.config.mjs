import { defineConfig } from "astro/config";
import rehypeRaw from "rehype-raw";
import { rehypeInternalLinks } from "./src/integrations/rehypeInternalLinks.ts";

const base = "/";

export default defineConfig({
  site: "https://naturecoastindivisible.org",
  base,
  redirects: {
    "/admin": "/cms.html",
    "/admin/": "/cms.html",
    "/cms": "/cms.html",
    "/cms/": "/cms.html"
  },
  markdown: {
    remarkRehype: { allowDangerousHtml: true },
    rehypePlugins: [rehypeRaw, [rehypeInternalLinks, { base }]]
  }
});
