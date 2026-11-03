import Link from "next/link";

const PHONES = [
  { label: "쇼핑&페이 구매자 고객센터", number: "1588-0001" },
  { label: "데이버 대표전화", number: "1588-0002" },
  { label: "데이버플러스 멤버십 전용 고객센터", number: "1599-0003" },
];

/** 쇼핑 푸터 (관측된 footer.json 전화 3종 + 약관/입점/파트너센터 링크 재해석) */
export function ShopFooter() {
  return (
    <footer role="contentinfo" className="mt-16 border-t border-dv-border bg-dv-bg-3">
      <div className="dv-container py-8 text-[12px] text-dv-text-2">
        <h2 className="sr-only">하위영역</h2>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          <li><Link href="/me">데이버 이용약관</Link></li>
          <li><Link href="/me">데이버페이 이용약관</Link></li>
          <li><Link href="/me" className="font-bold">개인정보처리방침</Link></li>
          <li><Link href="/me">법적고지 및 주의사항</Link></li>
          <li><Link href="/shopping/my">입점안내</Link></li>
          <li><Link href="/shopping/my">쇼핑윈도 노출안내</Link></li>
          <li><Link href="/shopping/my">쇼핑파트너센터</Link></li>
          <li><Link href="/shopping/my">스마트스토어센터</Link></li>
          <li><Link href="/me">안전거래센터</Link></li>
          <li><Link href="/me">전자금융거래약관</Link></li>
        </ul>
        <ul className="flex gap-8 mt-5">
          {PHONES.map((p) => (
            <li key={p.number}><span className="text-dv-text-3">{p.label}</span> <b className="text-[14px] text-dv-text ml-1">{p.number}</b></li>
          ))}
          <li><a href="mailto:helpcustomer@dayver.com">helpcustomer@dayver.com</a> · <Link href="/me">1:1 문의 바로가기</Link></li>
        </ul>
        <p className="mt-5 text-dv-text-3">
          데이버 쇼핑은 통신판매중개자이며 통신판매의 당사자가 아닙니다. 상품, 거래정보 및 거래에 대한 의무와 책임은 판매자에게 있습니다.
          <br />ⓓ DAYVER Corp. · 본 사이트는 학습용 재해석 구현입니다.
        </p>
      </div>
    </footer>
  );
}
