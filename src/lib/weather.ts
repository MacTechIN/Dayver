import "server-only";
import { all, get } from "./db";
import { rng } from "./seed/index";

export type Region = { code: string; name: string; lat: number; lon: number; sort: number };
export type Hourly = { timeText: string; hour: number; temperature: number; text: string; icon: string; rain: number };
export type Daily = { day: string; label: string; amText: string; amIcon: string; amRain: number; pmText: string; pmIcon: string; pmRain: number; min: number; max: number };
export type WeatherNow = { regionName: string; text: string; icon: string; temperature: number; feels: number; minTemperature: number; maxTemperature: number; pm10: number; pm10Legend: string; pm25: number; pm25Legend: string; humidity: number; wind: number; sunrise: string; sunset: string };
export type LifeIndex = { name: string; level: string; value: number; tip: string };
export type Forecast = { region: Region; now: WeatherNow; hourly: Hourly[]; daily: Daily[]; life: LifeIndex[] };

export const DEFAULT_REGION = "02110000";
export const REGION_COOKIE = "dv_region";
const SKY = [
  { text: "맑음", icon: "☀" }, { text: "구름조금", icon: "🌤" }, { text: "구름많음", icon: "⛅" }, { text: "흐림", icon: "☁" }, { text: "비", icon: "🌧" }, { text: "눈", icon: "❄" },
];

export function listRegions(): Region[] {
  return all<Region>("SELECT * FROM weather_regions ORDER BY sort");
}
export function getRegion(code: string): Region | undefined {
  return get<Region>("SELECT * FROM weather_regions WHERE code = ?", code);
}
export function searchRegions(q: string): Region[] {
  return all<Region>("SELECT * FROM weather_regions WHERE name LIKE ? ORDER BY sort", `%${q}%`);
}

function legend(v: number): string {
  return v <= 30 ? "좋음" : v <= 80 ? "보통" : v <= 150 ? "나쁨" : "매우나쁨";
}
function todayKey(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/** 지역 코드 + 오늘 날짜로 결정되는 의사 예보 */
export function getForecast(code: string): Forecast | undefined {
  const region = getRegion(code);
  if (!region) return undefined;
  const seed = Number(code.slice(0, 6)) + todayKey();
  const r = rng(seed);
  const now = new Date();
  const month = now.getMonth(); // 계절 기준 온도
  const seasonBase = [-2, 1, 7, 13, 18, 23, 27, 28, 23, 16, 9, 1][month];
  const latAdj = (37.5 - region.lat) * 1.2;
  const base = seasonBase + latAdj + (r() - 0.5) * 4;
  const skyIdx = Math.min(5, Math.floor(r() * 5.2));
  const sky = SKY[skyIdx];
  const hourly: Hourly[] = [];
  for (let i = 0; i < 24; i++) {
    const h = (now.getHours() + i) % 24;
    const diurnal = -Math.cos(((h - 4) / 24) * Math.PI * 2) * 4; // 14시 최고
    const si = Math.max(0, Math.min(5, skyIdx + Math.round((r() - 0.5) * 1.6)));
    hourly.push({ timeText: i === 0 ? "지금" : `${h}시`, hour: h, temperature: Math.round((base + diurnal + (r() - 0.5)) * 10) / 10, text: SKY[si].text, icon: SKY[si].icon, rain: si >= 4 ? 60 + Math.floor(r() * 40) : Math.floor(r() * 20) });
  }
  const temps = hourly.map((x) => x.temperature);
  const daily: Daily[] = [];
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getTime() + i * 86_400_000);
    const am = SKY[Math.floor(r() * 5)];
    const pm = SKY[Math.floor(r() * 5)];
    const min = Math.round(base - 4 - r() * 3);
    daily.push({ day: `${d.getMonth() + 1}.${d.getDate()}`, label: i === 0 ? "오늘" : i === 1 ? "내일" : days[d.getDay()], amText: am.text, amIcon: am.icon, amRain: am.text === "비" ? 70 : Math.floor(r() * 30), pmText: pm.text, pmIcon: pm.icon, pmRain: pm.text === "비" ? 70 : Math.floor(r() * 30), min, max: min + 6 + Math.round(r() * 5) });
  }
  const pm10 = Math.floor(10 + r() * 90);
  const pm25 = Math.floor(5 + r() * 50);
  const wind = Math.round((1 + r() * 5) * 10) / 10;
  const nowT = hourly[0].temperature;
  const uv = Math.floor(r() * 10);
  const life: LifeIndex[] = [
    { name: "자외선", value: uv, level: uv < 3 ? "낮음" : uv < 6 ? "보통" : uv < 8 ? "높음" : "매우높음", tip: uv < 3 ? "별도 보호 없이 외출 가능" : "외출 시 선크림을 발라 주세요" },
    { name: "세차", value: hourly.some((h) => h.rain >= 60) ? 2 : 4, level: hourly.some((h) => h.rain >= 60) ? "나쁨" : "좋음", tip: hourly.some((h) => h.rain >= 60) ? "비 소식이 있어 세차를 미루세요" : "세차하기 좋은 날입니다" },
    { name: "빨래", value: sky.text === "맑음" ? 4 : 2, level: sky.text === "맑음" ? "매우좋음" : "보통", tip: sky.text === "맑음" ? "실외 건조에 좋습니다" : "실내 건조를 권합니다" },
    { name: "체감온도", value: Math.round(nowT - wind * 0.7), level: `${Math.round(nowT - wind * 0.7)}°`, tip: "바람의 영향을 반영한 값" },
  ];
  return {
    region,
    now: {
      regionName: region.name, text: sky.text, icon: sky.icon, temperature: nowT, feels: Math.round((nowT - wind * 0.7) * 10) / 10,
      minTemperature: Math.min(...temps), maxTemperature: Math.max(...temps), pm10, pm10Legend: legend(pm10), pm25, pm25Legend: legend(pm25 * 2),
      humidity: Math.floor(30 + r() * 50), wind, sunrise: `0${6 + (month < 3 || month > 9 ? 1 : 0)}:${String(10 + Math.floor(r() * 40)).padStart(2, "0")}`, sunset: `${17 + (month > 3 && month < 9 ? 2 : 0)}:${String(10 + Math.floor(r() * 40)).padStart(2, "0")}`,
    },
    hourly, daily, life,
  };
}

/** 메인 페이지 위젯과 같은 축약 응답 */
export function compactForecast(code: string) {
  const f = getForecast(code);
  if (!f) return undefined;
  return {
    now: { regionName: f.now.regionName, text: f.now.text, temperature: f.now.temperature, minTemperature: f.now.minTemperature, maxTemperature: f.now.maxTemperature, pm10Legend: f.now.pm10Legend, pm25Legend: f.now.pm25Legend },
    forecast: f.hourly.filter((_, i) => i % 2 === 0).slice(0, 6).map((h) => ({ timeText: h.timeText, temperature: h.temperature, text: h.text })),
  };
}
