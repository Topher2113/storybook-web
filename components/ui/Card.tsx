import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-2xl bg-surface p-6 shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
