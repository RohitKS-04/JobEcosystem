import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, id, className = '', ...rest }: InputProps) {
  return (
    <div className="field-group">
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} className={className} {...rest} />
    </div>
  );
}
