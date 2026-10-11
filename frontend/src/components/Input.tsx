import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

const fieldClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-[#c56a1a] placeholder:text-stone-400 focus:ring-2';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export function Input({ label, id, ...props }: InputProps) {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <input id={id} className={fieldClass} {...props} />
    </label>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
}

export function TextArea({ label, id, ...props }: TextAreaProps) {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <textarea id={id} className={`${fieldClass} min-h-28 resize-y`} {...props} />
    </label>
  );
}
