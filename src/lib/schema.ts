// Dayver 전체 스키마. 서비스별 테이블은 한 곳에서 관리한다 (SQLite, node:sqlite).
export const CORE_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nickname TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  bio TEXT NOT NULL DEFAULT '',
  avatar_color TEXT NOT NULL DEFAULT '#03c75a',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS user_settings (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'light',
  font_size TEXT NOT NULL DEFAULT 'normal',
  newsstand_view TEXT NOT NULL DEFAULT 'thumbnail'
);
CREATE TABLE IF NOT EXISTS memos (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT NOT NULL DEFAULT '',
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
`;

export const NEWS_SCHEMA = `
CREATE TABLE IF NOT EXISTS news_press (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,          -- 종합/경제, 방송/통신, IT, 스포츠/연예, 매거진/전문지, 지역, 영자지
  logo_color TEXT NOT NULL,
  is_major INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS news_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  press_id INTEGER NOT NULL REFERENCES news_press(id),
  section TEXT NOT NULL,           -- 정치, 경제, 사회, 생활/문화, IT/과학, 세계, 엔터, 스포츠
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  image_color TEXT NOT NULL,
  is_headline INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_news_articles_section ON news_articles(section, created_at DESC);
CREATE TABLE IF NOT EXISTS news_subscriptions (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  press_id INTEGER NOT NULL REFERENCES news_press(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, press_id)
);
CREATE TABLE IF NOT EXISTS news_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
`;

export const SHOPPING_SCHEMA = `
CREATE TABLE IF NOT EXISTS shop_categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id INTEGER REFERENCES shop_categories(id),
  sort INTEGER NOT NULL DEFAULT 0,
  vertical_code TEXT                 -- 전문관 코드(fashion_town, high_end, market 등) 선택
);
CREATE TABLE IF NOT EXISTS shop_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'SMARTSTORE', -- SMARTSTORE | BRAND
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#5e3bee'
);
CREATE TABLE IF NOT EXISTS shop_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id INTEGER NOT NULL REFERENCES shop_channels(id),
  category_id INTEGER NOT NULL REFERENCES shop_categories(id),
  name TEXT NOT NULL,
  sale_price INTEGER NOT NULL,
  discount_rate REAL NOT NULL DEFAULT 0,
  image_color TEXT NOT NULL,
  review_count INTEGER NOT NULL DEFAULT 0,
  review_score REAL NOT NULL DEFAULT 0,
  is_free_delivery INTEGER NOT NULL DEFAULT 1,
  is_today_delivery INTEGER NOT NULL DEFAULT 0,
  is_arrival_guarantee INTEGER NOT NULL DEFAULT 0,
  tag_type TEXT,                     -- PROMOTION | LOUNGE | VOUCHER | ARRIVAL_GUARANTEE | MEMBERSHIP_EXCLUSIVE
  tag_title TEXT,
  stock INTEGER NOT NULL DEFAULT 100,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_shop_products_category ON shop_products(category_id);
CREATE TABLE IF NOT EXISTS shop_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,                -- BANNER | TODAY_EVENT | DEAL | SHORTCUT
  label TEXT NOT NULL DEFAULT '',
  header TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  landing_url TEXT NOT NULL DEFAULT '/shopping',
  color TEXT NOT NULL DEFAULT '#5e3bee',
  product_id INTEGER REFERENCES shop_products(id),
  ends_at TEXT,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS shop_cart_items (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, product_id)
);
CREATE TABLE IF NOT EXISTS shop_wishes (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, product_id)
);
CREATE TABLE IF NOT EXISTS shop_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PAID',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS shop_order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES shop_products(id),
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS shop_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
`;

export const CAFE_SCHEMA = `
CREATE TABLE IF NOT EXISTS cafes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,            -- 만화/애니, 생활, 외국어, ... (네이버 주제별 카페 분류)
  region TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  color TEXT NOT NULL DEFAULT '#03c75a',
  is_public INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS cafe_members (
  cafe_id INTEGER NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner | staff | member
  nickname TEXT,
  joined_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  PRIMARY KEY (cafe_id, user_id)
);
CREATE TABLE IF NOT EXISTS cafe_boards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cafe_id INTEGER NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0,
  members_only INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS cafe_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cafe_id INTEGER NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  board_id INTEGER NOT NULL REFERENCES cafe_boards(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  is_notice INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_cafe_posts_cafe ON cafe_posts(cafe_id, created_at DESC);
CREATE TABLE IF NOT EXISTS cafe_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES cafe_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS cafe_join_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cafe_id INTEGER NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
`;

export const BLOG_SCHEMA = `
CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '일상·생각', -- 만화·애니, 취미, 비즈니스·경제, 패션·미용, 일상·생각, 상품리뷰, 육아·결혼
  tags TEXT NOT NULL DEFAULT '',
  image_color TEXT,
  is_public INTEGER NOT NULL DEFAULT 1,
  likes INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_user ON blog_posts(user_id, created_at DESC);
CREATE TABLE IF NOT EXISTS blog_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS blog_neighbors (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  neighbor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, neighbor_id)
);
CREATE TABLE IF NOT EXISTS blog_likes (
  post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);
`;

export const MAIL_SCHEMA = `
CREATE TABLE IF NOT EXISTS mails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user_id INTEGER NOT NULL REFERENCES users(id),
  to_user_id INTEGER NOT NULL REFERENCES users(id),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at TEXT,
  starred_by_receiver INTEGER NOT NULL DEFAULT 0,
  deleted_by_sender INTEGER NOT NULL DEFAULT 0,
  deleted_by_receiver INTEGER NOT NULL DEFAULT 0,
  folder TEXT NOT NULL DEFAULT 'inbox',   -- 수신자 기준: inbox | spam | archive
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_mails_to ON mails(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mails_from ON mails(from_user_id, created_at DESC);
CREATE TABLE IF NOT EXISTS mail_drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_address TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
`;

export const MAIN_SCHEMA = `
CREATE TABLE IF NOT EXISTS feed_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tab TEXT NOT NULL,                 -- 추천, 카테크, 웹툰, 패션뷰티, 리빙푸드, 책방, 지식, 건강
  kind TEXT NOT NULL DEFAULT 'post', -- post | video | news
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  link TEXT NOT NULL DEFAULT '#',
  image_color TEXT NOT NULL,
  duration TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
`;

export const ALL_SCHEMA = [
  CORE_SCHEMA,
  NEWS_SCHEMA,
  SHOPPING_SCHEMA,
  CAFE_SCHEMA,
  BLOG_SCHEMA,
  MAIL_SCHEMA,
  MAIN_SCHEMA,
].join("\n");
