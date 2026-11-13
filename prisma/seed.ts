import { PrismaClient } from "@prisma/client";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSQLite3({
    url: `file:${process.cwd()}/prisma/${(process.env.DATABASE_URL ?? "file:./dev.db").replace(/^file:/, "")}`,
  }),
});

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

function at(daysFromNow: number, hour: number, minute = 0) {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(now + daysFromNow * DAY));
  const pad = (value: number) => String(value).padStart(2, "0");
  return new Date(`${day}T${pad(hour)}:${pad(minute)}:00+08:00`);
}

function code(seed: string) {
  return seed.padEnd(6, "X").slice(0, 6);
}

async function reset() {
  await prisma.suggestionVote.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.suggestion.deleteMany();
  await prisma.customField.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await reset();

  const demo = await prisma.user.create({
    data: {
      email: "demo@quorum.app",
      name: "林一",
      passwordHash: hashPassword("quorum123"),
    },
  });

  await prisma.user.create({
    data: {
      email: "mira@quorum.app",
      name: "Mira",
      passwordHash: hashPassword("quorum123"),
    },
  });

  const saturday = await prisma.activity.create({
    data: {
      shareCode: code("DINNER"),
      ownerId: demo.id,
      title: "周六，去城外吃一顿",
      description:
        "周六晚餐，地点暂定梧桐小院。请选择可行时间与偏好地点，截止后按人数订位。",
      category: "dinner",
      voteType: "single",
      allowSuggestions: true,
      status: "open",
      coverTheme: "coral",
      deadline: at(3, 20, 0),
      locationName: "梧桐小院",
      locationAddress: "杭州市西湖区满觉陇路 12 号",
      locationLat: 30.2287,
      locationLng: 120.1178,
      feeAmount: 168,
      feeNote: "含餐位与酒水，多退少补",
      options: {
        create: [
          { kind: "time", label: "周六 17:30", note: "预计 3 小时", startsAt: at(2, 17, 30), endsAt: at(2, 21, 0), sortOrder: 0 },
          { kind: "time", label: "周六 19:00", note: "预计 3 小时", startsAt: at(2, 19, 0), endsAt: at(2, 22, 0), sortOrder: 1 },
          { kind: "time", label: "周日 12:00", note: "预计 3 小时", startsAt: at(4, 12, 0), endsAt: at(4, 15, 0), sortOrder: 2 },
          { kind: "place", label: "梧桐小院", note: "有院子 · 人均 168", lat: 30.2287, lng: 120.1178, sortOrder: 0 },
          { kind: "place", label: "江边炭火", note: "露台 · 人均 140", lat: 30.2171, lng: 120.1521, sortOrder: 1 },
          { kind: "place", label: "老城区小馆", note: "安静 · 人均 110", lat: 30.2452, lng: 120.1689, sortOrder: 2 },
        ],
      },
      fields: {
        create: [
          {
            label: "有没有忌口？",
            type: "select",
            options: JSON.stringify(["没有", "不吃辣", "不吃海鲜", "素食"]),
            required: true,
            placeholder: "选一个",
            sortOrder: 0,
          },
          {
            label: "怎么过去？",
            type: "text",
            placeholder: "自驾 / 地铁 / 需要拼车",
            sortOrder: 1,
          },
        ],
      },
    },
    include: { options: true, fields: { orderBy: { sortOrder: "asc" } } },
  });

  const timeOpts = saturday.options.filter((o) => o.kind === "time");
  const placeOpts = saturday.options.filter((o) => o.kind === "place");

  const guests = [
    { name: "阿策", diet: "没有", time: 0, place: 0, paid: true, sug: true },
    { name: "Momo", diet: "不吃辣", time: 0, place: 0, paid: true },
    { name: "周周", diet: "没有", time: 0, place: 1, paid: false },
    { name: "Ken", diet: "素食", time: 1, place: 0, paid: false },
    { name: "小满", diet: "不吃海鲜", time: 0, place: 0, paid: true },
    { name: "阿栗", diet: "没有", time: 1, place: 1, paid: false },
    { name: "Nina", diet: "没有", time: 0, place: 0, paid: true, sug: true },
    { name: "老丁", diet: "不吃辣", time: 0, place: 2, paid: false },
    { name: "羽佳", diet: "没有", time: 2, place: 2, paid: false },
  ];

  const participantIds: string[] = [];
  for (let i = 0; i < guests.length; i++) {
    const g = guests[i];
    const p = await prisma.participant.create({
      data: {
        activityId: saturday.id,
        clientKey: `seed-sat-${i}-${Math.random().toString(36).slice(2, 8)}`,
        name: g.name,
        answers: JSON.stringify({
          [saturday.fields[0].id]: g.diet,
          [saturday.fields[1].id]: g.paid ? "自驾" : "地铁",
        }),
        paid: g.paid,
        paidAt: g.paid ? new Date(now - i * 3000) : null,
        createdAt: new Date(now - (guests.length - i) * 7 * 60 * 1000),
      },
    });
    participantIds.push(p.id);
    await prisma.vote.create({
      data: { participantId: p.id, optionId: timeOpts[g.time].id },
    });
    await prisma.vote.create({
      data: { participantId: p.id, optionId: placeOpts[g.place].id },
    });
  }

  const s1 = await prisma.suggestion.create({
    data: {
      activityId: saturday.id,
      content: "是否可以改到周五 19:00？周六需要加班。",
      authorName: "小满",
      kind: "time",
      createdAt: new Date(now - 40 * 60 * 1000),
    },
  });
  const s2 = await prisma.suggestion.create({
    data: {
      activityId: saturday.id,
      content: "附近有一家新开的精酿酒吧，餐后可以继续。",
      authorName: "阿策",
      kind: "other",
      createdAt: new Date(now - 18 * 60 * 1000),
    },
  });

  const upvoters = [
    [0, 1, 2, 3],
    [0, 4, 5],
  ];
  for (let s = 0; s < [s1, s2].length; s++) {
    for (const idx of upvoters[s]) {
      await prisma.suggestionVote.create({
        data: { suggestionId: [s1, s2][s].id, participantId: participantIds[idx] },
      });
    }
  }

  const bookClub = await prisma.activity.create({
    data: {
      shareCode: code("READ07"),
      ownerId: demo.id,
      title: "读书会 · 第七期：我们为什么工作",
      description:
        "本期讨论《狗屁工作》与《毫无意义的工作》。无需读完，带着一个问题参加即可。",
      category: "workshop",
      voteType: "multiple",
      allowSuggestions: true,
      status: "open",
      coverTheme: "lime",
      deadline: at(2, 20, 0),
      locationName: "单向空间 · 花家地店",
      locationAddress: "北京市朝阳区望京中环南路 1 号",
      locationLat: 39.9812,
      locationLng: 116.4729,
      feeAmount: null,
      options: {
        create: [
          { kind: "time", label: "周五 19:30", startsAt: at(1, 19, 30), endsAt: at(1, 21, 30), sortOrder: 0 },
          { kind: "time", label: "周六 14:00", startsAt: at(2, 14, 0), endsAt: at(2, 16, 0), sortOrder: 1 },
          { kind: "place", label: "单向空间 · 花家地店", note: "长桌，可围坐", lat: 39.9812, lng: 116.4729, sortOrder: 0 },
          { kind: "place", label: "某人的客厅", note: "需自备座椅", lat: 39.9938, lng: 116.4681, sortOrder: 1 },
        ],
      },
      fields: {
        create: [
          {
            label: "想带一本什么书来？",
            type: "text",
            placeholder: "书名或一句话",
            sortOrder: 0,
          },
          {
            label: "你更想聊哪个方向？",
            type: "select",
            options: JSON.stringify(["工作意义", "组织与效率", "个人选择", "没有偏好"]),
            required: true,
            sortOrder: 1,
          },
        ],
      },
    },
    include: { options: true, fields: { orderBy: { sortOrder: "asc" } } },
  });

  const readers = ["阿策", "Nina", "老丁", "羽佳", "Momo"];
  const bookTime = bookClub.options.filter((o) => o.kind === "time");
  const bookPlace = bookClub.options.filter((o) => o.kind === "place");
  for (let i = 0; i < readers.length; i++) {
    const p = await prisma.participant.create({
      data: {
        activityId: bookClub.id,
        clientKey: `seed-book-${i}-${Math.random().toString(36).slice(2, 8)}`,
        name: readers[i],
        answers: JSON.stringify({
          [bookClub.fields[1].id]: i % 2 === 0 ? "工作意义" : "个人选择",
          [bookClub.fields[0].id]: "《狗屁工作》",
        }),
        createdAt: new Date(now - (readers.length - i) * 11 * 60 * 1000),
      },
    });
    const picks = i % 2 === 0 ? [bookTime[0], bookTime[1]] : [bookTime[i % 2]];
    for (const opt of picks) {
      await prisma.vote.create({ data: { participantId: p.id, optionId: opt.id } });
    }
    await prisma.vote.create({ data: { participantId: p.id, optionId: bookPlace[i % 2].id } });
  }

  const offsite = await prisma.activity.create({
    data: {
      shareCode: code("TEAM09"),
      ownerId: demo.id,
      title: "产品组 · 春季 Offsite",
      description: "两天一夜。上午复盘，下午自由活动，晚上聚餐。",
      category: "travel",
      voteType: "single",
      allowSuggestions: false,
      status: "closed",
      coverTheme: "ink",
      deadline: new Date(now - 2 * DAY),
      locationName: "莫干山 · 竹里",
      locationAddress: "浙江省湖州市德清县莫干山镇",
      locationLat: 30.5996,
      locationLng: 119.8689,
      feeAmount: 680,
      feeNote: "含住宿、餐饮与交通，按实际结算",
      options: {
        create: [
          { kind: "time", label: "3 月 21 – 22 日", note: "已定档", startsAt: new Date("2027-03-21T09:00:00+08:00"), endsAt: new Date("2027-03-22T18:00:00+08:00"), sortOrder: 0 },
          { kind: "place", label: "莫干山 · 竹里", note: "最终选择", lat: 30.5996, lng: 119.8689, sortOrder: 0 },
        ],
      },
    },
  });

  console.log("Seeded Quorum:");
  console.log("  demo@quorum.app / quorum123");
  console.log(`  /a/${saturday.shareCode}  ${saturday.title}`);
  console.log(`  /a/${bookClub.shareCode}  ${bookClub.title}`);
  console.log(`  /a/${offsite.shareCode}  ${offsite.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
