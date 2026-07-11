export type SiteEvent = {
  title: string;
  date: string;
  time: string;
  location: string;
};

export const placeholderEvents: SiteEvent[] = [
  {
    title: "Neighborhood Organizing Meet-Up",
    date: "Aug 12th, 2026",
    time: "6:30 PM",
    location: "Ocala Community Center"
  },
  {
    title: "Voter Outreach Phone Bank",
    date: "Aug 18th, 2026",
    time: "7:00 PM",
    location: "Virtual Event"
  },
  {
    title: "Rapid Response Volunteer Training",
    date: "Aug 23rd, 2026",
    time: "5:00 PM",
    location: "Marion Public Library"
  }
];
