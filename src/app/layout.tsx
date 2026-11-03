import type { Metadata } from "next";
import "./globals.css";
import { readViewSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "DAYVER",
  description: "Dayver - 검색, 뉴스, 쇼핑, 카페, 블로그, 메일을 한 곳에서",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { theme, font } = await readViewSettings();
  return (
    <html lang="ko" className="h-full antialiased" data-theme={theme} data-font={font}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
