export interface Passage {
  reference: string;
  url: string;
  text?: string;
}

export interface Devotional {
  title?: string;
  author?: string;
  content: string;
}

export interface MediaItem {
  url: string;
  title?: string;
  caption?: string;
}

export interface Media {
  image?: MediaItem;
  video?: MediaItem;
  audio?: MediaItem;
}

export interface Prayer {
  topic: string;
  description: string;
}

export interface ItemConfig {
  item: number;
  title: string;
  passages: Passage[];
  devotional: Devotional;
  media?: Media;
  prayers?: Prayer[];
  reflect?: string[];
  practice?: string[];
  reflectionQuestions?: string[];
  actionSteps?: string[];
}

export interface Plan {
  id: string;
  title: string;
  type: 'reading' | 'prayer' | 'reading_plan' | 'prayer_guide';
  bannerUrl?: string;
  iconUrl?: string;
  items: ItemConfig[];
}

export interface PlanListItem {
  id: string;
  title: string;
  description: string;
  type: 'reading' | 'prayer' | 'category' | 'reading_plan' | 'prayer_guide';
  totalItems?: number;
  url: string;
  creator?: string;
  version?: string;
  iconUrl?: string;
}

export interface UserPlanMetadata {
  startDate: string; // ISO date string
  progress: number[]; // Completed days
  completedItems: Record<number, Record<string, boolean>>; // dayNumber -> { "passage-idx": true, "prayer-idx": true, "action-idx": true }
}

export interface UserPreferences {
  language: 'en' | 'zh' | 'ms';
  bibleTranslation: string;
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  fontTheme: 'modern' | 'editorial' | 'warm' | 'majestic';
}

export interface OrgBranding {
  primaryColor?: string;
  accentColor?: string;
  primaryDarkColor?: string;
  accentDarkColor?: string;
}

export interface Organization {
  name: string;
  logoUrl?: string;
  bannerUrl?: string;
  website?: string;
  email?: string;
  contactPhone?: string;
  socialLinks?: Record<string, string>;
  branding?: OrgBranding;
}

export interface BrandedRegistry {
  organization?: Organization;
  plans: PlanListItem[];
}
