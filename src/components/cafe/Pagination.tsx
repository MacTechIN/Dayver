import Link from "next/link";

export function Pagination({ page, total, size, hrefFor }: { page: number; total: number; size: number; hrefFor: (p: number) => string }) {
  const pages = Math.max(1, Math.ceil(total / size));
  if (pages <= 1) return null;
  const start = Math.max(1, Math.min(page - 4, pages - 9));
  const items = Array.from({ length: Math.min(10, pages - start + 1) }, (_, i) => start + i);
  return (
    <nav aria-label="페이지" className="flex items-center justify-center gap-1 py-5 text-[13px]">
      {page > 1 && <Link href={hrefFor(page - 1)} className="px-2 py-1 text-dv-text-3" aria-label="이전 페이지">‹</Link>}
      {items.map((p) => (
        <Link key={p} href={hrefFor(p)} aria-current={p === page ? "page" : undefined} className={`w-8 h-8 grid place-items-center rounded ${p === page ? "bg-dv-text text-white font-bold" : "hover:bg-dv-bg-2"}`}>{p}</Link>
      ))}
      {page < pages && <Link href={hrefFor(page + 1)} className="px-2 py-1 text-dv-text-3" aria-label="다음 페이지">›</Link>}
    </nav>
  );
}
