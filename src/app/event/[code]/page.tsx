"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import MacWindow from "@/components/MacWindow";

const EventMap = dynamic(() => import("@/components/EventMap"), { ssr: false });

type Activity = {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  allowSuggestions: boolean;
  voteType: string;
  shareCode: string;
  status: string;
  deadline: string | null;
  category: string;
  imageUrl: string | null;
  feeAmount: number | null;
  feeDescription: string | null;
  feeDeadline: string | null;
  locationName: string | null;
  locationAddress: string | null;
  locationLat: number | null;
  locationLng: number | null;
  customFields: CustomField[];
  timeOptions: OptionWithCount[];
  locationOptions: OptionWithCount[];
  suggestions: SuggestionWithCount[];
};

type CustomField = {
  id: string;
  label: string;
  fieldType: string;
  required: boolean;
  options: string | null;
  placeholder: string | null;
};

type OptionWithCount = {
  id: string;
  label: string;
  name?: string;
  address?: string;
  _count: { votes: number };
};

type SuggestionWithCount = {
  id: string;
  content: string;
  authorName: string;
  type: string;
  _count: { votes: number };
};

export default function EventPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const searchParams = useSearchParams();
  const isCreated = searchParams.get("created") === "true";
  const router = useRouter();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [customData, setCustomData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [participantId, setParticipantId] = useState("");
  const [suggestionText, setSuggestionText] = useState("");
  const [suggestionType, setSuggestionType] = useState("time");
  const [suggesting, setSuggesting] = useState(false);
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/activities/${code}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setActivity(data.activity);
        else setError("活动不存在或已删除");
      })
      .catch(() => setError("加载活动失败"))
      .finally(() => setLoading(false));
  }, [code]);

  const toggleTime = (id: string) => {
    if (activity?.voteType === "single") setSelectedTimes([id]);
    else setSelectedTimes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleLocation = (id: string) => {
    if (activity?.voteType === "single") setSelectedLocations([id]);
    else setSelectedLocations((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async () => {
    if (!participantName.trim()) {
      setError("请先填写你的称呼");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/activities/${code}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          participantName,
          timeOptionIds: selectedTimes,
          locationOptionIds: selectedLocations,
          customData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setParticipantId(data.participantId);
        setSubmitted(true);
      } else {
        setError(data.error || "提交失败，请重试");
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuggest = async () => {
    if (!suggestionText.trim()) return;
    setSuggesting(true);
    try {
      await fetch(`/api/activities/${code}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: suggestionText,
          authorName: participantName || "匿名",
          type: suggestionType,
        }),
      });
      setSuggestionText("");
      setShowSuggestForm(false);
    } catch {
      // ignore
    } finally {
      setSuggesting(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/event/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-meet-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-meet-600 font-medium">正在加载活动</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <MacWindow title="出错了" className="max-w-md w-full">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-meet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-meet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-meet-800 mb-2">活动不存在</h2>
            <p className="text-meet-600/70 mb-6">这个活动可能已被删除或链接有误。</p>
            <Link href="/" className="btn-sky text-white font-semibold px-6 py-2.5 rounded-xl inline-block">
              返回首页
            </Link>
          </div>
        </MacWindow>
      </div>
    );
  }

  if (isCreated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <MacWindow title="创建成功" className="max-w-md w-full anim-pop">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-meet-400 to-meet-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-meet-200/50">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="font-display text-2xl text-meet-800 mb-2">活动创建成功</h2>
            <p className="text-meet-600/70 mb-4">把这个链接分享给参与者：</p>
            <div className="flex items-center gap-2 bg-meet-50 rounded-xl p-3 mb-6 border border-meet-100">
              <input
                type="text"
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/event/${code}`}
                className="flex-1 bg-transparent text-sm text-meet-700 outline-none"
              />
              <button onClick={copyLink} className="text-meet-600 hover:text-meet-800 text-sm font-semibold shrink-0">
                {copied ? "已复制" : "复制"}
              </button>
            </div>
            <div className="flex gap-3">
              <Link href={`/event/${code}`} className="flex-1 btn-sky text-white font-semibold py-2.5 rounded-xl text-sm text-center">
                预览活动
              </Link>
              <Link href={`/results/${code}`} className="flex-1 bg-white/70 backdrop-blur-sm text-meet-700 font-semibold py-2.5 rounded-xl text-sm text-center hover:bg-white transition border border-meet-100">
                实时结果
              </Link>
            </div>
          </div>
        </MacWindow>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <MacWindow title="投票成功" className="max-w-md w-full anim-pop">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-meet-400 to-meet-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-meet-200/50">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="font-display text-2xl text-meet-800 mb-2">感谢参与</h2>
            <p className="text-meet-600/70 mb-6">你的投票已记录，看看大家的实时选择吧。</p>
            <Link href={`/results/${code}`} className="btn-sky text-white font-semibold px-8 py-2.5 rounded-xl inline-block">
              查看实时结果
            </Link>
          </div>
        </MacWindow>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-b from-meet-50 via-white to-white -z-10" aria-hidden="true" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 封面图 */}
        {activity.imageUrl && (
          <div className="mb-6 rounded-3xl overflow-hidden border border-meet-100 anim-fade-up">
            <img src={activity.imageUrl} alt={activity.title} className="w-full h-56 sm:h-72 object-cover" />
          </div>
        )}

        {/* 活动信息 */}
        <MacWindow className="mb-6 anim-fade-up">
          <div className="p-6 sm:p-8">
            <h1 className="font-display text-2xl sm:text-3xl text-meet-800 mb-2">{activity.title}</h1>
            {activity.description && <p className="text-meet-600/70 mb-4">{activity.description}</p>}

            {/* 信息标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1.5 text-sm text-meet-600 bg-meet-50 px-3 py-1.5 rounded-full">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{activity.creatorName}</span>
              </div>
              {activity.category && (
                <div className="flex items-center gap-1.5 text-sm text-meet-600 bg-meet-50 px-3 py-1.5 rounded-full">
                  <span>{categoryLabel(activity.category)}</span>
                </div>
              )}
              {activity.status && (
                <div className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full ${
                  activity.status === "open" ? "bg-green-50 text-green-600" : "bg-meet-50 text-meet-500"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    activity.status === "open" ? "bg-green-500 animate-pulse" : "bg-meet-400"
                  }`} />
                  <span>{statusLabel(activity.status)}</span>
                </div>
              )}
              {activity.feeAmount && (
                <div className="flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>人均 {activity.feeAmount.toFixed(2)} 元</span>
                </div>
              )}
              {activity.locationName && (
                <div className="flex items-center gap-1.5 text-sm text-meet-600 bg-meet-50 px-3 py-1.5 rounded-full">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{activity.locationName}</span>
                </div>
              )}
              {activity.deadline && (
                <div className="flex items-center gap-1.5 text-sm text-meet-600 bg-meet-50 px-3 py-1.5 rounded-full">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>截止 {new Date(activity.deadline).toLocaleString("zh-CN")}</span>
                </div>
              )}
            </div>
          </div>
        </MacWindow>

        {/* 活动主地点地图 */}
        {activity.locationLat && activity.locationLng && (
          <div className="mb-6 anim-fade-up" style={{ animationDelay: "0.08s" }}>
            <div className="bg-white rounded-3xl p-6 border border-meet-100">
              <h2 className="font-display text-lg text-meet-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-meet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                活动地点
                {activity.locationName && <span className="text-base font-normal text-meet-600"> - {activity.locationName}</span>}
              </h2>
              {activity.locationAddress && (
                <p className="text-sm text-meet-500 mb-3">{activity.locationAddress}</p>
              )}
              <EventMap lat={activity.locationLat} lng={activity.locationLng} name={activity.locationName || ""} />
            </div>
          </div>
        )}

        {/* 费用信息 */}
        {activity.feeAmount && (
          <div className="bg-white rounded-3xl p-6 mb-6 border border-amber-100 anim-fade-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="font-display text-lg text-amber-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              费用
            </h2>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-amber-600">{activity.feeAmount.toFixed(2)}</span>
              <span className="text-amber-500">元 / 人</span>
            </div>
            {activity.feeDescription && (
              <p className="text-sm text-amber-600/70 mt-1">{activity.feeDescription}</p>
            )}
            {activity.feeDeadline && (
              <p className="text-xs text-amber-500 mt-2">
                缴费截止：{new Date(activity.feeDeadline).toLocaleString("zh-CN")}
              </p>
            )}
          </div>
        )}

        {/* 姓名 */}
        <div className="bg-white rounded-3xl p-6 mb-6 border border-meet-100 anim-fade-up" style={{ animationDelay: "0.12s" }}>
          <label className="block text-sm font-semibold text-meet-800 mb-1.5">你的称呼 *</label>
          <input
            type="text"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="输入你的名字"
            className="mac-input w-full px-4 py-3"
          />
        </div>

        {/* 时间选项 */}
        {activity.timeOptions.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 mb-6 border border-meet-100 anim-fade-up" style={{ animationDelay: "0.15s" }}>
            <h2 className="font-display text-xl text-meet-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-meet-400 to-meet-600 flex items-center justify-center shadow-md shadow-meet-200/40">
                <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </span>
              选择时间
              {activity.voteType === "multiple" && <span className="text-xs font-normal text-meet-500 bg-meet-50 px-2 py-0.5 rounded-full">可多选</span>}
            </h2>
            <div className="space-y-3">
              {activity.timeOptions.map((opt) => {
                const isSelected = selectedTimes.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleTime(opt.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-meet-400 bg-gradient-to-r from-meet-50 to-white shadow-md shadow-meet-100/50"
                        : "border-meet-100 bg-white/60 hover:border-meet-200 hover:bg-white"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? "border-meet-500 bg-meet-500" : "border-meet-300 bg-white"
                    }`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white anim-pop" />}
                    </span>
                    <span className="font-medium text-meet-800 flex-1">{opt.label}</span>
                    {opt._count.votes > 0 && (
                      <span className="text-xs text-meet-500 bg-meet-50 px-2 py-0.5 rounded-full">{opt._count.votes} 票</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 地点选项 */}
        {activity.locationOptions.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 mb-6 border border-meet-100 anim-fade-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="font-display text-xl text-meet-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-meet-300 to-meet-500 flex items-center justify-center shadow-md shadow-meet-200/40">
                <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
              选择地点
            </h2>
            <div className="space-y-3">
              {activity.locationOptions.map((opt) => {
                const isSelected = selectedLocations.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleLocation(opt.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-meet-400 bg-gradient-to-r from-meet-50 to-white shadow-md shadow-meet-100/50"
                        : "border-meet-100 bg-white/60 hover:border-meet-200 hover:bg-white"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? "border-meet-500 bg-meet-500" : "border-meet-300 bg-white"
                    }`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white anim-pop" />}
                    </span>
                    <span className="font-medium text-meet-800">{opt.name}</span>
                    {opt.address && <span className="text-sm text-meet-400/70 flex-1 truncate">- {opt.address}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 自定义字段 */}
        {activity.customFields.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 mb-6 border border-meet-100 anim-fade-up" style={{ animationDelay: "0.25s" }}>
            <h2 className="font-display text-xl text-meet-800 mb-4">补充信息</h2>
            <div className="space-y-4">
              {activity.customFields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-semibold text-meet-800 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-meet-400 ml-1">*</span>}
                  </label>
                  {field.fieldType === "text" && (
                    <input
                      type="text"
                      value={customData[field.id] || ""}
                      onChange={(e) => setCustomData({ ...customData, [field.id]: e.target.value })}
                      placeholder={field.placeholder || ""}
                      className="mac-input w-full px-4 py-2.5"
                    />
                  )}
                  {field.fieldType === "number" && (
                    <input
                      type="number"
                      value={customData[field.id] || ""}
                      onChange={(e) => setCustomData({ ...customData, [field.id]: e.target.value })}
                      placeholder={field.placeholder || ""}
                      className="mac-input w-full px-4 py-2.5"
                    />
                  )}
                  {(field.fieldType === "select" || field.fieldType === "multiSelect") && field.options && (
                    <select
                      value={customData[field.id] || ""}
                      onChange={(e) => setCustomData({ ...customData, [field.id]: e.target.value })}
                      className="mac-input w-full px-4 py-2.5"
                    >
                      <option value="">{field.placeholder || "请选择"}</option>
                      {field.options.split(",").map((opt) => (
                        <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-500 text-sm anim-fade-in">
            {error}
          </div>
        )}

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full btn-sun text-white font-bold py-4 rounded-2xl text-lg mb-6 disabled:opacity-60"
        >
          {submitting ? "提交中" : "提交投票"}
        </button>

        {/* 提议区 */}
        {activity.allowSuggestions && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-meet-100 anim-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-meet-800">大家的提议</h2>
              <button
                onClick={() => setShowSuggestForm(!showSuggestForm)}
                className="text-sm text-meet-600 hover:text-meet-800 font-semibold bg-white/70 px-4 py-2 rounded-xl border border-meet-100 hover:bg-white transition"
              >
                {showSuggestForm ? "取消" : "+ 提议新选项"}
              </button>
            </div>

            {showSuggestForm && (
              <div className="mb-4 p-4 bg-white/70 rounded-2xl border border-meet-100 anim-fade-in">
                <select
                  value={suggestionType}
                  onChange={(e) => setSuggestionType(e.target.value)}
                  className="mac-input w-full px-3 py-2 text-sm mb-2"
                >
                  <option value="time">提议新时间</option>
                  <option value="location">提议新地点</option>
                  <option value="other">其他建议</option>
                </select>
                <textarea
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder="说说你的建议"
                  rows={2}
                  className="mac-input w-full px-3 py-2 text-sm mb-2 resize-none"
                />
                <button
                  onClick={handleSuggest}
                  disabled={suggesting || !suggestionText.trim()}
                  className="btn-sky text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {suggesting ? "提交中" : "提交提议"}
                </button>
              </div>
            )}

            {activity.suggestions.length === 0 ? (
              <p className="text-sm text-meet-400">还没有提议，来当第一个吧。</p>
            ) : (
              <div className="space-y-2">
                {activity.suggestions.map((s) => (
                  <div key={s.id} className="p-3.5 bg-white/70 rounded-2xl border border-meet-100">
                    <p className="text-sm text-meet-800">{s.content}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-meet-500">
                      <span>by {s.authorName}</span>
                      <span className="bg-meet-50 px-2 py-0.5 rounded-full">
                        {s.type === "time" ? "时间" : s.type === "location" ? "地点" : "其他"}
                      </span>
                      <span>{s._count.votes} 票</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const categoryLabel = (cat: string) => {
  const labels: Record<string, string> = {
    social: "社交聚会", dinner: "聚餐", sport: "运动",
    travel: "旅行", workshop: "工作坊", other: "其他",
  };
  return labels[cat] || cat;
};

const statusLabel = (st: string) => {
  const labels: Record<string, string> = { open: "进行中", closed: "已截止", cancelled: "已取消" };
  return labels[st] || st;
};