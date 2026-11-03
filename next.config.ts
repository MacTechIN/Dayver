import type { NextConfig } from "next";

/**
 * 개발 중 접속을 허용할 호스트명은 사람마다 다르고(사설 IP, VPN/터널 주소 등)
 * 저장소에 올릴 값이 아니므로 `.env.local`(git 추적 제외)에서 읽는다.
 *
 *   DAYVER_DEV_ORIGINS=my-node.my-tailnet.ts.net,my-node,*.my-tailnet.ts.net,192.168.0.10
 *
 * `.env.example` 참고. 값이 없으면 localhost 계열만 허용된다.
 */
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local이 없으면 기본값만 사용한다.
}

const devOrigins = (process.env.DAYVER_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  // Dayver는 요청 시점 데이터(세션, SQLite)를 많이 읽으므로 고전적 동적 렌더링을 사용한다.
  cacheComponents: false,
  // 항목은 호스트명만 쓴다(스킴·포트 제외). `*`는 한 라벨, `**`는 한 라벨 이상.
  allowedDevOrigins: ["127.0.0.1", "localhost", ...devOrigins],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
