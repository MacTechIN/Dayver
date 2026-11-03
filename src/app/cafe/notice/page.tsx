import type { Metadata } from "next";
import { SectionShell } from "@/components/cafe/SectionShell";
import { all } from "@/lib/db";

export const metadata: Metadata = { title: "공지사항 - DAYVER 카페" };

export default function NoticePage() {
  const notices = all<{ id: number; title: string; created_at: string }>("SELECT id, title, created_at FROM notices ORDER BY created_at DESC");
  return (
    <SectionShell current="/cafe/notice" promo={false}>
      <h1 className="text-[20px] font-bold mb-6">공지사항</h1>
      <ul className="divide-y divide-dv-border-2">
        {notices.map((n) => (
          <li key={n.id} className="py-4 flex justify-between gap-4">
            <span>{n.title}</span>
            <time className="text-dv-text-3 text-[12px] shrink-0">{n.created_at.slice(0, 10)}</time>
          </li>
        ))}
        <li className="py-4 flex justify-between gap-4"><span>[안내] 카페 마켓 거래 시 안전거래 이용 안내</span><time className="text-dv-text-3 text-[12px]">2026-10-20</time></li>
        <li className="py-4 flex justify-between gap-4"><span>[안내] 운영진 권한 체계 개편 안내 (매니저/스태프/멤버)</span><time className="text-dv-text-3 text-[12px]">2026-10-02</time></li>
      </ul>
    </SectionShell>
  );
}
