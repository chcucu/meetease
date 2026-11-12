export const CATEGORIES = [
  { value: "social", label: "聚会", short: "SOCIAL" },
  { value: "dinner", label: "吃饭", short: "DINNER" },
  { value: "sport", label: "运动", short: "SPORT" },
  { value: "travel", label: "出行", short: "TRAVEL" },
  { value: "workshop", label: "工作坊", short: "WORKSHOP" },
  { value: "other", label: "其他", short: "OTHER" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export const COVER_THEMES = [
  { value: "lime", label: "酸柠", swatch: "#d9ff43", ink: "#161613" },
  { value: "coral", label: "珊瑚", swatch: "#ff5c35", ink: "#1b0f0b" },
  { value: "ink", label: "墨黑", swatch: "#161613", ink: "#f4f1e8" },
  { value: "sky", label: "雾蓝", swatch: "#a9c7ff", ink: "#101728" },
  { value: "sand", label: "沙丘", swatch: "#e4d3ae", ink: "#2a2115" },
  { value: "lilac", label: "丁香", swatch: "#c9b8ff", ink: "#1a1229" },
] as const;

export type CoverTheme = (typeof COVER_THEMES)[number]["value"];

export function categoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? "其他";
}

export function categoryShort(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.short ?? "OTHER";
}

export type VoteMode = "single" | "multiple";

export type PublicOption = {
  id: string;
  kind: "time" | "place";
  label: string;
  note: string | null;
  startsAt: string | null;
  endsAt: string | null;
  lat: number | null;
  lng: number | null;
  votes: number;
  vetoes: number;
  score: number;
  rankAvg: number | null;
  rankCount: number;
  voterNames: string[];
  vetoerNames: string[];
};

export type PublicField = {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "multi";
  required: boolean;
  options: string[];
  placeholder: string | null;
};

export type PublicSuggestion = {
  id: string;
  content: string;
  authorName: string;
  kind: "time" | "place" | "other";
  createdAt: string;
  votes: number;
  upvoted: boolean;
};

export type PublicParticipant = {
  id: string;
  name: string;
  createdAt: string;
  /** Only present for the organizer's own view. */
  paid?: boolean;
  paidAt?: string | null;
  optionIds?: string[];
  vetoOptionIds?: string[];
  rankedOptionIds?: string[];
  weight?: number;
  condition?: string | null;
  conditionOptionId?: string | null;
  answers?: Record<string, string | string[]>;
};

export type ActivityCounts = {
  participants: number;
  votes: number;
  suggestions: number;
  paid: number;
};

export type ActivitySummary = {
  id: string;
  shareCode: string;
  joinCode: string | null;
  title: string;
  description: string;
  category: string;
  status: "open" | "closed";
  voteType: VoteMode;
  allowSuggestions: boolean;
  coverTheme: string;
  coverImage: string | null;
  timeZone: string;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  counts: ActivityCounts;
};

export type Agreement = {
  /** 0–100, null when nobody voted for this kind. */
  time: number | null;
  place: number | null;
};

export type TieBreak = {
  optionIds: string[];
  until: string | null;
};

export type RankedWinners = {
  time: string | null;
  place: string | null;
};

export type ActivityDetail = ActivitySummary & {
  organizer: { name: string; initials: string };
  location: { name: string | null; address: string | null; lat: number | null; lng: number | null } | null;
  fee: { amount: number; note: string | null } | null;
  options: PublicOption[];
  fields: PublicField[];
  suggestions: PublicSuggestion[];
  participants: PublicParticipant[];
  consensus: Agreement;
  rankedWinners: RankedWinners;
  tieBreak: TieBreak | null;
  you: {
    id: string;
    name: string;
    optionIds: string[];
    vetoOptionIds: string[];
    rankedOptionIds: string[];
    condition: string | null;
    conditionOptionId: string | null;
    answers: Record<string, string | string[]>;
  } | null;
};

export type ActivitySnapshot = {
  activity: {
    id: string;
    shareCode: string;
    joinCode: string | null;
    title: string;
    status: "open" | "closed";
    voteType: VoteMode;
    deadline: string | null;
    timeZone: string;
    feeAmount: number | null;
    feeNote: string | null;
    allowSuggestions: boolean;
    consensus: Agreement;
    rankedWinners: RankedWinners;
    tieBreak: TieBreak | null;
  };
  options: PublicOption[];
  suggestions: PublicSuggestion[];
  participants: PublicParticipant[];
  counts: ActivityCounts;
  updatedAt: string;
};

export type Viewer = {
  id: string;
  name: string;
  email: string;
} | null;
