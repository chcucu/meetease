import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { generateShareCode } from "./codes";
import type {
  ActivityCounts,
  ActivityDetail,
  ActivitySnapshot,
  ActivitySummary,
  PublicField,
  PublicOption,
  PublicParticipant,
  PublicSuggestion,
} from "./types";
import type { CreateActivityInput } from "./validation";

const detailInclude = Prisma.validator<Prisma.ActivityInclude>()({
  fields: { orderBy: { sortOrder: "asc" } },
  options: {
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
    include: {
      votes: { select: { participant: { select: { name: true } } } },
    },
  },
  suggestions: {
    orderBy: { createdAt: "desc" },
    include: { votes: { select: { participantId: true } } },
  },
  participants: {
    orderBy: { createdAt: "asc" },
    include: { votes: { select: { optionId: true } } },
  },
  owner: { select: { name: true } },
});

const snapshotInclude = Prisma.validator<Prisma.ActivityInclude>()({
  options: {
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
    include: {
      votes: { select: { participant: { select: { name: true } } } },
    },
  },
  suggestions: {
    orderBy: { createdAt: "desc" },
    include: { votes: { select: { participantId: true } } },
  },
  participants: {
    orderBy: { createdAt: "asc" },
    include: { votes: { select: { optionId: true } } },
  },
});

type DetailRecord = Prisma.ActivityGetPayload<{ include: typeof detailInclude }>;
type SnapshotRecord = Prisma.ActivityGetPayload<{ include: typeof snapshotInclude }>;
type YouRecord = Prisma.ParticipantGetPayload<{
  include: { votes: true; suggestionVotes: true };
}> | null;

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mapOption(option: DetailRecord["options"][number]): PublicOption {
  return {
    id: option.id,
    kind: option.kind === "place" ? "place" : "time",
    label: option.label,
    note: option.note,
    startsAt: option.startsAt ? option.startsAt.toISOString() : null,
    endsAt: option.endsAt ? option.endsAt.toISOString() : null,
    lat: option.lat,
    lng: option.lng,
    votes: option.votes.length,
    voterNames: option.votes.map((v) => v.participant.name),
  };
}

function mapSuggestion(
  suggestion: DetailRecord["suggestions"][number],
  upvotedIds: Set<string>
): PublicSuggestion {
  return {
    id: suggestion.id,
    content: suggestion.content,
    authorName: suggestion.authorName,
    kind: (suggestion.kind as PublicSuggestion["kind"]) ?? "other",
    createdAt: suggestion.createdAt.toISOString(),
    votes: suggestion.votes.length,
    upvoted: upvotedIds.has(suggestion.id),
  };
}

function mapParticipant(
  participant: DetailRecord["participants"][number],
  includePrivate: boolean
): PublicParticipant {
  return {
    id: participant.id,
    name: participant.name,
    createdAt: participant.createdAt.toISOString(),
    ...(includePrivate
      ? {
          paid: participant.paid,
          paidAt: participant.paidAt ? participant.paidAt.toISOString() : null,
          optionIds: participant.votes.map((vote) => vote.optionId),
          answers: parseJson<Record<string, string | string[]>>(participant.answers, {}),
        }
      : {}),
  };
}

function countsFor(
  options: { votes: number }[],
  suggestions: number,
  participants: { paid: boolean }[]
): ActivityCounts {
  return {
    participants: participants.length,
    votes: options.reduce((sum, option) => sum + option.votes, 0),
    suggestions,
    paid: participants.filter((p) => p.paid).length,
  };
}

function mapSummary(activity: DetailRecord): ActivitySummary {
  return {
    id: activity.id,
    shareCode: activity.shareCode,
    title: activity.title,
    description: activity.description,
    category: activity.category,
    status: activity.status === "closed" ? "closed" : "open",
    voteType: activity.voteType === "multiple" ? "multiple" : "single",
    allowSuggestions: activity.allowSuggestions,
    coverTheme: activity.coverTheme,
    coverImage: activity.coverImage,
    deadline: activity.deadline ? activity.deadline.toISOString() : null,
    createdAt: activity.createdAt.toISOString(),
    updatedAt: activity.updatedAt.toISOString(),
    ownerId: activity.ownerId,
    counts: countsFor(
      activity.options.map((option) => ({ votes: option.votes.length })),
      activity.suggestions.length,
      activity.participants
    ),
  };
}

function mapDetail(
  activity: DetailRecord,
  you: YouRecord,
  includePrivate: boolean
): ActivityDetail {
  const upvotedIds = new Set(you?.suggestionVotes.map((v) => v.suggestionId) ?? []);
  const fields: PublicField[] = activity.fields.map((field) => ({
    id: field.id,
    label: field.label,
    type: (["text", "textarea", "number", "select", "multi"].includes(field.type)
      ? field.type
      : "text") as PublicField["type"],
    required: field.required,
    options: parseJson<string[]>(field.options, []),
    placeholder: field.placeholder,
  }));

  return {
    ...mapSummary(activity),
    organizer: {
      name: activity.owner?.name ?? "组织者",
      initials: (activity.owner?.name ?? "组").slice(0, 1),
    },
    location:
      activity.locationName || activity.locationAddress || activity.locationLat
        ? {
            name: activity.locationName,
            address: activity.locationAddress,
            lat: activity.locationLat,
            lng: activity.locationLng,
          }
        : null,
    fee:
      activity.feeAmount !== null && activity.feeAmount !== undefined
        ? { amount: activity.feeAmount, note: activity.feeNote }
        : null,
    options: activity.options.map(mapOption),
    fields,
    suggestions: activity.suggestions.map((s) => mapSuggestion(s, upvotedIds)),
    participants: activity.participants.map((participant) =>
      mapParticipant(participant, includePrivate)
    ),
    you: you
      ? {
          id: you.id,
          name: you.name,
          optionIds: you.votes.map((v) => v.optionId),
          answers: parseJson<Record<string, string | string[]>>(you.answers, {}),
        }
      : null,
  } as ActivityDetail;
}

export async function getActivityDetail(code: string, clientKey?: string | null) {
  const activity = await prisma.activity.findUnique({
    where: { shareCode: code },
    include: detailInclude,
  });

  if (!activity) return null;

  let you: YouRecord = null;
  if (clientKey) {
    you = await prisma.participant.findUnique({
      where: { activityId_clientKey: { activityId: activity.id, clientKey } },
      include: { votes: true, suggestionVotes: true },
    });
  }

  return mapDetail(activity, you, false);
}

export async function getActivityForOwner(code: string, ownerId: string) {
  const activity = await prisma.activity.findUnique({
    where: { shareCode: code },
    include: detailInclude,
  });
  if (!activity || activity.ownerId !== ownerId) return null;
  return mapDetail(activity, null, true);
}

function mapSnapshot(activity: SnapshotRecord): ActivitySnapshot {
  const options = activity.options.map((option) => mapOption(option as DetailRecord["options"][number]));
  const participants = activity.participants.map((p) =>
    mapParticipant(p as DetailRecord["participants"][number], false)
  );
  return {
    activity: {
      id: activity.id,
      shareCode: activity.shareCode,
      title: activity.title,
      status: activity.status === "closed" ? "closed" : "open",
      voteType: activity.voteType === "multiple" ? "multiple" : "single",
      deadline: activity.deadline ? activity.deadline.toISOString() : null,
      feeAmount: activity.feeAmount,
      feeNote: activity.feeNote,
      allowSuggestions: activity.allowSuggestions,
    },
    options,
    suggestions: activity.suggestions.map((s) =>
      mapSuggestion(s as DetailRecord["suggestions"][number], new Set())
    ),
    participants,
    counts: countsFor(options, activity.suggestions.length, activity.participants),
    updatedAt: activity.updatedAt.toISOString(),
  };
}

export async function getSnapshot(code: string): Promise<ActivitySnapshot | null> {
  const activity = await prisma.activity.findUnique({
    where: { shareCode: code },
    include: snapshotInclude,
  });
  if (!activity) return null;
  return mapSnapshot(activity);
}

export async function getOwnerActivities(ownerId: string): Promise<ActivitySummary[]> {
  const activities = await prisma.activity.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    include: {
      options: { select: { votes: { select: { id: true } } } },
      participants: { select: { paid: true } },
      suggestions: { select: { id: true } },
    },
  });

  return activities.map((activity) => ({
    id: activity.id,
    shareCode: activity.shareCode,
    title: activity.title,
    description: activity.description,
    category: activity.category,
    status: activity.status === "closed" ? "closed" : "open",
    voteType: activity.voteType === "multiple" ? "multiple" : "single",
    allowSuggestions: activity.allowSuggestions,
    coverTheme: activity.coverTheme,
    coverImage: activity.coverImage,
    deadline: activity.deadline ? activity.deadline.toISOString() : null,
    createdAt: activity.createdAt.toISOString(),
    updatedAt: activity.updatedAt.toISOString(),
    ownerId: activity.ownerId,
    counts: {
      participants: activity.participants.length,
      votes: activity.options.reduce((sum, o) => sum + o.votes.length, 0),
      suggestions: activity.suggestions.length,
      paid: activity.participants.filter((p) => p.paid).length,
    },
  } as ActivitySummary));
}

export async function createActivity(ownerId: string, input: CreateActivityInput) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const shareCode = generateShareCode();
    const existing = await prisma.activity.findUnique({ where: { shareCode }, select: { id: true } });
    if (existing) continue;

    const timeOptions = input.options.filter((o) => o.kind === "time");
    const placeOptions = input.options.filter((o) => o.kind === "place");

    try {
      return await prisma.activity.create({
        data: {
          shareCode,
          ownerId,
          title: input.title,
          description: input.description,
          category: input.category,
          voteType: input.voteType,
          allowSuggestions: input.allowSuggestions,
          deadline: input.deadline ? new Date(input.deadline) : null,
          coverTheme: input.coverTheme,
          coverImage: input.coverImage || null,
          locationName: input.location?.name ?? null,
          locationAddress: input.location?.address ?? null,
          locationLat: input.location?.lat ?? null,
          locationLng: input.location?.lng ?? null,
          feeAmount: input.fee?.amount ?? null,
          feeNote: input.fee?.note ?? null,
          options: {
            create: [
              ...timeOptions.map((option, index) => ({
                kind: "time" as const,
                label: option.label,
                note: option.note,
                startsAt: option.startsAt ? new Date(option.startsAt) : null,
                endsAt: option.endsAt ? new Date(option.endsAt) : null,
                sortOrder: index,
              })),
              ...placeOptions.map((option, index) => ({
                kind: "place" as const,
                label: option.label,
                note: option.note,
                lat: option.lat ?? null,
                lng: option.lng ?? null,
                sortOrder: index,
              })),
            ],
          },
          fields: {
            create: input.fields.map((field, index) => ({
              label: field.label,
              type: field.type,
              required: field.required,
              options: field.options.length ? JSON.stringify(field.options) : null,
              placeholder: field.placeholder,
              sortOrder: index,
            })),
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Could not allocate a share code");
}

export async function participantCountForActivity(activityId: string) {
  return prisma.participant.count({ where: { activityId } });
}
