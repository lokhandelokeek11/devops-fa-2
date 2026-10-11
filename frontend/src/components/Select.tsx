import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: readonly string[];
  allowEmpty?: boolean;
  emptyLabel?: string;
}

export function Select({
  label,
  id,
  options,
  allowEmpty = false,
  emptyLabel = 'All',
  ...props
}: SelectProps) {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <select
        id={id}
        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-[#c56a1a] focus:ring-2"
        {...props}
      >
        {allowEmpty ? <option value="">{emptyLabel}</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
