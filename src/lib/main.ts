import "server-only";
import { all, get } from "./db";
import { DEFAULT_REGION, compactForecast } from "./weather";
import { listIndices, listStocks } from "./stock";

/**
 * 메인 페이지 블록 데이터. 네이버 메인의 블록 스키마(@type/@code/@template/materials)를 재해석했다.
 * - EAGER: HTML에 동봉되는 초기 블록 (뉴스스탠드, 추천 피드, 쇼핑박스, 공지)
 * - LAZY: /api/lazy 로 늦게 받는 블록 (날씨, 증시, 캘린더, 사전, 오디오, 장바구니, 메모)
 */
export type Block<M = unknown> = {
  "@type": string;
  "@code": string;
  "@template": string;
  "@lastModifiedAt": string;
  materials: M[];
  blocks?: Block[];
  [k: string]: unknown;
};

const now = () => new Date().toISOString();

function block<M>(code: string, type: string, template: string, materials: M[], extra: Record<string, unknown> = {}): Block<M> {
  return { "@type": type, "@code": code, "@template": template, "@lastModifiedAt": now(), materials, ...extra };
}

export type PressMaterial = { id: number; name: string; slug: string; logo_color: string; category: string; is_major: number };
export type ArticleMaterial = { id: number; title: string; summary: string; press_name: string; press_id: number; section: string; image_color: string; created_at: string };
export type FeedMaterial = { id: number; tab: string; kind: string; title: string; source: string; link: string; image_color: string; duration: string | null };
export type ProductMaterial = { id: number; name: string; sale_price: number; discount_rate: number; image_color: string; channel_name: string; tag_title: string | null };

export const NEWSSTAND_TABS = ["뉴스스탠드", "언론사편집", "엔터", "스포츠", "게임", "경제"] as const;
export const FEED_TABS = ["추천", "카테크", "웹툰", "패션뷰티", "리빙푸드", "책방", "지식", "건강"] as const;

export function newsstandBlock(tab: string = "뉴스스탠드", page = 1): Block {
  const pageSize = 24;
  const press = all<PressMaterial>(
    "SELECT id, name, slug, logo_color, category, is_major FROM news_press ORDER BY is_major DESC, id LIMIT ? OFFSET ?",
    pageSize, (page - 1) * pageSize,
  );
  const total = get<{ c: number }>("SELECT COUNT(*) c FROM news_press")?.c ?? 0;
  const sectionOf: Record<string, string | null> = { 뉴스스탠드: null, 언론사편집: null, 엔터: "엔터", 스포츠: "스포츠", 게임: "IT/과학", 경제: "경제" };
  const section = sectionOf[tab] ?? null;
  const headlines = section
    ? all<ArticleMaterial>(
        "SELECT a.id, a.title, a.summary, a.press_id, p.name press_name, a.section, a.image_color, a.created_at FROM news_articles a JOIN news_press p ON p.id = a.press_id WHERE a.section = ? ORDER BY a.created_at DESC LIMIT 12",
        section,
      )
    : all<ArticleMaterial>(
        "SELECT a.id, a.title, a.summary, a.press_id, p.name press_name, a.section, a.image_color, a.created_at FROM news_articles a JOIN news_press p ON p.id = a.press_id WHERE a.is_headline = 1 ORDER BY a.created_at DESC LIMIT 12",
      );
  return block("PC-NEWSSTAND", "PC-NEWSSTAND-BLOCK", tab === "언론사편집" ? "PRESS-EDIT" : "PRESS-GRID", press, {
    tab,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    headlines,
  });
}

export function yonhapBlock(): Block<ArticleMaterial> {
  const rows = all<ArticleMaterial>(
    "SELECT a.id, a.title, a.summary, a.press_id, p.name press_name, a.section, a.image_color, a.created_at FROM news_articles a JOIN news_press p ON p.id = a.press_id ORDER BY a.views DESC, a.created_at DESC LIMIT 6",
  );
  return block("PC-NEWSSTAND-YONHAP", "BLOCK", "ONELINE", rows);
}

export function feedBlock(tab: string = "추천"): Block<FeedMaterial> {
  const rows = all<FeedMaterial>(
    "SELECT id, tab, kind, title, source, link, image_color, duration FROM feed_items WHERE tab = ? ORDER BY created_at DESC LIMIT 12",
    tab,
  );
  return block(`PC-FEED-${tab}`, "PC-FEED-BLOCK", "FOUR-COLUMNS", rows, { tab });
}

export function shoppingBoxBlock(): Block<ProductMaterial> {
  const rows = all<ProductMaterial>(
    "SELECT p.id, p.name, p.sale_price, p.discount_rate, p.image_color, c.name channel_name, p.tag_title FROM shop_products p JOIN shop_channels c ON c.id = p.channel_id ORDER BY p.review_count DESC, p.id LIMIT 8",
  );
  const stores = all<{ id: number; name: string; slug: string }>("SELECT id, name, slug FROM shop_channels ORDER BY id LIMIT 10");
  return block("PC-SHOPPING-BOX", "PC-SHOPPING-BLOCK", "SHOPPING-BOX", rows, { stores });
}

export function rightShoppingBlock(): Block<ProductMaterial> {
  const rows = all<ProductMaterial>(
    "SELECT p.id, p.name, p.sale_price, p.discount_rate, p.image_color, c.name channel_name, p.tag_title FROM shop_products p JOIN shop_channels c ON c.id = p.channel_id ORDER BY p.discount_rate DESC, p.id LIMIT 3",
  );
  return block("PC-RIGHT-SHOPPING", "MINI-CONTENT-BLOCK", "THREE-ITEMS", rows, { title: "요즘 많이 찾는 상품은" });
}

export function noticeBlock(): Block<{ id: number; title: string; created_at: string }> {
  return block("CAS-MINICONTENT-PC-NOTICE", "MINI-CONTENT-BLOCK", "NONE", all("SELECT id, title, created_at FROM notices ORDER BY id DESC LIMIT 3"));
}

/** 날씨 위젯: Dayver 날씨 서비스(/weather)의 예보를 요약 (지역은 dv_region 쿠키) */
export function weatherBlock(regionCode: string = DEFAULT_REGION): Block {
  const f = compactForecast(regionCode) ?? compactForecast(DEFAULT_REGION);
  return block("PC-WEATHER", "PC-WEATHER-BLOCK", "PC-WEATHER", [], {
    regionCode,
    now: f?.now ?? null,
    forecast: f?.forecast ?? [],
    href: `/weather/${regionCode}`,
  });
}

/** 증시 위젯: Dayver 증권 서비스(/stock)의 지수·인기 종목 */
export function stockBlock(): Block {
  const items = listIndices().map((i) => ({
    title: i.name,
    value: i.value,
    diffValue: Math.abs(i.change),
    diffRate: Math.abs(i.change_rate),
    up: i.change >= 0,
    clickCode: i.code.toLowerCase(),
    href: `/stock/domestic/index/${i.code}`,
  }));
  const popular = listStocks({ orderBy: "search_rank", limit: 3 }).map((s) => ({
    name: s.name,
    code: s.code,
    rate: Math.abs(s.change_rate),
    price: s.price,
    up: s.change >= 0,
  }));
  return block("PC-STOCK", "PC-STOCK-BLOCK", "PC-STOCK", items, { closed: true, popular, serverTimestamp: Date.now() });
}

export function calendarBlock(): Block {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const startDow = first.getDay();
  const cells: Array<{ day: number; inMonth: boolean; holiday?: string; today?: boolean }> = [];
  const prevDays = new Date(y, m, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) cells.push({ day: prevDays - i, inMonth: false });
  const holidays: Record<string, string> = { "01-01": "신정", "03-01": "삼일절", "05-05": "어린이날", "06-06": "현충일", "08-15": "광복절", "10-03": "개천절", "10-09": "한글날", "12-25": "성탄절", "11-07": "입동", "11-22": "소설" };
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, inMonth: true, holiday: holidays[key], today: day === d.getDate() });
  }
  let next = 1;
  while (cells.length % 7 !== 0) cells.push({ day: next++, inMonth: false });
  return block("PC-CALENDAR", "PC-CALENDAR-BLOCK", "PC-CALENDAR", cells, { year: y, month: m + 1, today: d.getDate() });
}

export function dictionaryBlock(): Block {
  const sentences = [
    { sentence: "Don’t underestimate yourself.", translation: "자신을 과소평가하지 마세요." },
    { sentence: "Small steps every day.", translation: "매일 작은 한 걸음." },
    { sentence: "Stay curious.", translation: "호기심을 잃지 마세요." },
    { sentence: "Make today count.", translation: "오늘을 의미 있게 만드세요." },
  ];
  const pick = sentences[new Date().getDate() % sentences.length];
  return block("PC-DICTIONARY", "PC-DICTIONARY-BLOCK", "PC-DICTIONARY", [], pick);
}

export function audioBlock(): Block {
  const items = [
    { title: "학교 옥상, 나만 아는 비밀 공간에서", color: "#aab7c3", href: "/search?query=오디오" },
    { title: "뽀글뽀글 실습중인 과학실에서", color: "#8e6cf5", href: "/search?query=오디오" },
    { title: "오후 햇빛이 비치는 교실에서", color: "#f2a900", href: "/search?query=오디오" },
  ];
  return block("PC-VIBE-AUDIO", "PC-VIBE-AUDIO-WIDGET-BLOCK", "PC-VIBE-AUDIO", items, { title: "데이브 오디오 큐레이션", curationNo: 486 });
}

export function cartInfoBlock(userId: number | null): Block {
  const count = userId ? get<{ c: number }>("SELECT COALESCE(SUM(quantity),0) c FROM shop_cart_items WHERE user_id = ?", userId)?.c ?? 0 : 0;
  return block("PC-CART-INFO", "BLOCK", "PC-CART-INFO", [], { count });
}

export function memoBlock(userId: number | null): Block {
  const memo = userId ? get<{ content: string }>("SELECT content FROM memos WHERE user_id = ?", userId)?.content ?? "" : null;
  return block("PC-MEMO", "BLOCK", "PC-MEMO", [], { statusCode: userId ? 0 : 401, content: memo });
}

export function allServicesMeta(): Block {
  return block("ALL-SERVICES-META", "BLOCK", "ALL-SERVICES-META", [], {
    services: [
      { code: "mail", name: "메일", href: "/mail" },
      { code: "cafe", name: "카페", href: "/cafe" },
      { code: "blog", name: "블로그", href: "/blog" },
      { code: "shopping", name: "쇼핑", href: "/shopping" },
      { code: "news", name: "뉴스", href: "/news" },
      { code: "newsstand", name: "뉴스스탠드", href: "/newsstand" },
    ],
  });
}

/** HTML에 동봉하는 EAGER-DATA */
export function eagerData() {
  return {
    "PC-MEDIA-WRAPPER": { "@type": "PC-MEDIA-CONTENTS-BLOCK", "@code": "PC-MEDIA-WRAPPER", blocks: [newsstandBlock("뉴스스탠드", 1)] },
    "PC-NEWSSTAND-YONHAP": yonhapBlock(),
    "PC-FEED-WRAPPER": { "@type": "BLOCK", "@code": "PC-FEED-WRAPPER", blocks: [feedBlock("추천")] },
    "PC-SHOPPING-BOX": shoppingBoxBlock(),
    "PC-RIGHT-SHOPPING": rightShoppingBlock(),
    "CAS-MINICONTENT-PC-NOTICE": noticeBlock(),
    GV: { svt: now(), isBirthday: false },
  };
}

export type EagerData = ReturnType<typeof eagerData>;

/** /api/lazy 기본 응답: 네이버의 14개 lazy 블록 재해석 */
export function lazyData(userId: number | null, regionCode: string = DEFAULT_REGION) {
  return {
    "PC-WEATHER": weatherBlock(regionCode),
    "PC-STOCK": stockBlock(),
    "PC-CALENDAR": calendarBlock(),
    "PC-DICTIONARY": dictionaryBlock(),
    "PC-VIBE-AUDIO": audioBlock(),
    "PC-CART-INFO": cartInfoBlock(userId),
    "PC-MEMO": memoBlock(userId),
    "PC-USER-CONFIG": block("PC-USER-CONFIG", "BLOCK", "PC-USER-CONFIG", [], { loggedIn: !!userId }),
    "ALL-SERVICES-META": allServicesMeta(),
  };
}

export type LazyData = ReturnType<typeof lazyData>;
