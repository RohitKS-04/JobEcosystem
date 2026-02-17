import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <article className={`job-card ${className}`.trim()} {...rest}>
      {children}
    </article>
  );
}
