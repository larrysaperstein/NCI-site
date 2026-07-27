import { defineConfig } from "astro/config";
import rehypeRaw from "rehype-raw";
import { rehypeExternalLinks } from "./src/integrations/rehypeExternalLinks.ts";
import { rehypeInternalLinks } from "./src/integrations/rehypeInternalLinks.ts";
import { rehypeStripEmptyMedia } from "./src/integrations/rehypeStripEmptyMedia.ts";
import { remarkStripEmptyMedia } from "./src/integrations/remarkStripEmptyMedia.ts";

import cloudflare from "@astrojs/cloudflare";

const base = "/";
const site = "https://naturecoastindivisible.org";

export default defineConfig({
  site,
  base,

  markdown: {
    remarkRehype: { allowDangerousHtml: true },
    remarkPlugins: [remarkStripEmptyMedia],
    rehypePlugins: [
      rehypeRaw,
      rehypeStripEmptyMedia,
      [rehypeInternalLinks, { base }],
      [rehypeExternalLinks, { site }]
    ]
  },

  output: "hybrid",
  adapter: cloudflare()
});