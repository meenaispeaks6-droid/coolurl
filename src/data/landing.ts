import type { Logo } from "@/pages/landing/components/partner-logo-grid";

export const heroWords = [
  "Real work",
  "Advanced analysis",
  "Repetitive tasks",
  "Deep research",
  "Meeting prep",
  "Data insights",
];

export const partnerLogos: Logo[] = [
  { key: "vercel", src: "/logos/vercel.svg", alt: "Vercel" },
  { key: "stripe", src: "/logos/stripe.svg", alt: "Stripe" },
  { key: "supabase", src: "/logos/supabase.svg", alt: "Supabase" },
  { key: "cursor", src: "/logos/cursor.svg", alt: "Cursor" },
  { key: "raycast", src: "/logos/raycast.svg", alt: "Raycast" },
  { key: "posthog", src: "/logos/posthog.svg", alt: "PostHog" },
  { key: "webflow", src: "/logos/webflow.svg", alt: "Webflow" },
  { key: "resend", src: "/logos/resend.svg", alt: "Resend" },
  { key: "clerk", src: "/logos/clerk.svg", alt: "Clerk" },
  { key: "asana", src: "/logos/asana.svg", alt: "Asana" },
  { key: "slack", src: "/logos/slack.svg", alt: "Slack" },
  { key: "sanity", src: "/logos/sanity.svg", alt: "Sanity" },
  { key: "shopify", src: "/logos/shopify.svg", alt: "Shopify" },
  { key: "replit", src: "/logos/replit.svg", alt: "Replit" },
];

export interface QuoteTestimonial {
  quote: string;
  title: string;
  company: string;
  backgroundImage: string;
  variant: "light" | "dark";
}

export const quoteTestimonials: QuoteTestimonial[] = [
  {
    quote: "A compliance report that used to take our legal team an entire week now gets drafted in under 4 hours. The accuracy is remarkable.",
    title: "General Counsel",
    company: "Global financial services firm",
    backgroundImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    variant: "light",
  },
  {
    quote: "Our team tried to turn it off for a week as a test. By Wednesday, people were filing support tickets to get it back.",
    title: "VP of Engineering",
    company: "Series B fintech startup",
    backgroundImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
    variant: "light",
  },
  {
    quote: "Sales cycles shortened by 30% because reps walk into every call with deep account context they never had time to assemble before.",
    title: "Chief Revenue Officer",
    company: "Enterprise SaaS company",
    backgroundImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    variant: "light",
  },
  {
    quote: "We replaced 6 disconnected internal tools with one surface. Onboarding new analysts went from 3 weeks to 3 days.",
    title: "Head of Operations",
    company: "Management consulting firm",
    backgroundImage: "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=800&q=80",
    variant: "light",
  },
  {
    quote: "The thing that sold us was governance. We choose exactly which data sources it can access and audit every interaction.",
    title: "Chief Information Security Officer",
    company: "Healthcare technology provider",
    backgroundImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    variant: "light",
  },
  {
    quote: "People who never touched automation before are building their own workflows. It lowered the bar without lowering the ceiling.",
    title: "Director of Digital Transformation",
    company: "Commercial real estate group",
    backgroundImage: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
    variant: "light",
  },
  {
    quote: "Portfolio monitoring that took a full analyst day now runs continuously. We catch signals we were completely missing before.",
    title: "Managing Partner",
    company: "Growth equity firm",
    backgroundImage: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80",
    variant: "light",
  },
  {
    quote: "I asked it for the action items from last Thursday's board meeting and had them in Slack in 12 seconds. That changed everything.",
    title: "Chief Technology Officer",
    company: "Logistics platform startup",
    backgroundImage: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80",
    variant: "light",
  },
];

export interface Testimonial {
  name: string;
  initials: string;
  avatar?: string;
  title: string;
  company: string;
  quote: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    initials: "SC",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face",
    title: "VP Engineering",
    company: "Acme",
    quote: "This tool transformed how our team collaborates. We shipped 3x faster in the first quarter.",
  },
  {
    name: "Marcus Rivera",
    initials: "MR",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face",
    title: "Product Lead",
    company: "Globex",
    quote: "The AI features feel like magic. It handles the repetitive work so we can focus on strategy.",
  },
  {
    name: "Emma Johansson",
    initials: "EJ",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face",
    title: "CTO",
    company: "Initech",
    quote: "We evaluated 6 tools before choosing this one. The integration was seamless.",
  },
  {
    name: "David Kim",
    initials: "DK",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    title: "Head of Ops",
    company: "Umbrella",
    quote: "Our operational costs dropped 40% in the first month. The ROI speaks for itself.",
  },
  {
    name: "Aisha Patel",
    initials: "AP",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    title: "Director of Growth",
    company: "Stark Industries",
    quote: "The analytics dashboard alone was worth the investment. Finally, data we can act on.",
  },
];

export interface QuoteSlideData {
  quote: string;
  author: string;
  title: string;
  company: string;
  imageUrl?: string;
  rotation?: number;
}

export const quoteSlides: QuoteSlideData[] = [
  {
    quote: "This tool transformed how our team collaborates. We shipped 3x faster in the first quarter.",
    author: "Sarah Chen",
    title: "VP Engineering",
    company: "Acme",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
    rotation: -3,
  },
  {
    quote: "The AI features feel like magic. It handles the repetitive work so we can focus on strategy.",
    author: "Marcus Rivera",
    title: "Product Lead",
    company: "Globex",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
    rotation: 2,
  },
  {
    quote: "We evaluated 6 tools before choosing this one. The integration was seamless.",
    author: "Emma Johansson",
    title: "CTO",
    company: "Initech",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80",
    rotation: -2,
  },
  {
    quote: "Our operational costs dropped 40% in the first month. The ROI speaks for itself.",
    author: "David Kim",
    title: "Head of Ops",
    company: "Umbrella",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    rotation: 3,
  },
];
