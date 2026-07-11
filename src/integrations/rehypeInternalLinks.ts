import type { Root } from "hast";
import type { Plugin } from "unified";

type Options = {
  base: string;
};

const isInternalPath = (href: string) => href.startsWith("/") && !href.startsWith("//");

const normalizeBase = (base: string) => (base.endsWith("/") ? base.slice(0, -1) : base);

const prefixHref = (base: string, href: string) => `${normalizeBase(base)}${href}`;

const walk = (node: Root | Root["children"][number], base: string) => {
  if (node.type === "element") {
    const href = node.properties?.href;
    if (typeof href === "string" && isInternalPath(href)) {
      node.properties.href = prefixHref(base, href);
    }

    const src = node.properties?.src;
    if (typeof src === "string" && isInternalPath(src)) {
      node.properties.src = prefixHref(base, src);
    }
  }

  if ("children" in node && Array.isArray(node.children)) {
    node.children.forEach((child) => walk(child, base));
  }
};

export const rehypeInternalLinks: Plugin<[Options], Root> = (options) => {
  return (tree) => {
    walk(tree, options.base);
  };
};
