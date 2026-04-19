const CAT_COLOR: Record<string, string> = {
  engineering: "text-cat-blue",
  backend: "text-cat-blue",
  cs: "text-cat-blue",
  frontend: "text-cat-purple",
  infra: "text-cat-amber",
  notes: "text-cat-pink",
  spring: "text-cat-green",
  performance: "text-cat-green",
  database: "text-cat-amber",
};

export function CatTag({ name }: { name: string }) {
  const key = name.toLowerCase();
  const color = CAT_COLOR[key] ?? "text-cat-amber";
  return <span className={`text-[12px] ${color}`}>{key}</span>;
}
