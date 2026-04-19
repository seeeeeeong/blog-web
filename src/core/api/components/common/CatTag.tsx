const DOT_COLOR: Record<string, string> = {
  engineering: "bg-cat-blue",
  backend: "bg-cat-blue",
  cs: "bg-cat-blue",
  frontend: "bg-cat-purple",
  infra: "bg-cat-amber",
  notes: "bg-cat-pink",
  spring: "bg-cat-green",
};

const DEFAULT_DOT = "bg-ghost";

export function CatTag({ name }: { name: string }) {
  const dot = DOT_COLOR[name] ?? DEFAULT_DOT;
  const label = name.charAt(0).toUpperCase() + name.slice(1);
  return (
    <span className="pill">
      <span className={`pill-dot ${dot}`} />
      {label}
    </span>
  );
}
