import type { ReactNode } from 'react';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  tone: string;
}

export function StatCard({ label, value, icon, tone }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-stone-500">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-[#142433]">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${tone}`}>{icon}</div>
      </div>
    </Card>
  );
}
