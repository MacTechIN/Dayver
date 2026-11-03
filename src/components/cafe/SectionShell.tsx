import { CafeHeader } from "./CafeHeader";
import { Sidebar } from "./Sidebar";
import { RightColumn } from "./RightColumn";

/** 카페 섹션 3컬럼 레이아웃: 사이드바 | 본문 | 우측 */
export function SectionShell({ current, next, children, promo = true }: { current: string; next?: string; children: React.ReactNode; promo?: boolean }) {
  return (
    <>
      <CafeHeader promo={promo} />
      <div className="dv-container flex gap-8 py-6">
        <Sidebar current={current} />
        <main id="content" className="flex-1 min-w-0">{children}</main>
        <RightColumn next={next ?? current} />
      </div>
    </>
  );
}
