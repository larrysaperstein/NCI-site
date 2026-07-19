const LOGO_FALLBACK = "/images/logo-fallback.svg";

export function extractFirstImageFromBody(body: string): string | null {
  if (!body) return null;

  const markdownMatch = body.match(/!\[[^\]]*\]\(([^)]+)\)/);
  if (markdownMatch?.[1]) {
    const src = markdownMatch[1].trim();
    if (src) return src;
  }

  const htmlMatch = body.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
  if (htmlMatch?.[1]) {
    const src = htmlMatch[1].trim();
    if (src) return src;
  }

  return null;
}

export function extractFirstImageAltFromBody(body: string): string | undefined {
  const markdownMatch = body.match(/!\[([^\]]*)\]\(([^)]+)\)/);
  if (markdownMatch?.[1]?.trim()) {
    return markdownMatch[1].trim();
  }

  const htmlMatch = body.match(/<img\b[^>]*\balt=["']([^"']*)["']/i);
  if (htmlMatch?.[1]?.trim()) {
    return htmlMatch[1].trim();
  }

  return undefined;
}

/**
 * Card avatar (blog + action item listing cards):
 * CMS display image → first body image → logo fallback.
 */
export function resolveCardDisplayImage(
  avatarImage: string | undefined,
  body: string
): string {
  if (avatarImage?.trim()) {
    return avatarImage.trim();
  }

  return extractFirstImageFromBody(body) ?? LOGO_FALLBACK;
}

/**
 * Post header (blog detail only):
 * CMS display image only, otherwise none.
 */
export function resolvePostHeaderDisplayImage(avatarImage: string | undefined): string | null {
  if (avatarImage?.trim()) {
    return avatarImage.trim();
  }

  return null;
}

export function resolveDisplayAlt(
  avatarAlt: string | undefined,
  body: string,
  headline: string,
  useBodyAlt: boolean
): string {
  if (avatarAlt?.trim()) {
    return avatarAlt.trim();
  }

  if (useBodyAlt) {
    return extractFirstImageAltFromBody(body) ?? headline;
  }

  return headline;
}
