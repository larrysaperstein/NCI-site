export function withBase(path: string): string {
  if (!path || path.startsWith("http://") || path.startsWith("https://") || path.startsWith("//")) {
    return path;
  }

  let assetPath = path;
  if (assetPath.startsWith("public/")) {
    assetPath = `/${assetPath.slice("public".length)}`;
  }

  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  if (assetPath === "/") {
    return base;
  }

  const normalized = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
  return `${base}${normalized}`;
}
