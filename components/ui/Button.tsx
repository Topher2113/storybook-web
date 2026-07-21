"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

// Filled primary button matching the RN ActionButton/ChoiceButton look:
// primary background, buttonText color, rounded, pressed opacity.
export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "outline";
}) {
  const base =
    "rounded-xl px-5 py-3 font-bold transition active:opacity-70 disabled:cursor-not-allowed disabled:opacity-40";
  const styles =
    variant === "primary"
      ? "bg-primary text-button-text hover:brightness-105"
      : "border-2 border-primary bg-transparent text-primary hover:bg-primary/10";
  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}
