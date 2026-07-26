export const DEFAULT_DESCRIPTION =
  "Nature Coast Indivisible is a progressive, locally led grassroots group in Marion, Citrus, and Levy counties working to protect democracy and take action.";

export const PAGE_DESCRIPTIONS = {
  home: DEFAULT_DESCRIPTION,
  actionItems:
    "Explore current action items from Nature Coast Indivisible — volunteer opportunities, advocacy steps, and ways to make a difference in North Central Florida.",
  onTheGround:
    "Updates on everything happening at Nature Coast Indivisible — organizing news, event recaps, and community stories from North Central Florida.",
  events:
    "Upcoming community gatherings, trainings, and organizing opportunities with Nature Coast Indivisible in Marion, Citrus, and Levy counties.",
  getInvolved:
    "Join Nature Coast Indivisible — volunteer, attend events, and help build a representative democracy in North Central Florida.",
  resources:
    "Policy resources, voter guides, and advocacy tools from Nature Coast Indivisible for Marion, Citrus, Levy, and surrounding counties.",
  about:
    "Nature Coast Indivisible is progressive, independent, action oriented, locally led, and nationally supported — organizing in Marion, Citrus, and Levy counties.",
  missionStatement:
    "Nature Coast Indivisible builds a representative, compassionate democracy that promotes science, tolerance, environmental protection, and support for the most vulnerable.",
  leadership:
    "Meet the leadership team of Nature Coast Indivisible and contact us with questions about volunteering and local organizing."
} as const;

const MAX_DESCRIPTION_LENGTH = 160;

export function metaDescription(text?: string | null): string {
  const cleaned = (text ?? DEFAULT_DESCRIPTION).replace(/\s+/g, " ").trim();
  if (cleaned.length <= MAX_DESCRIPTION_LENGTH) return cleaned;
  return `${cleaned.slice(0, MAX_DESCRIPTION_LENGTH - 3).trimEnd()}...`;
}
