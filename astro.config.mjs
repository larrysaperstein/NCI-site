import { defineConfig } from "astro/config";
import rehypeRaw from "rehype-raw";
import { rehypeInternalLinks } from "./src/integrations/rehypeInternalLinks.ts";
import { rehypeStripEmptyMedia } from "./src/integrations/rehypeStripEmptyMedia.ts";
import { remarkStripEmptyMedia } from "./src/integrations/remarkStripEmptyMedia.ts";

const base = "/";

export default defineConfig({
  site: "https://naturecoastindivisible.org",
  base,
  markdown: {
    remarkRehype: { allowDangerousHtml: true },
    remarkPlugins: [remarkStripEmptyMedia],
    rehypePlugins: [rehypeRaw, rehypeStripEmptyMedia, [rehypeInternalLinks, { base }]]
  }
});
