import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/common/Footer";
import { WeatherHeader } from "@/components/weather/WeatherHeader";
import { DEFAULT_REGION, getForecast, listRegions } from "@/lib/weather";
import { WxIcon } from "@/components/weather/WeatherParts";

export const metadata: Metadata = { title: "예보 비교 - DAYVER 날씨" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** 예보 비교: ?r=code1,code2,code3 (최대 3곳) */
export default async function ComparePage({ searchParams }: Props) {
  const sp = await searchParams;
  const regions = listRegions();
  const fromForm = ["c0", "c1", "c2"].map((k) => (typeof sp[k] === "string" ? (sp[k] as string) : "")).filter(Boolean);
  const raw = typeof sp.r === "string" ? sp.r.split(",") : fromForm.length ? fromForm : [DEFAULT_REGION, regions[7]?.code ?? DEFAULT_REGION, regions[11]?.code ?? DEFAULT_REGION];
  const codes = raw.filter((c) => regions.some((r) => r.code === c)).slice(0, 3);
  const forecasts = codes.map((c) => getForecast(c)!).filter(Boolean);
  return (
    <>
      <WeatherHeader active="compare" />
      <div className="bg-dv-bg-2">
        <main id="content" className="dv-container py-5">
          <h1 className="text-[22px] font-black mb-3">예보 비교</h1>
          <form method="get" className="dv-card p-4 flex items-center gap-3 text-[13px] mb-4" aria-label="비교 지역 선택">
            {[0, 1, 2].map((i) => (
              <label key={i} className="flex items-center gap-1">지역 {i + 1}
                <select name={`c${i}`} defaultValue={codes[i] ?? ""} className="border border-dv-border rounded px-2 py-1.5 bg-white">
                  <option value="">선택 안 함</option>
                  {regions.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
                </select>
              </label>
            ))}
            <CompareSubmit />
          </form>
          <div className={`grid gap-4 ${forecasts.length === 1 ? "grid-cols-1" : forecasts.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {forecasts.map((f) => (
              <section key={f.region.code} aria-label={`${f.region.name} 예보`} className="dv-card p-5">
                <h2 className="font-bold text-[16px]"><Link href={`/weather/${f.region.code}`}>{f.region.name}</Link></h2>
                <div className="flex items-center gap-3 mt-3">
                  <WxIcon text={f.now.text} size={56} />
                  <div><b className="text-[32px]">{f.now.temperature}°</b><p className="text-[13px] text-dv-text-2">{f.now.text} · 최저 {f.now.minTemperature}° 최고 {f.now.maxTemperature}°</p></div>
                </div>
                <dl className="grid grid-cols-2 gap-1 text-[12px] mt-3">
                  <div className="flex justify-between"><dt className="text-dv-text-3">미세</dt><dd className="font-bold text-dv-blue">{f.now.pm10Legend}</dd></div>
                  <div className="flex justify-between"><dt className="text-dv-text-3">초미세</dt><dd className="font-bold text-dv-blue">{f.now.pm25Legend}</dd></div>
                  <div className="flex justify-between"><dt className="text-dv-text-3">습도</dt><dd className="font-bold">{f.now.humidity}%</dd></div>
                  <div className="flex justify-between"><dt className="text-dv-text-3">바람</dt><dd className="font-bold">{f.now.wind}m/s</dd></div>
                </dl>
                <table className="w-full text-[12px] mt-4 text-center">
                  <thead><tr className="text-dv-text-3"><th className="font-normal text-left">요일</th><th className="font-normal">오전</th><th className="font-normal">오후</th><th className="font-normal">기온</th></tr></thead>
                  <tbody>{f.daily.map((d) => <tr key={d.day} className="border-t border-dv-border-2"><th scope="row" className="py-1.5 text-left font-bold">{d.label}</th><td><WxIcon text={d.amText} size={16} /> {d.amRain}%</td><td><WxIcon text={d.pmText} size={16} /> {d.pmRain}%</td><td><span className="text-dv-blue">{d.min}°</span>/<span className="text-dv-red">{d.max}°</span></td></tr>)}</tbody>
                </table>
              </section>
            ))}
          </div>
        </main>
      </div>
      <Footer compact />
    </>
  );
}

/** GET 폼은 c0,c1,c2 로 오므로 서버에서 r= 로 합치지 않고 그대로 읽는다 */
function CompareSubmit() {
  return <button type="submit" className="dv-btn-green px-4 py-1.5">비교</button>;
}
