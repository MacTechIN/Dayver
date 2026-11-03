import Link from "next/link";
import type { Cafe } from "@/lib/cafe";

export function CafeAvatar({ cafe, size = 44 }: { cafe: Pick<Cafe, "name" | "color">; size?: number }) {
  return (
    <span aria-hidden className="inline-grid place-items-center rounded-xl text-white font-black shrink-0" style={{ width: size, height: size, background: cafe.color, fontSize: size * 0.42 }}>
      {cafe.name.slice(0, 1)}
    </span>
  );
}

/** 카페 카드 (주제별/랭킹/검색 결과) */
export function CafeCard({ cafe, rank, clk = "cafe_list.card" }: { cafe: Cafe; rank?: number; clk?: string }) {
  return (
    <Link href={`/cafe/${cafe.slug}`} data-clk={clk} className="flex items-center gap-3 p-3 rounded-lg hover:bg-dv-bg-2">
      {rank !== undefined && <b className={`w-6 text-center text-[15px] ${rank <= 3 ? "text-dv-green" : "text-dv-text-3"}`}>{rank}</b>}
      <CafeAvatar cafe={cafe} />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-[14px] dv-ellipsis">
          {cafe.name}
          {!cafe.is_public && <span className="ml-1 text-[11px] text-dv-text-3 font-normal">🔒 비공개</span>}
        </p>
        <p className="text-[12px] text-dv-text-3 dv-ellipsis">{cafe.description}</p>
        <p className="text-[12px] text-dv-text-3">
          <span className="text-dv-text-2">{cafe.category}</span>{cafe.region ? ` · ${cafe.region}` : ""} · 멤버 {cafe.member_count.toLocaleString()} · 글 {cafe.post_count}
        </p>
      </div>
    </Link>
  );
}
