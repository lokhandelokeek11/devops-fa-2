const tones: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-950',
  'In Progress': 'bg-sky-100 text-sky-950',
  Resolved: 'bg-emerald-100 text-emerald-950',
  Rejected: 'bg-rose-100 text-rose-950',
  Low: 'bg-stone-200 text-stone-800',
  Medium: 'bg-sky-100 text-sky-900',
  High: 'bg-orange-100 text-orange-950',
  Critical: 'bg-red-100 text-red-900',
};

export function Badge({ value }: { value: string }) {
  const tone = tones[value] ?? 'bg-stone-100 text-stone-800';
  return (
    <span
      data-testid="status-badge"
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}
    >
      {value}
    </span>
  );
}
