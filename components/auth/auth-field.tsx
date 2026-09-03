import type { ReactNode } from "react";

import { authFieldInputClass } from "@/lib/auth-form-styles";
import { cn } from "@/lib/utils";

type AuthFieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
};

export function AuthField({ id, label, children, className }: AuthFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-neutral-50">
        {label}
      </label>
      {children}
    </div>
  );
}

export function AuthInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(authFieldInputClass, className)}
      {...props}
    />
  );
}
