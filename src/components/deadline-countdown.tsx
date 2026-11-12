"use client";

import { useEffect, useState } from "react";

function remaining(deadline: string, status: string) {
  if (status !== "open") return { text: "已结束", closed: true };
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return { text: "已截止", closed: true };
  const totalMinutes = Math.ceil(ms / 60000);
  if (totalMinutes < 60) return { text: `剩余 ${totalMinutes} 分钟`, closed: false };
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours < 48) {
    return { text: `剩余 ${hours} 小时 ${minutes} 分钟`, closed: false };
  }
  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  return { text: `剩余 ${days} 天 ${restHours} 小时`, closed: false };
}

export function DeadlineCountdown({
  deadline,
  status,
  className = "",
}: {
  deadline: string | null;
  status: string;
  className?: string;
}) {
  const [label, setLabel] = useState(() =>
    deadline ? remaining(deadline, status) : null
  );

  useEffect(() => {
    if (!deadline) return;
    const update = () => setLabel(remaining(deadline, status));
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, [deadline, status]);

  if (!deadline || !label) return null;

  return <span className={`tabular-nums ${className}`}>{label.text}</span>;
}
