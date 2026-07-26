import type { Root } from "hast";
import type { Plugin } from "unified";

type Options = {
  site?: string;
};

const normalizeHost = (host: string) => host.replace(/^www\./, "");

const BARE_DOMAIN =
  /^(?:www\.)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}(?::\d+)?(?:[/?#].*)?$/i;
const RELATIVE_FILE =
  /\.(?:docx?|gif|jpe?g|pdf|png|pptx?|svg|webp|xlsx?|zip)(?:[?#].*)?$/i;

const normalizeHref = (href: string) => {
  const trimmed = href.trim();
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (BARE_DOMAIN.test(trimmed) && !RELATIVE_FILE.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

const isExternalHref = (href: string, site?: string) => {
  if (!href || href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return false;

  if (href.startsWith("//") || /^https?:\/\//i.test(href)) {
    if (!site) return true;

    try {
      const siteUrl = new URL(site);
      const linkUrl = new URL(href, site);
      return normalizeHost(linkUrl.hostname) !== normalizeHost(siteUrl.hostname);
    } catch {
      return true;
    }
  }

  return false;
};

const walk = (node: Root | Root["children"][number], site?: string) => {
  if (node.type === "element" && node.tagName === "a") {
    const href = node.properties?.href;
    if (typeof href === "string") {
      const normalizedHref = normalizeHref(href);
      node.properties.href = normalizedHref;

      if (isExternalHref(normalizedHref, site)) {
        node.properties.target = "_blank";
        node.properties.rel = "noopener noreferrer";
      }
    }
  }

  if ("children" in node && Array.isArray(node.children)) {
    node.children.forEach((child) => walk(child, site));
  }
};

export const rehypeExternalLinks: Plugin<[Options?], Root> = (options = {}) => {
  return (tree) => {
    walk(tree, options.site);
  };
};
