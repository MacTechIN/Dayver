import Link from "next/link";

const PRIMARY = [
  { href: "/cafe", label: "카페홈", icon: "⌂" },
  { href: "/cafe/region", label: "이웃", badge: "Beta", icon: "◎" },
  { href: "/cafe/my", label: "구독", icon: "▤" },
  { href: "/cafe/popular", label: "인기글", badge: "New", icon: "♨" },
  { href: "/me", label: "내소식", icon: "♪" },
  { href: "/mail", label: "채팅", icon: "✉" },
];

const SECONDARY = [
  { href: "/cafe/category/생활", label: "주제별 카페" },
  { href: "/cafe/region", label: "지역별 카페" },
  { href: "/cafe/category/팬카페", label: "인기 팬카페" },
  { href: "/cafe/ranking?tab=rep", label: "대표 카페" },
  { href: "/cafe/ranking", label: "카페 랭킹" },
];

/** 좌측 사이드 내비게이션 (카페홈/이웃/구독/인기글/내소식/채팅 + 주제별/지역별/팬카페/대표/랭킹) */
export function Sidebar({ current }: { current: string }) {
  return (
    <nav aria-label="카페 메뉴" className="w-[210px] shrink-0">
      <ul className="space-y-0.5">
        {PRIMARY.map((m) => {
          const active = current === m.href;
          return (
            <li key={m.href}>
              <Link
                href={m.href}
                data-clk={`cafe_lnb.${m.label}`}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-4 h-11 rounded-lg text-[15px] ${active ? "bg-[#e8f8ee] text-dv-green font-bold" : "hover:bg-dv-bg-2"}`}
              >
                <span aria-hidden className="w-5 text-center">{m.icon}</span>
                {m.label}
                {m.badge && <span className={`text-[10px] ${m.badge === "New" ? "bg-dv-red text-white rounded-full px-1.5" : "text-dv-red italic"}`}>{m.badge}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <ul className="mt-5 pt-5 border-t border-dv-border space-y-0.5 text-[14px] text-dv-text-2">
        {SECONDARY.map((m) => (
          <li key={m.label}>
            <Link href={m.href} data-clk={`cafe_lnb.${m.label}`} className={`block px-4 py-2 rounded hover:bg-dv-bg-2 ${current === m.href ? "text-dv-green font-bold" : ""}`}>{m.label}</Link>
          </li>
        ))}
      </ul>
      <Link href="/cafe/create" className="mt-6 block mx-2 text-center dv-btn-green py-2.5 text-[14px]" data-clk="cafe_lnb.create">카페 만들기</Link>
      <div className="mt-6 mx-2 rounded-2xl bg-[#fff3cd] p-4 text-center text-[13px] text-[#8a6d00] font-bold" aria-label="이벤트 배너">
        촌캉스<br />어디까지 가봤나요?
      </div>
    </nav>
  );
}
