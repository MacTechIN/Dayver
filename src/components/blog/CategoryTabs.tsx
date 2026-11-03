import Link from "next/link";
import { BLOG_CATEGORIES } from "@/lib/blog-categories";

/** 주제 탭: 전체 · 만화·애니 · 취미 · … */
export function CategoryTabs({ current, base = "/blog/topic" }: { current: string; base?: string }) {
  const items = ["전체", ...BLOG_CATEGORIES];
  return (
    <ul role="tablist" aria-label="주제별 글" className="flex gap-6 border-b border-dv-text text-[14px]">
      {items.map((c) => {
        const active = c === current;
        return (
          <li key={c} role="presentation">
            <Link
              role="tab"
              aria-selected={active}
              href={c === "전체" ? "/blog" : `${base}/${encodeURIComponent(c)}`}
              data-clk={`blog_home.category.${c}`}
              className={`inline-block py-3 ${active ? "text-dv-green font-bold border-b-2 border-dv-green -mb-px" : "text-dv-text-2 hover:text-dv-text"}`}
            >
              {c}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
