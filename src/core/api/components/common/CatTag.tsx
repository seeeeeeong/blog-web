const COLOR_MAP: Record<string, string> = {
  spring: "text-term-green border-term-green-dim",
  infra: "text-term-amber border-[var(--c-term-amber-dim)]",
  cs: "text-term-blue border-[var(--c-term-blue-dim)]",
};

const DEFAULT_COLOR = "text-ink-faint border-ink-ghost";

export function CatTag({ name }: { name: string }) {
  const color = COLOR_MAP[name] || DEFAULT_COLOR;
  return (
    <span className={`inline-block text-[10px] px-1.5 py-px border rounded ${color}`}>
      {name}
    </span>
  );
}
