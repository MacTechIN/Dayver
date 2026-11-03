import Link from "next/link";
import { readViewSettings } from "@/lib/settings";
import { ViewSettings } from "./ViewSettings";

/** 네이버 PC 푸터(공지사항 / Partners / Developers / 정책 / 보기 설정) 재해석 */
export async function Footer({ compact = false }: { compact?: boolean }) {
  const view = await readViewSettings();
  if (compact) {
    return (
      <footer role="contentinfo" className="mt-10 border-t border-dv-border bg-dv-bg-3">
        <div className="dv-container py-6 text-[12px] text-dv-text-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link href="/me">Dayver 이용약관</Link>
          <Link href="/me" className="font-bold text-dv-text-2">개인정보처리방침</Link>
          <Link href="/me">고객센터</Link>
          <span className="ml-auto"><b className="text-dv-text-2">ⓓ DAYVER Corp.</b></span>
        </div>
      </footer>
    );
  }
  return (
    <footer role="contentinfo" className="mt-8 border-t border-dv-border bg-dv-bg-3">
      <div className="dv-container py-8 grid grid-cols-[1fr_1fr_1fr_1.4fr] gap-8 text-[13px]">
        <div>
          <h3 className="font-bold mb-3">공지사항</h3>
          <ul className="space-y-1.5 text-dv-text-2">
            <li><Link href="/search?query=공지">서비스 전체보기</Link></li>
            <li><Link href="/me">이용안내</Link></li>
            <li><Link href="/search?query=Dayver">기업 사이트</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3">Partners</h3>
          <ul className="space-y-1.5 text-dv-text-2">
            <li><Link href="/shopping">데이버 광고주센터</Link></li>
            <li><Link href="/shopping">스마트스토어센터</Link></li>
            <li><Link href="/cafe">비즈니스 스쿨</Link></li>
            <li><Link href="/blog">데이버 임팩트</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3">Developers</h3>
          <ul className="space-y-1.5 text-dv-text-2">
            <li><Link href="/me">데이버 개발자 센터</Link></li>
            <li><Link href="/me">오픈 API</Link></li>
            <li><Link href="/me">오픈소스</Link></li>
            <li><Link href="/me">데이버 D2</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3">Dayver 정책 및 약관</h3>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-dv-text-2">
            <li><Link href="/me">회사소개</Link></li>
            <li><Link href="/me">인재채용</Link></li>
            <li><Link href="/me">제휴제안</Link></li>
            <li><Link href="/me">이용약관</Link></li>
            <li><Link href="/me" className="font-bold">개인정보처리방침</Link></li>
            <li><Link href="/me">청소년보호정책</Link></li>
            <li><Link href="/me">데이버 정책</Link></li>
            <li><Link href="/me">고객센터</Link></li>
          </ul>
          <p className="mt-4 text-dv-text-3 text-[12px]">ⓓ DAYVER Corp. · 본 사이트는 학습용 재해석 구현입니다.</p>
        </div>
      </div>
      <div className="border-t border-dv-border">
        <div className="dv-container py-3 flex items-center justify-between">
          <span className="text-[13px] text-dv-text-3">보기 설정</span>
          <ViewSettings theme={view.theme} font={view.font} />
        </div>
      </div>
    </footer>
  );
}
