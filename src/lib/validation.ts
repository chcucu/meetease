import { z } from "zod";
import { isValidTimeZone } from "./format";

export const categoryValues = ["social", "dinner", "sport", "travel", "workshop", "other"] as const;
export const themeValues = ["lime", "coral", "ink", "sky", "sand", "lilac"] as const;
export const fieldTypes = ["text", "textarea", "number", "select", "multi"] as const;

const dateValue = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "时间格式不正确")
  .nullable()
  .optional();

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `最多 ${max} 个字符`)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null));

const optionSchema = z.object({
  kind: z.enum(["time", "place"]),
  label: z.string().trim().min(1, "选项名称不能为空").max(80, "选项名称过长"),
  note: optionalText(120),
  startsAt: dateValue,
  endsAt: dateValue,
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
});

export const addOptionSchema = optionSchema;

const fieldSchema = z.object({
  label: z.string().trim().min(1, "问题不能为空").max(60, "问题过长"),
  type: z.enum(fieldTypes),
  required: z.boolean().default(false),
  options: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  placeholder: optionalText(80),
});

export const createActivitySchema = z.object({
  title: z.string().trim().min(2, "标题至少 2 个字符").max(80, "标题最多 80 个字符"),
  description: z.string().trim().max(600, "描述最多 600 个字符").default(""),
  category: z.enum(categoryValues).default("other"),
  voteType: z.enum(["single", "multiple"]).default("single"),
  allowSuggestions: z.boolean().default(true),
  deadline: dateValue,
  coverTheme: z.enum(themeValues).default("lime"),
  timeZone: z
    .string()
    .trim()
    .max(64)
    .refine(isValidTimeZone, "时区无效")
    .default("Asia/Shanghai"),
  coverImage: z
    .string()
    .trim()
    .url("图片链接格式不正确")
    .max(600)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  location: z
    .object({
      name: optionalText(80),
      address: optionalText(160),
      lat: z.number().min(-90).max(90).nullable().optional(),
      lng: z.number().min(-180).max(180).nullable().optional(),
    })
    .nullable()
    .optional(),
  fee: z
    .object({
      amount: z.number().min(0, "费用不能为负数").max(100000, "费用过高"),
      note: optionalText(120),
    })
    .nullable()
    .optional(),
  options: z.array(optionSchema).max(24, "选项过多").default([]),
  fields: z.array(fieldSchema).max(10, "问题过多").default([]),
});

export const respondSchema = z.object({
  clientKey: z
    .string()
    .min(8, "客户端标识无效")
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/, "客户端标识无效"),
  name: z.string().trim().min(1, "请填写你的称呼").max(30, "称呼最多 30 个字符"),
  optionIds: z.array(z.string().min(1)).max(30).default([]),
  answers: z
    .record(
      z.string(),
      z.union([z.string().max(500), z.array(z.string().max(80)).max(12)])
    )
    .default({}),
  sliderToken: z.string().max(512).optional(),
  sliderX: z.number().min(0).max(400).optional(),
  vetoOptionIds: z.array(z.string().min(1)).max(1).default([]),
  rankedOptionIds: z.array(z.string().min(1)).max(30).default([]),
  condition: z.string().trim().max(120).optional(),
  conditionOptionId: z.string().max(64).optional(),
});

export const suggestionSchema = z.object({
  content: z.string().trim().min(1, "写点什么吧").max(300, "最多 300 个字符"),
  authorName: z.string().trim().min(1).max(30).default("匿名"),
  kind: z.enum(["time", "place", "other"]).default("other"),
  clientKey: z.string().min(8).max(64).optional(),
  sliderToken: z.string().max(512).optional(),
  sliderX: z.number().min(0).max(400).optional(),
});

export const updateActivitySchema = z.object({
  status: z.enum(["open", "closed"]).optional(),
  deadline: dateValue,
  allowSuggestions: z.boolean().optional(),
});

export const paymentSchema = z.object({
  paid: z.boolean(),
});

export const participantUpdateSchema = z.object({
  paid: z.boolean().optional(),
  weight: z.number().int().min(1).max(5).optional(),
});

export const suggestionVoteSchema = z.object({
  clientKey: z.string().min(8, "请先提交你的选择").max(64),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "请填写你的名字").max(24, "名字最多 24 个字符"),
  email: z.string().trim().toLowerCase().email("邮箱格式不正确"),
  password: z.string().min(8, "密码至少 8 位").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("邮箱格式不正确"),
  password: z.string().min(1, "请输入密码").max(72),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type AddOptionInput = z.infer<typeof addOptionSchema>;
export type RespondInput = z.infer<typeof respondSchema>;
export type SuggestionInput = z.infer<typeof suggestionSchema>;
