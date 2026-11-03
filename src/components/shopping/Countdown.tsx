"use client";

import { useEffect, useState } from "react";

function fmt(ms: number) {
  if (ms <= 0) return "마감";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${h}시간 ${String(m).padStart(2, "0")}분 ${String(sec).padStart(2, "0")}초 남음`;
}

/** 오늘끝딜 남은 시간 (ends_at 'YYYY-MM-DD HH:MM:SS' 로컬) */
export function Countdown({ endsAt }: { endsAt: string }) {
  const target = new Date(endsAt.replace(" ", "T")).getTime();
  // 초기값은 렌더 시점 계산; 서버/클라이언트 시각 차이는 suppressHydrationWarning 으로 흡수하고 1초마다 갱신
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <time dateTime={endsAt.replace(" ", "T")} className="text-[12px] font-bold text-dv-red" suppressHydrationWarning>
      {fmt(target - now)}
    </time>
  );
}
