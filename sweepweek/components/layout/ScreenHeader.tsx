import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function ScreenHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="sticky top-0 z-10 flex flex-col gap-3.5 bg-bg px-5 pb-3.5 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold tracking-tight">{title}</h1>
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
