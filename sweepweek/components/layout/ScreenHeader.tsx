import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BackButton } from "@/components/layout/BackButton";

export function ScreenHeader({
  title,
  backButtonEnabled = false,
  backButtonPath,
  children,
}: {
  title: string;
  backButtonEnabled?: boolean;
  backButtonPath?: string;
  children?: ReactNode;
}) {
  return (
    <div className="sticky top-0 z-10 flex flex-col gap-3.5 bg-bg px-5 pb-3.5 pt-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BackButton enabled={backButtonEnabled} targetPath={backButtonPath} />
          <h1 className="text-[22px] font-bold tracking-tight">{title}</h1>
        </div>
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
