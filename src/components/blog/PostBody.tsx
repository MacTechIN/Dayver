/** 본문 렌더: 빈 줄 기준 문단, 줄바꿈 유지, '# ' 로 시작하는 줄은 소제목 */
export function PostBody({ content }: { content: string }) {
  const paras = content.split(/\n{2,}/);
  return (
    <div className="text-[16px] leading-[1.9] text-dv-text space-y-5">
      {paras.map((p, i) => {
        if (p.startsWith("# ")) return <h3 key={i} className="text-[20px] font-bold mt-6">{p.slice(2)}</h3>;
        const lines = p.split("\n");
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>
                {l}
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
