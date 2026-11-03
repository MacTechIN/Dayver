import Link from "next/link";
import type { Forecast, Region } from "@/lib/weather";
import { setRegionAction } from "@/lib/actions/weather";

/** 날씨 아이콘 (이모지 폰트 없이도 렌더되도록 인라인 SVG) */
export function WxIcon({ text, size = 24 }: { text: string; size?: number }) {
  const sun = <circle cx="12" cy="12" r="5" fill="#f2a900" />;
  const cloud = (dx = 0, dy = 0, fill = "#9aa4ae") => <path transform={`translate(${dx} ${dy})`} d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.2 11.3 3.5 3.5 0 0 0 7 18z" fill={fill} />;
  let body: React.ReactNode;
  switch (text) {
    case "맑음": body = <>{sun}<g stroke="#f2a900" strokeWidth="1.6">{[0,45,90,135,180,225,270,315].map((a) => <line key={a} x1="12" y1="2.5" x2="12" y2="5" transform={`rotate(${a} 12 12)`} />)}</g></>; break;
    case "구름조금": body = <><circle cx="9" cy="9" r="4.5" fill="#f2a900" />{cloud(2, 1, "#c3cad1")}</>; break;
    case "구름많음": body = <>{cloud(-1, -1, "#c3cad1")}{cloud(2, 2, "#9aa4ae")}</>; break;
    case "흐림": body = <>{cloud(0, 0, "#8b949e")}</>; break;
    case "비": body = <>{cloud(0, -3, "#8b949e")}<g stroke="#0068c3" strokeWidth="1.6" strokeLinecap="round"><line x1="9" y1="18" x2="8" y2="22" /><line x1="13" y1="18" x2="12" y2="22" /><line x1="17" y1="18" x2="16" y2="22" /></g></>; break;
    case "눈": body = <>{cloud(0, -3, "#8b949e")}<g fill="#5bb6ff"><circle cx="9" cy="20" r="1.3" /><circle cx="13" cy="21.5" r="1.3" /><circle cx="17" cy="20" r="1.3" /></g></>; break;
    default: body = cloud(0, 0, "#9aa4ae");
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={text} className="inline-block align-middle">{body}</svg>;
}

/** 지역 설정 (네이버 날씨의 '지역 선택' 재해석): 선택 즉시 쿠키 저장 후 해당 지역으로 이동 */
export function RegionPicker({ regions, current }: { regions: Region[]; current: string }) {
  return (
    <form action={setRegionAction} className="flex items-center gap-2" aria-label="지역 설정">
      <label htmlFor="region" className="text-[13px] text-dv-text-2">지역 설정</label>
      <select id="region" name="code" defaultValue={current} className="border border-dv-border rounded px-2 py-1.5 text-[13px] bg-white">
        {regions.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
      </select>
      <button type="submit" className="dv-btn-green px-3 py-1.5 text-[13px]">설정</button>
    </form>
  );
}

export function NowCard({ f }: { f: Forecast }) {
  const n = f.now;
  return (
    <section aria-label="현재 날씨" className="dv-card p-6 flex items-center gap-8">
      <div className="flex items-center gap-4">
        <WxIcon text={n.text} size={88} />
        <div>
          <b className="text-[48px] leading-none">{n.temperature}°</b>
          <p className="text-[16px] mt-1">{n.text} <span className="text-dv-text-3 text-[13px]">· 체감 {n.feels}°</span></p>
          <p className="text-[13px] text-dv-text-2">최저 <b className="text-dv-blue">{n.minTemperature}°</b> / 최고 <b className="text-dv-red">{n.maxTemperature}°</b></p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px] ml-auto">
        <div><dt className="text-dv-text-3">미세먼지</dt><dd className="font-bold text-dv-blue">{n.pm10Legend} <span className="text-dv-text-3 font-normal">{n.pm10}㎍/㎥</span></dd></div>
        <div><dt className="text-dv-text-3">초미세먼지</dt><dd className="font-bold text-dv-blue">{n.pm25Legend} <span className="text-dv-text-3 font-normal">{n.pm25}㎍/㎥</span></dd></div>
        <div><dt className="text-dv-text-3">습도</dt><dd className="font-bold">{n.humidity}%</dd></div>
        <div><dt className="text-dv-text-3">바람</dt><dd className="font-bold">{n.wind}m/s</dd></div>
        <div><dt className="text-dv-text-3">일출</dt><dd className="font-bold">{n.sunrise}</dd></div>
        <div><dt className="text-dv-text-3">일몰</dt><dd className="font-bold">{n.sunset}</dd></div>
      </dl>
    </section>
  );
}

export function HourlyStrip({ f }: { f: Forecast }) {
  return (
    <section aria-label="시간별 예보" className="dv-card p-5 mt-4">
      <h2 className="font-bold text-[15px] mb-3">시간별 예보</h2>
      <ol className="flex overflow-x-auto gap-1 text-center text-[12px]">
        {f.hourly.map((h) => (
          <li key={h.timeText} className="min-w-[52px] shrink-0 py-2 rounded hover:bg-dv-bg-3">
            <span className="block text-dv-text-3">{h.timeText}</span>
            <span className="block my-1"><WxIcon text={h.text} size={26} /></span>
            <b className="block">{h.temperature}°</b>
            <span className={`block ${h.rain >= 60 ? "text-dv-blue font-bold" : "text-dv-text-3"}`}>{h.rain}%</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function WeeklyTable({ f }: { f: Forecast }) {
  return (
    <section aria-label="주간 예보" className="dv-card p-5 mt-4">
      <h2 className="font-bold text-[15px] mb-3">주간 예보</h2>
      <table className="w-full text-[13px] text-center">
        <thead><tr className="text-dv-text-3"><th scope="col" className="py-1 font-normal text-left">날짜</th><th scope="col" className="font-normal">오전</th><th scope="col" className="font-normal">오후</th><th scope="col" className="font-normal">최저 / 최고</th></tr></thead>
        <tbody>
          {f.daily.map((d) => (
            <tr key={d.day} className="border-t border-dv-border-2">
              <th scope="row" className="py-2.5 text-left font-bold">{d.label} <span className="text-dv-text-3 font-normal">{d.day}</span></th>
              <td><WxIcon text={d.amText} size={20} /> {d.amText} <span className="text-dv-blue">{d.amRain}%</span></td>
              <td><WxIcon text={d.pmText} size={20} /> {d.pmText} <span className="text-dv-blue">{d.pmRain}%</span></td>
              <td><b className="text-dv-blue">{d.min}°</b> / <b className="text-dv-red">{d.max}°</b></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function LifeIndexes({ f }: { f: Forecast }) {
  return (
    <section aria-label="생활지수" className="dv-card p-5 mt-4">
      <h2 className="font-bold text-[15px] mb-3">생활지수</h2>
      <ul className="grid grid-cols-4 gap-3">
        {f.life.map((l) => (
          <li key={l.name} className="bg-dv-bg-3 rounded-lg p-3">
            <span className="text-[12px] text-dv-text-3">{l.name}</span>
            <b className="block text-[16px] text-dv-green">{l.level}</b>
            <span className="text-[12px] text-dv-text-2">{l.tip}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RegionList({ regions, current }: { regions: Region[]; current: string }) {
  return (
    <section aria-label="다른 지역" className="dv-card p-4">
      <h2 className="font-bold text-[14px] mb-2">다른 지역 날씨</h2>
      <ul className="grid grid-cols-2 gap-1 text-[13px]">
        {regions.map((r) => (
          <li key={r.code}><Link href={`/weather/${r.code}`} data-clk="weather.region.list" className={`block px-2 py-1 rounded hover:bg-dv-bg-2 dv-ellipsis ${r.code === current ? "text-dv-green font-bold" : "text-dv-text-2"}`}>{r.name}</Link></li>
        ))}
      </ul>
    </section>
  );
}
