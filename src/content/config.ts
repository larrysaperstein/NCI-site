import { defineCollection, z } from "astro:content";

const immediateAction = defineCollection({
  type: "content",
  schema: z.object({
    priority: z.enum(["regular", "high"]).default("regular"),
    order: z.number().int().min(1).default(1),
    headline: z.string(),
    subheading: z.string(),
    avatarImage: z.string().optional(),
    avatarAlt: z.string().default("")
  })
});

const ongoingAction = defineCollection({
  type: "content",
  schema: z.object({
    order: z.number().int().min(1).default(1),
    headline: z.string(),
    subheading: z.string(),
    avatarImage: z.string().optional(),
    avatarAlt: z.string().default("")
  })
});

const resourcesTabs = defineCollection({
  type: "content",
  schema: z.object({
    order: z.number().int().min(1).default(1),
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
    heroBrightness: z.number().int().min(10).max(100).default(44),
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

const aboutPage = defineCollection({
  type: "content",
  schema: z.object({})
});

const missionStatement = defineCollection({
  type: "content",
  schema: z.object({})
});

const leadership = defineCollection({
  type: "content",
  schema: z.object({
    order: z.number().int().min(1).default(1),
    name: z.string(),
    role: z.string(),
    email: z.union([z.string().email(), z.literal("")]).optional()
  })
});

export const collections = {
  immediateAction,
  ongoingAction,
  resourcesTabs,
  blogPosts,
  homePage,
  homeAboutSlides,
  aboutPage,
  missionStatement,
  leadership
};
