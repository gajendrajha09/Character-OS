import { MIMI_IMAGES } from "./mimi-images";

export const activeCharacter = {
  id: "mimi",
  name: "Mimi",
  age: 23,
  occupation: "Marketing Executive",
  location: "Powai, Mumbai",
  niche: "Lifestyle Creator",
  traits: ["Playful", "Luxury", "Feminine"],
  currentCampaign: "Monsoon in Mumbai",
  currentMood: "Cozy Luxury",
  currentWorld: "Mimi's Mumbai World",
  portraitUrl: MIMI_IMAGES.portrait,
  portraitGradient: "from-rose-400/40 via-amber-200/20 to-violet-500/30",
};

export const creatorStats = [
  { label: "Posts Generated", value: 24 },
  { label: "Reels Generated", value: 12 },
  { label: "Campaigns Active", value: 2 },
  { label: "Assets This Month", value: 42 },
  { label: "Ready to Publish", value: 8 },
];

export const primaryActions = [
  { id: "post", label: "Generate Post", emoji: "📸", accent: "from-violet-500 to-purple-600" },
  { id: "reel", label: "Generate Reel", emoji: "🎬", accent: "from-rose-500 to-orange-500", featured: true },
  { id: "promo", label: "Product Promotion", emoji: "✨", accent: "from-amber-500 to-yellow-600" },
  { id: "calendar", label: "Content Calendar", emoji: "📅", accent: "from-cyan-500 to-blue-600" },
  { id: "story", label: "Story Sequence", emoji: "📱", accent: "from-pink-500 to-rose-600" },
  { id: "campaign", label: "Generate Campaign", emoji: "🚀", accent: "from-emerald-500 to-teal-600" },
];

export const worldNodes = [
  { id: "root", label: "Mimi", type: "character", x: 50, y: 8, imageUrl: MIMI_IMAGES.portrait },
  { id: "apartment", label: "Apartment", type: "home", x: 18, y: 38, imageUrl: MIMI_IMAGES.apartment },
  { id: "office", label: "Office", type: "work", x: 38, y: 55, imageUrl: MIMI_IMAGES.office },
  { id: "cafe", label: "Favorite Cafe", type: "place", x: 58, y: 38, imageUrl: MIMI_IMAGES.cafe },
  { id: "friend", label: "Best Friend", type: "person", x: 78, y: 55, imageUrl: MIMI_IMAGES.friend },
  { id: "gym", label: "Gym", type: "place", x: 28, y: 78, imageUrl: MIMI_IMAGES.gym },
  { id: "mall", label: "Mall", type: "place", x: 50, y: 88, imageUrl: MIMI_IMAGES.mall },
  { id: "travel", label: "Travel Spot", type: "place", x: 72, y: 78, imageUrl: MIMI_IMAGES.travel },
];

export const recentContent = [
  { id: "1", type: "image", title: "Sunday at Blue Tokai", imageUrl: MIMI_IMAGES.content[0], gradient: "from-amber-900/80 to-orange-700/60", time: "2h ago" },
  { id: "2", type: "reel", title: "Monday Morning Routine", imageUrl: MIMI_IMAGES.content[1], gradient: "from-violet-900/80 to-purple-700/60", time: "5h ago" },
  { id: "3", type: "promo", title: "Nike Street Style", imageUrl: MIMI_IMAGES.content[2], gradient: "from-zinc-800 to-zinc-600", time: "1d ago" },
  { id: "4", type: "caption", title: "Monsoon balcony vibes", imageUrl: MIMI_IMAGES.content[3], gradient: "from-sky-900/80 to-indigo-700/60", time: "1d ago" },
  { id: "5", type: "campaign", title: "Monsoon in Mumbai", imageUrl: MIMI_IMAGES.content[4], gradient: "from-emerald-900/80 to-teal-700/60", time: "3d ago" },
];

export const productionBrief = {
  contentType: "Instagram Reel",
  goal: "Morning lifestyle — cozy luxury aesthetic",
  platform: "Instagram",
  character: "Mimi",
  theme: "Monday Morning at Home",
  duration: "15 sec",
  advanced: {
    location: "Powai Apartment",
    wardrobe: "Oversized Beige Sweater",
    mood: "Cozy Luxury",
    camera: "Handheld Lifestyle Vlog",
  },
};

export const advancedModules = [
  { label: "Character Bible", href: "#bible" },
  { label: "World Builder", href: "#world" },
  { label: "Location Library", href: "#locations" },
  { label: "Friend Network", href: "#friends" },
  { label: "Content Planner", href: "#content" },
  { label: "Campaign Planner", href: "#campaigns" },
  { label: "Asset Vault", href: "#assets" },
  { label: "Production Brief", href: "#briefs" },
];
