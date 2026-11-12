export type TallyKind = "time" | "place";

export type TallyVote = {
  participantId: string;
  value: number;
  rank: number;
  participant: { weight: number };
};

export type TallyOption = {
  id: string;
  kind: string;
  votes: TallyVote[];
};

function optionsOfKind(options: TallyOption[], kind: TallyKind) {
  return options.filter((option) => option.kind === kind);
}

function scoreOf(option: TallyOption) {
  return option.votes.reduce(
    (sum, vote) => sum + (vote.participant.weight ?? 1) * vote.value,
    0
  );
}

/**
 * 归一化共识度：0 表示意见完全分散，100 表示意见完全一致。
 * 只统计加权支持票为正的选项；无人支持时返回 null。
 */
export function consensus(options: TallyOption[], kind: TallyKind): number | null {
  const scores = optionsOfKind(options, kind)
    .map(scoreOf)
    .filter((score) => score > 0);

  if (scores.length === 0) return null;
  if (scores.length === 1) return 100;

  const total = scores.reduce((sum, score) => sum + score, 0);
  const entropy = scores.reduce((sum, score) => {
    const p = score / total;
    return sum - p * Math.log(p);
  }, 0);
  const maxEntropy = Math.log(scores.length);
  const value = Math.round((1 - entropy / maxEntropy) * 100);
  return Math.max(0, Math.min(100, value));
}

type Ballot = { weight: number; prefs: string[] };

function ballotsFor(options: TallyOption[], kind: TallyKind): Ballot[] {
  const grouped = new Map<string, { weight: number; ranks: { id: string; rank: number }[] }>();

  for (const option of optionsOfKind(options, kind)) {
    for (const vote of option.votes) {
      if (vote.value !== 1 || vote.rank <= 0) continue;
      const entry = grouped.get(vote.participantId) ?? {
        weight: vote.participant.weight ?? 1,
        ranks: [],
      };
      entry.ranks.push({ id: option.id, rank: vote.rank });
      grouped.set(vote.participantId, entry);
    }
  }

  return [...grouped.values()]
    .map((entry) => ({
      weight: entry.weight,
      prefs: [...entry.ranks].sort((a, b) => a.rank - b.rank).map((item) => item.id),
    }))
    .filter((ballot) => ballot.prefs.length > 0);
}

/**
 * 即时决胜（IRV）：每轮按 participant.weight 计票，淘汰最低者并把选票转移给下一偏好。
 * 得票超过 50% 或只剩最后一个候选时返回其 id；无法产生（无排序票或全部并列）返回 null。
 */
export function rankedWinner(options: TallyOption[], kind: TallyKind): string | null {
  const candidates = optionsOfKind(options, kind).map((option) => option.id);
  if (candidates.length === 0) return null;

  const ballots = ballotsFor(options, kind);
  if (ballots.length === 0) return null;

  const active = new Set(candidates);

  while (active.size > 0) {
    const counts = new Map<string, number>();
    for (const id of active) counts.set(id, 0);

    for (const ballot of ballots) {
      const pick = ballot.prefs.find((id) => active.has(id));
      if (pick) counts.set(pick, (counts.get(pick) ?? 0) + ballot.weight);
    }

    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const total = ranked.reduce((sum, [, count]) => sum + count, 0);
    if (total === 0) return null;

    if (ranked[0][1] * 2 > total) return ranked[0][0];
    if (active.size === 1) return ranked[0][0];

    const lowest = Math.min(...ranked.map(([, count]) => count));
    const eliminated = ranked.filter(([, count]) => count === lowest).map(([id]) => id);

    // 所有候选仍然并列，无法通过淘汰产生胜者。
    if (eliminated.length >= active.size) return null;
    for (const id of eliminated) active.delete(id);
  }

  return null;
}

/** 返回 score 最高且并列的选项 id（至少两个）；无票或没有并列时返回空数组。 */
export function tiedTopOptionIds(options: TallyOption[], kind: TallyKind): string[] {
  const ofKind = optionsOfKind(options, kind);
  if (ofKind.length < 2) return [];

  const max = Math.max(...ofKind.map(scoreOf));
  if (max <= 0) return [];

  const tied = ofKind.filter((option) => scoreOf(option) === max).map((option) => option.id);
  return tied.length >= 2 ? tied : [];
}
