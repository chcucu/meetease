"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import MacWindow from "@/components/MacWindow";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

type CustomField = {
  label: string;
  fieldType: string;
  required: boolean;
  options: string;
  placeholder: string;
};

type TimeOption = { label: string; startTime: string; endTime: string };
type LocationOption = { name: string; address: string; lat: string; lng: string };

const stepTitles = ["基础信息", "时间与地点", "收集字段", "预览发布"];

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    creatorName: "",
    voteType: "single",
    allowSuggestions: true,
    imageUrl: "",
    feeAmount: "",
    feeDescription: "",
    feeDeadline: "",
    deadline: "",
    category: "social",
    locationName: "",
    locationAddress: "",
    locationLat: null as number | null,
    locationLng: null as number | null,
  });

  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [timeOptions, setTimeOptions] = useState<TimeOption[]>([]);
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [imagePreview, setImagePreview] = useState(false);

  const addField = () => {
    setCustomFields([...customFields, { label: "", fieldType: "text", required: false, options: "", placeholder: "" }]);
  };
  const updateField = (i: number, data: Partial<CustomField>) => {
    const updated = [...customFields];
    updated[i] = { ...updated[i], ...data };
    setCustomFields(updated);
  };
  const removeField = (i: number) => setCustomFields(customFields.filter((_, idx) => idx !== i));

  const addTime = () => setTimeOptions([...timeOptions, { label: "", startTime: "", endTime: "" }]);
  const updateTime = (i: number, data: Partial<TimeOption>) => {
    const updated = [...timeOptions];
    updated[i] = { ...updated[i], ...data };
    setTimeOptions(updated);
  };
  const removeTime = (i: number) => setTimeOptions(timeOptions.filter((_, idx) => idx !== i));

  const addLocation = () => setLocationOptions([...locationOptions, { name: "", address: "", lat: "", lng: "" }]);
  const updateLocation = (i: number, data: Partial<LocationOption>) => {
    const updated = [...locationOptions];
    updated[i] = { ...updated[i], ...data };
    setLocationOptions(updated);
  };
  const removeLocation = (i: number) => setLocationOptions(locationOptions.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("请填写活动标题");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/activities/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          feeAmount: form.feeAmount ? parseFloat(form.feeAmount) : null,
          feeDeadline: form.feeDeadline || null,
          deadline: form.deadline || null,
          category: form.category || "other",
          customFields: customFields.filter((f) => f.label.trim()),
          timeOptions: timeOptions.filter((t) => t.label.trim()),
          locationOptions: locationOptions.filter((l) => l.name.trim()),
        }),
      });
      const data = await res.json();
      if (data.success) {
        const codes = JSON.parse(localStorage.getItem("meet_activities") || "[]");
        if (!codes.includes(data.activity.shareCode)) {
          codes.unshift(data.activity.shareCode);
          localStorage.setItem("meet_activities", JSON.stringify(codes.slice(0, 50)));
        }
        router.push(`/event/${data.activity.shareCode}?created=true`);
      } else {
        setError(data.error || "创建失败，请重试");
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-b from-meet-50 to-white -z-10" aria-hidden="true" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl art-title">创建你的聚会</h1>
          <p className="mt-2 text-meet-700/70">支持图片、地图选点、费用管理，一步到位</p>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {stepTitles.map((t, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <div key={t} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      active
                        ? "bg-gradient-to-br from-meet-gold-300 to-meet-gold-500 text-white shadow-lg shadow-meet-gold-300/50 scale-110"
                        : done
                        ? "bg-gradient-to-br from-meet-400 to-meet-600 text-white"
                        : "bg-white/70 text-meet-400 border border-meet-200"
                    }`}
                  >
                    {done ? "✓" : n}
                  </div>
                  <span className={`text-sm hidden sm:inline ${active ? "text-meet-800 font-semibold" : "text-meet-500"}`}>
                    {t}
                  </span>
                </div>
                {i < stepTitles.length - 1 && (
                  <div className={`w-8 h-0.5 rounded ${n < step ? "bg-meet-400" : "bg-meet-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        <MacWindow title={`创建活动 · ${stepTitles[step - 1]}`} className="anim-pop">
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* ===== 第 1 步：基础信息 ===== */}
            {step === 1 && (
              <div className="space-y-5 anim-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-meet-800 mb-1.5">活动标题 *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mac-input w-full px-4 py-3"
                    placeholder="例如：周末海边烧烤局"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-meet-800 mb-1.5">活动描述</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="mac-input w-full px-4 py-3 resize-none"
                    placeholder="简单介绍一下你的活动吧..."
                  />
                </div>

                {/* 活动封面图片 */}
                <div>
                  <label className="block text-sm font-semibold text-meet-800 mb-1.5">活动封面图片</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.imageUrl}
                      onChange={(e) => {
                        setForm({ ...form, imageUrl: e.target.value });
                        setImagePreview(!!e.target.value);
                      }}
                      placeholder="输入图片 URL（可选）"
                      className="mac-input w-full px-4 py-3"
                    />
                  </div>
                  {imagePreview && form.imageUrl && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-meet-100">
                      <img
                        src={form.imageUrl}
                        alt="封面预览"
                        className="w-full h-48 object-cover"
                        onError={() => setImagePreview(false)}
                      />
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-meet-800 mb-1.5">你的称呼</label>
                    <input
                      type="text"
                      value={form.creatorName}
                      onChange={(e) => setForm({ ...form, creatorName: e.target.value })}
                      className="mac-input w-full px-4 py-3"
                      placeholder="组织者"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-meet-800 mb-1.5">投票方式</label>
                    <select
                      value={form.voteType}
                      onChange={(e) => setForm({ ...form, voteType: e.target.value })}
                      className="mac-input w-full px-4 py-3"
                    >
                      <option value="single">单选（每人一票）</option>
                      <option value="multiple">多选（可投多项）</option>
                    </select>
                  </div>
                </div>

                {/* 分类与截止 */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-meet-800 mb-1.5">活动分类</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="mac-input w-full px-4 py-3"
                    >
                      <option value="social">社交聚会</option>
                      <option value="dinner">聚餐</option>
                      <option value="sport">运动</option>
                      <option value="travel">旅行</option>
                      <option value="workshop">工作坊</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-meet-800 mb-1.5">投票截止时间</label>
                    <input
                      type="datetime-local"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      className="mac-input w-full px-4 py-3"
                    />
                  </div>
                </div>

                {/* 费用设置 */}
                <div className="bg-meet-50/50 rounded-2xl p-5 border border-meet-100">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-meet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-display text-lg text-meet-800">费用管理（可选）</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-meet-700 mb-1">人均费用 (元)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.feeAmount}
                        onChange={(e) => setForm({ ...form, feeAmount: e.target.value })}
                        className="mac-input w-full px-3 py-2 text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-meet-700 mb-1">缴费截止</label>
                      <input
                        type="datetime-local"
                        value={form.feeDeadline}
                        onChange={(e) => setForm({ ...form, feeDeadline: e.target.value })}
                        className="mac-input w-full px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-meet-700 mb-1">费用说明</label>
                    <input
                      type="text"
                      value={form.feeDescription}
                      onChange={(e) => setForm({ ...form, feeDescription: e.target.value })}
                      className="mac-input w-full px-3 py-2 text-sm"
                      placeholder="例如：包含食材和饮料"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl bg-meet-gold-50 border border-meet-gold-200 hover:bg-meet-gold-100 transition">
                  <input
                    type="checkbox"
                    checked={form.allowSuggestions}
                    onChange={(e) => setForm({ ...form, allowSuggestions: e.target.checked })}
                    className="w-5 h-5 rounded-md accent-meet-gold-500"
                  />
                  <span className="text-sm text-meet-800">
                    允许参与者提议新选项 <span className="text-meet-gold-600 font-medium">（推荐）</span>
                  </span>
                </label>
              </div>
            )}

            {/* ===== 第 2 步：时间、地点与地图 ===== */}
            {step === 2 && (
              <div className="space-y-8 anim-fade-in">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-meet-400 to-meet-600 flex items-center justify-center shadow-md shadow-meet-300/40">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </span>
                    <h3 className="font-display text-xl text-meet-800">时间选项</h3>
                  </div>
                  {timeOptions.length === 0 && (
                    <p className="text-sm text-meet-500 mb-3">还没有时间选项，添加几个候选时间吧</p>
                  )}
                  <div className="space-y-3">
                    {timeOptions.map((t, i) => (
                      <div key={i} className="flex gap-3 items-start p-3 bg-white/70 rounded-2xl border border-meet-100">
                        <div className="flex-1 grid sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={t.label}
                            onChange={(e) => updateTime(i, { label: e.target.value })}
                            placeholder="例如：周六 17:00"
                            className="mac-input px-3 py-2 text-sm"
                          />
                          <input
                            type="datetime-local"
                            value={t.startTime}
                            onChange={(e) => updateTime(i, { startTime: e.target.value })}
                            className="mac-input px-3 py-2 text-sm"
                          />
                          <input
                            type="datetime-local"
                            value={t.endTime}
                            onChange={(e) => updateTime(i, { endTime: e.target.value })}
                            className="mac-input px-3 py-2 text-sm"
                          />
                        </div>
                        <button onClick={() => removeTime(i)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addTime} className="mt-3 text-sm text-meet-600 hover:text-meet-800 font-medium flex items-center gap-1.5 group">
                    <span className="w-6 h-6 rounded-lg bg-meet-100 group-hover:bg-meet-200 flex items-center justify-center transition">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    </span>
                    添加时间选项
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-meet-gold-300 to-meet-gold-500 flex items-center justify-center shadow-md shadow-meet-gold-300/40">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </span>
                    <h3 className="font-display text-xl text-meet-800">备选地点</h3>
                  </div>
                  {locationOptions.length === 0 && (
                    <p className="text-sm text-meet-500 mb-3">还没有备选地点，添加几个吧</p>
                  )}
                  <div className="space-y-3">
                    {locationOptions.map((l, i) => (
                      <div key={i} className="flex gap-3 items-start p-3 bg-white/70 rounded-2xl border border-meet-100">
                        <div className="flex-1 grid sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={l.name}
                            onChange={(e) => updateLocation(i, { name: e.target.value })}
                            placeholder="地点名称"
                            className="mac-input px-3 py-2 text-sm"
                          />
                          <input
                            type="text"
                            value={l.address}
                            onChange={(e) => updateLocation(i, { address: e.target.value })}
                            placeholder="详细地址"
                            className="mac-input px-3 py-2 text-sm"
                          />
                        </div>
                        <button onClick={() => removeLocation(i)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addLocation} className="mt-3 text-sm text-meet-600 hover:text-meet-800 font-medium flex items-center gap-1.5 group">
                    <span className="w-6 h-6 rounded-lg bg-meet-100 group-hover:bg-meet-200 flex items-center justify-center transition">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    </span>
                    添加备选地点
                  </button>
                </div>

                {/* 活动主地点 - 地图选点 */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-meet-500 to-meet-700 flex items-center justify-center shadow-md shadow-meet-400/40">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </span>
                    <h3 className="font-display text-xl text-meet-800">活动主地点（地图选点）</h3>
                  </div>
                  <p className="text-sm text-meet-500 mb-3">在地图上点击或拖动标记选择活动举办地点（可选）</p>
                  <LocationPicker
                    lat={form.locationLat}
                    lng={form.locationLng}
                    name={form.locationName}
                    address={form.locationAddress}
                    onLatLngChange={(lat, lng) => setForm({ ...form, locationLat: lat, locationLng: lng })}
                    onNameChange={(name) => setForm({ ...form, locationName: name })}
                    onAddressChange={(address) => setForm({ ...form, locationAddress: address })}
                  />
                </div>
              </div>
            )}

            {/* ===== 第 3 步：收集字段 ===== */}
            {step === 3 && (
              <div className="anim-fade-in">
                <p className="text-sm text-meet-500 mb-6">添加自定义字段，收集参与者的额外信息（可选）。</p>

                {customFields.length === 0 && (
                  <div className="text-center py-12 bg-white/60 rounded-2xl border-2 border-dashed border-meet-200 mb-4">
                    <svg className="w-12 h-12 text-meet-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p className="text-meet-500 text-sm">还没有自定义字段，点击下方按钮添加</p>
                  </div>
                )}

                <div className="space-y-4">
                  {customFields.map((field, i) => (
                    <div key={i} className="p-4 bg-white/70 rounded-2xl border border-meet-100 anim-fade-in">
                      <div className="flex gap-2 items-start mb-3">
                        <div className="flex-1 grid sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(i, { label: e.target.value })}
                            placeholder="字段名称（例如：饮食偏好）"
                            className="mac-input px-3 py-2 text-sm"
                          />
                          <select
                            value={field.fieldType}
                            onChange={(e) => updateField(i, { fieldType: e.target.value })}
                            className="mac-input px-3 py-2 text-sm"
                          >
                            <option value="text">文本</option>
                            <option value="select">单选</option>
                            <option value="multiSelect">多选</option>
                            <option value="number">数字</option>
                          </select>
                        </div>
                        <button onClick={() => removeField(i)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={field.placeholder}
                          onChange={(e) => updateField(i, { placeholder: e.target.value })}
                          placeholder="占位提示文字"
                          className="mac-input px-3 py-2 text-sm"
                        />
                        {(field.fieldType === "select" || field.fieldType === "multiSelect") && (
                          <input
                            type="text"
                            value={field.options}
                            onChange={(e) => updateField(i, { options: e.target.value })}
                            placeholder="选项（用逗号分隔）"
                            className="mac-input px-3 py-2 text-sm"
                          />
                        )}
                        <label className="flex items-center gap-2 text-sm text-meet-700 px-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(i, { required: e.target.checked })}
                            className="w-4 h-4 rounded accent-meet-500"
                          />
                          必填
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={addField} className="mt-4 text-sm text-meet-600 hover:text-meet-800 font-medium flex items-center gap-1.5 group">
                  <span className="w-6 h-6 rounded-lg bg-meet-100 group-hover:bg-meet-200 flex items-center justify-center transition">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  </span>
                  添加自定义字段
                </button>
              </div>
            )}

            {/* ===== 第 4 步：预览发布 ===== */}
            {step === 4 && (
              <div className="anim-fade-in">
                <div className="space-y-4">
                  {/* 封面图 */}
                  {form.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-meet-100">
                      <img src={form.imageUrl} alt="封面" className="w-full h-48 object-cover" />
                    </div>
                  )}

                  <div className="p-5 bg-gradient-to-br from-meet-50 to-meet-gold-50 rounded-2xl border border-meet-100">
                    <h3 className="font-display text-xl text-meet-800 mb-1">{form.title || "未命名活动"}</h3>
                    <p className="text-sm text-meet-700/70">{form.description || "暂无描述"}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-meet-600">
                      <span className="bg-white/80 px-2.5 py-1 rounded-full">发起人：{form.creatorName || "组织者"}</span>
                      <span className="bg-white/80 px-2.5 py-1 rounded-full">{form.voteType === "single" ? "单选" : "多选"}</span>
                      <span className="bg-white/80 px-2.5 py-1 rounded-full">{form.allowSuggestions ? "允许提议" : "不允许提议"}</span>
                    </div>
                  </div>

                  {/* 费用预览 */}
                  {form.feeAmount && (
                    <div className="p-4 bg-meet-50/50 rounded-2xl border border-meet-100">
                      <div className="flex items-center gap-2 text-sm text-meet-700 mb-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">人均费用：{parseFloat(form.feeAmount).toFixed(2)} 元</span>
                      </div>
                      {form.feeDescription && <p className="text-xs text-meet-500">{form.feeDescription}</p>}
                    </div>
                  )}

                  {/* 主地点预览 */}
                  {form.locationName && (
                    <div className="p-4 bg-meet-50/50 rounded-2xl border border-meet-100">
                      <div className="text-sm text-meet-700">
                        <span className="font-semibold">活动地点：</span>
                        {form.locationName}
                        {form.locationAddress && <span className="text-meet-500"> - {form.locationAddress}</span>}
                      </div>
                      {form.locationLat && form.locationLng && (
                        <div className="text-xs text-meet-400 mt-1">
                          坐标：{form.locationLat.toFixed(4)}, {form.locationLng.toFixed(4)}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/70 rounded-2xl border border-meet-100">
                      <h4 className="font-medium text-sm text-meet-700 mb-2 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-meet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        时间选项（{timeOptions.filter((t) => t.label).length}）
                      </h4>
                      {timeOptions.filter((t) => t.label).length === 0 ? (
                        <p className="text-xs text-meet-400">无</p>
                      ) : (
                        <ul className="text-sm text-meet-700 space-y-1">
                          {timeOptions.filter((t) => t.label).map((t, i) => <li key={i}>{t.label}</li>)}
                        </ul>
                      )}
                    </div>
                    <div className="p-4 bg-white/70 rounded-2xl border border-meet-100">
                      <h4 className="font-medium text-sm text-meet-700 mb-2 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-meet-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        备选地点（{locationOptions.filter((l) => l.name).length}）
                      </h4>
                      {locationOptions.filter((l) => l.name).length === 0 ? (
                        <p className="text-xs text-meet-400">无</p>
                      ) : (
                        <ul className="text-sm text-meet-700 space-y-1">
                          {locationOptions.filter((l) => l.name).map((l, i) => <li key={i}>{l.name}</li>)}
                        </ul>
                      )}
                    </div>
                  </div>

                  {customFields.filter((f) => f.label).length > 0 && (
                    <div className="p-4 bg-white/70 rounded-2xl border border-meet-100">
                      <h4 className="font-medium text-sm text-meet-700 mb-2">自定义字段（{customFields.filter((f) => f.label).length}）</h4>
                      <ul className="text-sm text-meet-700 space-y-1">
                        {customFields.filter((f) => f.label).map((f, i) => (
                          <li key={i}>{f.label}（{f.fieldType === "text" ? "文本" : f.fieldType === "select" ? "单选" : f.fieldType === "multiSelect" ? "多选" : "数字"}）{f.required ? " *必填" : ""}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {loading ? (
                  <div className="mt-6 flex items-center justify-center gap-3 text-meet-600 py-3">
                    <div className="w-6 h-6 border-2 border-meet-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">正在创建你的聚会...</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="mt-6 w-full btn-sun text-white font-bold py-3.5 rounded-2xl text-lg"
                  >
                    发布活动
                  </button>
                )}
              </div>
            )}

            {/* 导航按钮 */}
            {step < 4 && (
              <div className="flex justify-between mt-8 pt-6 border-t border-meet-100">
                <button
                  onClick={() => setStep(Math.max(1, step - 1))}
                  className={`px-6 py-2.5 rounded-xl text-sm font-medium transition ${
                    step === 1 ? "text-meet-300 cursor-not-allowed" : "text-meet-700 hover:bg-white/80"
                  }`}
                  disabled={step === 1}
                >
                  ← 上一步
                </button>
                <button
                  onClick={() => setStep(Math.min(4, step + 1))}
                  className="btn-sky text-white px-8 py-2.5 rounded-xl text-sm font-semibold"
                >
                  下一步 →
                </button>
              </div>
            )}
          </div>
        </MacWindow>
      </div>
    </div>
  );
}