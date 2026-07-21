import type { Root } from "hast";
import type { Plugin } from "unified";

const isEmptyUrl = (value: unknown): boolean =>
  typeof value !== "string" || value.trim().length === 0;

const normalizeUploadPath = (url: string): string => {
  const trimmed = url.trim();
  if (trimmed.startsWith("public/uploads/")) {
    return `/${trimmed.slice("public/".length)}`;
  }
  if (trimmed.startsWith("public/")) {
    return `/${trimmed.slice("public/".length)}`;
  }
  return trimmed;
};

const stripEmptyMedia = (node: Root | Root["children"][number], parent?: Root | Root["children"][number]) => {
  if (node.type !== "element") {
    if ("children" in node && Array.isArray(node.children)) {
      for (let index = node.children.length - 1; index >= 0; index -= 1) {
        stripEmptyMedia(node.children[index], node);
      }
    }
    return;
  }

  const tagName = node.tagName.toLowerCase();

  if (tagName === "img" && isEmptyUrl(node.properties?.src)) {
    if (parent && "children" in parent && Array.isArray(parent.children)) {
      const childIndex = parent.children.indexOf(node);
      if (childIndex !== -1) parent.children.splice(childIndex, 1);
    }
    return;
  }

  if (tagName === "img" && typeof node.properties?.src === "string") {
    node.properties.src = normalizeUploadPath(node.properties.src);
  }

  if (tagName === "iframe" && isEmptyUrl(node.properties?.src)) {
    if (parent && "children" in parent && Array.isArray(parent.children)) {
      const childIndex = parent.children.indexOf(node);
      if (childIndex !== -1) parent.children.splice(childIndex, 1);
    }
    return;
  }

  if ("children" in node && Array.isArray(node.children)) {
    for (let index = node.children.length - 1; index >= 0; index -= 1) {
      stripEmptyMedia(node.children[index], node);
    }
  }
};

export const rehypeStripEmptyMedia: Plugin<[], Root> = () => {
  return (tree) => {
    stripEmptyMedia(tree);
  };
};
