import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/common/Footer";
import { Change, LineChart, StockHeader, StockTable } from "@/components/stock/StockParts";
import { getHistory, getIndex, listStocks } from "@/lib/stock";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idx = getIndex((await params).code);
  return { title: idx ? `${idx.name} - DAYVER 증권` : "DAYVER 증권" };
}

export default async function IndexPage({ params }: Props) {
  const { code } = await params;
  const idx = getIndex(code);
  if (!idx) notFound();
  const history = getHistory(idx.code);
  const top = listStocks({ market: idx.code, orderBy: "market_cap", desc: true, limit: 20 });
  const up = idx.change >= 0;
  return (
    <>
      <StockHeader />
      <div className="bg-dv-bg-2">
        <main id="content" className="dv-container py-5">
          <section aria-label="지수 요약" className="dv-card p-6">
            <h1 className="text-[22px] font-black">{idx.name} <span className="text-[13px] text-dv-text-3 font-normal">{idx.code}</span></h1>
            <div className="flex items-end gap-4 mt-2">
              <b className="text-[40px] leading-none">{idx.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
              <Change change={idx.change} rate={idx.change_rate} big />
            </div>
            <div className="mt-5"><LineChart points={history} width={1180} height={260} up={up} detailed /></div>
          </section>
          <section aria-label="구성 종목" className="dv-card p-5 mt-4">
            <h2 className="font-bold text-[16px] mb-2">{idx.name} 시가총액 상위 구성 종목</h2>
            <StockTable items={top} caption={`${idx.name} 구성 종목`} showRank />
          </section>
        </main>
      </div>
      <Footer compact />
    </>
  );
}
