import type { ReactNode } from "react";

import { authCardClass } from "@/lib/auth-form-styles";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div className={cn(authCardClass, className)}>
      <header className="mb-6 space-y-1.5 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-50">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sm text-neutral-400">{subtitle}</p>
        ) : null}
      </header>
      {children}
      {footer ? <div className="mt-6 text-center">{footer}</div> : null}
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-neutral-800" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-neutral-900 px-2 text-neutral-500">or</span>
      </div>
    </div>
  );
}
