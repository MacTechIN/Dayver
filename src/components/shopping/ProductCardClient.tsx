"use client";

/** 클라이언트 컴포넌트에서 쓰는 썸네일 색 블록 */
export function Thumb({ name, color, className = "" }: { name: string; color: string; className?: string }) {
  return (
    <div className={`dv-thumb rounded-xl text-[12px] ${className}`} style={{ background: color }} aria-hidden>
      {name.replace(/^\[[^\]]+\]\s*/, "").slice(0, 24)}
    </div>
  );
}
