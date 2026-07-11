export function withBase(path: string): string {
  if (!path || path.startsWith("http://") || path.startsWith("https://") || path.startsWith("//")) {
    return path;
  }

  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  if (path === "/") {
    return base;
  }

  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${normalized}`;
}
