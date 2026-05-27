import type { LucideIcon } from "lucide-react";

type StatTileProps = {
  icon: LucideIcon;
  label: string;
  value: number | string;
  tone?: "default" | "warning" | "danger";
};

export function StatTile({ icon: Icon, label, value, tone = "default" }: StatTileProps) {
  const toneClass = {
    default: "border-slate-200 bg-white text-slate-900",
    warning: "border-amber-200 bg-amber-50 text-amber-950",
    danger: "border-rose-200 bg-rose-50 text-rose-950"
  }[tone];

  return (
    <section className={`rounded-md border p-4 shadow-sm ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <Icon aria-hidden="true" className="h-4 w-4 text-slate-500" />
      </div>
      <strong className="mt-3 block text-2xl font-semibold">{value}</strong>
    </section>
  );
}
