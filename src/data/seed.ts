// ---------------------------------------------------------------------------
// Seed data — Link Shortener
// Raw typed arrays with date fields so filters work.
// Used ONLY by SeedDataProvider on /demo/* routes.
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Link {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  destination_url: string;
  clicks_count: number;
  created_at: string;
  updated_at: string;
}

export interface Click {
  id: string;
  link_id: string;
  clicked_at: string;
  referrer: string;
  browser: string;
  device: "mobile" | "desktop" | "tablet";
}

export interface FeatureTab {
  id: string;
  label: string;
  description: string;
}

export interface BentoFeature {
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
}

export interface FooterLinks {
  product: { label: string; href: string }[];
  company: { label: string; href: string }[];
  legal: { label: string; href: string }[];
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export const profiles: Profile[] = [
  {
    id: "usr_01",
    full_name: "Alex Johnson",
    avatar_url: null,
    created_at: "2026-01-10T08:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

export const links: Link[] = [
  { id: "lnk_01", user_id: "usr_01", slug: "q1plan",  title: "Q1 Planning Doc",   destination_url: "https://www.notion.so/my-team/q1-planning",        clicks_count: 4821, created_at: "2026-03-15T09:00:00Z", updated_at: "2026-03-15T09:00:00Z" },
  { id: "lnk_02", user_id: "usr_01", slug: "launch",  title: "Launch Checklist",  destination_url: "https://docs.google.com/document/d/launch-checklist", clicks_count: 3204, created_at: "2026-03-12T14:30:00Z", updated_at: "2026-03-12T14:30:00Z" },
  { id: "lnk_03", user_id: "usr_01", slug: "signup",  title: "Signup Page",       destination_url: "https://acme.com/signup",                            clicks_count: 2917, created_at: "2026-03-10T11:00:00Z", updated_at: "2026-03-10T11:00:00Z" },
  { id: "lnk_04", user_id: "usr_01", slug: "hiring",  title: "Hiring Deck",       destination_url: "https://figma.com/file/hiring-deck",                 clicks_count: 2441, created_at: "2026-03-08T10:00:00Z", updated_at: "2026-03-08T10:00:00Z" },
  { id: "lnk_05", user_id: "usr_01", slug: "roadmap", title: "Product Roadmap",   destination_url: "https://www.notion.so/my-team/roadmap",              clicks_count: 1983, created_at: "2026-03-05T09:30:00Z", updated_at: "2026-03-05T09:30:00Z" },
  { id: "lnk_06", user_id: "usr_01", slug: "onboard", title: "Onboarding Docs",   destination_url: "https://docs.google.com/document/d/onboarding",      clicks_count: 1756, created_at: "2026-03-03T08:00:00Z", updated_at: "2026-03-03T08:00:00Z" },
  { id: "lnk_07", user_id: "usr_01", slug: "retro",   title: "Q4 Retro Notes",    destination_url: "https://www.notion.so/my-team/q4-retro",             clicks_count: 1332, created_at: "2026-02-28T16:00:00Z", updated_at: "2026-02-28T16:00:00Z" },
  { id: "lnk_08", user_id: "usr_01", slug: "update",  title: "Investor Update",   destination_url: "https://drive.google.com/file/investor-update",      clicks_count: 1104, created_at: "2026-02-22T13:00:00Z", updated_at: "2026-02-22T13:00:00Z" },
  { id: "lnk_09", user_id: "usr_01", slug: "ai-post", title: "Blog Post — AI",    destination_url: "https://medium.com/@acme/ai-post",                   clicks_count:  892, created_at: "2026-02-18T11:00:00Z", updated_at: "2026-02-18T11:00:00Z" },
  { id: "lnk_10", user_id: "usr_01", slug: "jobs",    title: "Job Posting",       destination_url: "https://lever.co/acme/software-engineer",            clicks_count:  748, created_at: "2026-02-14T09:00:00Z", updated_at: "2026-02-14T09:00:00Z" },
  { id: "lnk_11", user_id: "usr_01", slug: "support", title: "Support Portal",    destination_url: "https://intercom.io/acme",                           clicks_count:  641, created_at: "2026-02-10T10:30:00Z", updated_at: "2026-02-10T10:30:00Z" },
  { id: "lnk_12", user_id: "usr_01", slug: "status",  title: "Status Page",       destination_url: "https://statuspage.io/acme",                         clicks_count:  341, created_at: "2026-02-06T08:00:00Z", updated_at: "2026-02-06T08:00:00Z" },
];

// ---------------------------------------------------------------------------
// Clicks — ~500 records, deterministically generated
// Distribution: referrer 40% Direct / 20% twitter / 15% linkedin / 10% google / 10% facebook / 5% other
// Device: 55% mobile / 40% desktop / 5% tablet
// ---------------------------------------------------------------------------

const REFERRERS: string[] = [
  "Direct", "Direct", "Direct", "Direct", "Direct", "Direct", "Direct", "Direct",  // 40%
  "twitter.com", "twitter.com", "twitter.com", "twitter.com",                        // 20%
  "linkedin.com", "linkedin.com", "linkedin.com",                                    // 15%
  "google.com", "google.com",                                                        // 10%
  "facebook.com", "facebook.com",                                                    // 10%
  "reddit.com",                                                                      // 5%
];

const DEVICES: ("mobile" | "desktop" | "tablet")[] = [
  "mobile", "mobile", "mobile", "mobile", "mobile", "mobile",   // ~55%
  "mobile", "mobile", "mobile", "mobile", "mobile",
  "desktop", "desktop", "desktop", "desktop", "desktop",         // ~40%
  "desktop", "desktop", "desktop",
  "tablet",                                                      // ~5%
];

const BROWSERS = ["Chrome", "Safari", "Firefox", "Edge"];

const LINK_CLICK_COUNTS = [109, 72, 66, 55, 45, 40, 30, 25, 20, 17, 14, 8];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateClicks(): Click[] {
  const result: Click[] = [];
  const rangeStart = new Date("2026-01-01T00:00:00Z").getTime();
  const rangeEnd = new Date("2026-03-21T23:59:59Z").getTime();
  const span = rangeEnd - rangeStart;

  let clickIndex = 1;

  for (let linkIdx = 0; linkIdx < links.length; linkIdx++) {
    const link = links[linkIdx];
    const count = LINK_CLICK_COUNTS[linkIdx];

    for (let i = 0; i < count; i++) {
      const seed = linkIdx * 1000 + i;
      const r1 = seededRandom(seed + 1);
      const r2 = seededRandom(seed + 2);
      const r3 = seededRandom(seed + 3);
      const r4 = seededRandom(seed + 4);

      const timestamp = new Date(rangeStart + r1 * span);
      const referrer = REFERRERS[Math.floor(r2 * REFERRERS.length)];
      const device = DEVICES[Math.floor(r3 * DEVICES.length)];
      const browser = BROWSERS[Math.floor(r4 * BROWSERS.length)];

      result.push({
        id: `clk_${String(clickIndex).padStart(3, "0")}`,
        link_id: link.id,
        clicked_at: timestamp.toISOString(),
        referrer,
        browser,
        device,
      });

      clickIndex++;
    }
  }

  return result;
}

export const clicks: Click[] = generateClicks();

// ---------------------------------------------------------------------------
// Landing page content (static marketing — not DB-backed)
// ---------------------------------------------------------------------------

export const featureTabs: FeatureTab[] = [
  { id: "shorten",   label: "Shorten",   description: "Paste any URL and get a clean short link in seconds." },
  { id: "customize", label: "Customize", description: "Set a memorable slug — /launch, /deck, /signup." },
  { id: "analyze",   label: "Analyze",   description: "Track every click with referrer, device, and time breakdowns." },
];

export const bentoFeatures: BentoFeature[] = [
  { icon: "Link2",       title: "Custom slugs",      description: "Choose slugs that are easy to remember and share." },
  { icon: "Copy",        title: "One-click copy",    description: "Copy any short URL instantly from the table or detail view." },
  { icon: "BarChart2",   title: "Referrer tracking", description: "See which channels drive the most traffic to each link." },
  { icon: "Smartphone",  title: "Device breakdown",  description: "Understand whether your audience is mobile or desktop." },
];

export const testimonials: Testimonial[] = [
  { quote: "Finally a link shortener that doesn't charge $30/month for click counts.", name: "Maya R.",  role: "Marketing Manager", company: "Nomad" },
  { quote: "Set up in 60 seconds. I just paste, shorten, and share.",                  name: "Dev P.",   role: "Developer",         company: "Stackup" },
  { quote: "The analytics are exactly what I need — no noise, just clicks.",           name: "Priya N.", role: "Head of Content",   company: "Loopcast" },
];

export const footerLinks: FooterLinks = {
  product: [
    { label: "Features",     href: "#features" },
    { label: "How it works", href: "#how-it-works" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog",  href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms",   href: "#" },
  ],
};
