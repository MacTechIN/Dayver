"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * 보기 설정 (네이버 푸터 footer.view_setting.view_style / font_size 재해석).
 * 선택 즉시 /api/cookie/theme|font 에 저장하고 <html data-theme/data-font> 를 갱신한다.
 */
export function ViewSettings({ theme, font, compact = false }: { theme: "light" | "dark"; font: "small" | "normal" | "large"; compact?: boolean }) {
  const router = useRouter();
  const [t, setT] = useState(theme);
  const [f, setF] = useState(font);
  const [busy, setBusy] = useState(false);

  const save = async (kind: "theme" | "font", value: string) => {
    setBusy(true);
    try {
      await fetch(`/api/cookie/${kind}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [kind]: value }) });
      document.documentElement.dataset[kind] = value;
      if (kind === "theme") setT(value as typeof t); else setF(value as typeof f);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const btn = (active: boolean) => `px-2.5 py-1 rounded border text-[12px] ${active ? "border-dv-green text-dv-green font-bold" : "border-dv-border text-dv-text-2"}`;
  return (
    <div className={`flex items-center gap-4 ${compact ? "" : "text-[13px]"}`} aria-label="보기 설정" aria-busy={busy}>
      <div className="flex items-center gap-1.5">
        <span className="text-dv-text-3">화면</span>
        <button type="button" data-clk="footer.view_setting.view_style" aria-pressed={t === "light"} onClick={() => save("theme", "light")} className={btn(t === "light")}>라이트</button>
        <button type="button" data-clk="footer.view_setting.view_style" aria-pressed={t === "dark"} onClick={() => save("theme", "dark")} className={btn(t === "dark")}>다크</button>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-dv-text-3">글꼴</span>
        {(["small", "normal", "large"] as const).map((v) => (
          <button key={v} type="button" data-clk="footer.view_setting.font_size" aria-pressed={f === v} onClick={() => save("font", v)} className={btn(f === v)}>
            {v === "small" ? "작게" : v === "normal" ? "보통" : "크게"}
          </button>
        ))}
      </div>
    </div>
  );
}
