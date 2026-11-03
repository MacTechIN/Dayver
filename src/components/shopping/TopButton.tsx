"use client";

export function TopButton() {
  return (
    <button
      type="button"
      aria-label="맨위로가기"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-8 bottom-8 w-11 h-11 rounded-full bg-white border border-dv-border shadow grid place-items-center text-dv-text-2 hover:text-dv-purple z-30"
    >
      ↑
    </button>
  );
}
