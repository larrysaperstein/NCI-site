import { defineConfig } from "astro/config";
import rehypeRaw from "rehype-raw";
import { rehypeInternalLinks } from "./src/integrations/rehypeInternalLinks.ts";

const base = "/NCI-site";

export default defineConfig({
  site: "https://larrysaperstein.github.io",
  base,
  markdown: {
    remarkRehype: { allowDangerousHtml: true },
    rehypePlugins: [rehypeRaw, [rehypeInternalLinks, { base }]]
  }
});
