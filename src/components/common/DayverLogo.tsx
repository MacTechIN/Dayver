import Link from "next/link";

/**
 * Dayver 로고. 네이버의 "N + 서비스명" 조합(예: N blog, N Cafe)을 "D + 서비스명"으로 재해석.
 */
export function DayverMark({ size = 28, color = "var(--dv-green)" }: { size?: number; color?: string }) {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center rounded-md font-black text-white select-none"
      style={{ width: size, height: size, background: color, fontSize: size * 0.62, lineHeight: 1 }}
    >
      D
    </span>
  );
}

export function DayverLogo({
  service,
  href = "/",
  size = 28,
  color,
  serviceColor = "var(--dv-text)",
}: {
  service?: string;
  href?: string;
  size?: number;
  color?: string;
  serviceColor?: string;
}) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5" aria-label={service ? `DAYVER ${service}` : "DAYVER"}>
      <DayverMark size={size} color={color} />
      {service ? (
        <span className="font-extrabold tracking-tight" style={{ fontSize: size * 0.8, color: serviceColor }}>
          {service}
        </span>
      ) : (
        <span className="font-black tracking-tight text-dv-green" style={{ fontSize: size * 0.8 }}>
          DAYVER
        </span>
      )}
    </Link>
  );
}
