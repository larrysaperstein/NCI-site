import type { Parent, Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

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

export const remarkStripEmptyMedia: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "image", (node, index, parent) => {
      if (!parent || index === undefined || index === null) return;

      if (isEmptyUrl(node.url)) {
        (parent as Parent).children.splice(index, 1);
        return;
      }

      node.url = normalizeUploadPath(node.url);
    });
  };
};
