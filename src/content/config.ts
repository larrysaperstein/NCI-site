import { defineCollection, z } from "astro:content";

const upcomingCards = defineCollection({
  type: "content",
  schema: z.object({
    tab: z.enum(["action-items", "in-the-meantime"]),
    order: z.number().int().nonnegative().default(0),
    headline: z.string(),
    subheading: z.string(),
    avatarImage: z.string().optional(),
    avatarAlt: z.string().default("")
  })
});

const resourcesTabs = defineCollection({
  type: "content",
  schema: z.object({
    order: z.number().int().nonnegative().default(0),
    tabLabel: z.string(),
    heading: z.string().optional(),
    subheading: z.string().optional()
  })
});

const blogPosts = defineCollection({
  type: "content",
  schema: z.object({
    headline: z.string(),
    subheading: z.string().optional(),
    publishDate: z.coerce.date(),
    avatarImage: z.string().optional(),
    avatarAlt: z.string().default("")
  })
});

const homePage = defineCollection({
  type: "content",
  schema: z.object({
    heroImage: z.string(),
    heroImageAlt: z.string().default(""),
    aboutHeading: z.string(),
    eventsHeading: z.string().default("Events"),
    actionItemsHeading: z.string().default("Action Items")
  })
});

const homeAboutSlides = defineCollection({
  type: "content",
  schema: z.object({
    order: z.number().int().nonnegative().default(0),
    image: z.string(),
    imageAlt: z.string().default("")
  })
});

export const collections = {
  upcomingCards,
  resourcesTabs,
  blogPosts,
  homePage,
  homeAboutSlides
};
