"use client";

import { useTransition } from "react";
import { deleteCompletion } from "@/app/statistik/actions";
import type { TimelineEntry } from "@/lib/db/queries";

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const [isPending, startTransition] = useTransition();

  if (entries.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-text-secondary">
        Noch keine Erledigungen.
      </div>
    );
  }

  return (
    <>
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center gap-3.5 border-b border-border-soft py-3 last:border-b-0"
        >
          <div className="w-[52px] min-w-[52px] text-xs text-text-tertiary">
            {entry.date.toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "short",
            })}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold">
              {entry.taskName}
            </div>
            <div className="truncate text-xs text-text-secondary">
              {entry.roomName}
            </div>
          </div>
          <div className="whitespace-nowrap rounded-full bg-chip px-2.5 py-1 text-xs font-semibold text-text-secondary">
            {entry.personLabel}
          </div>
          <button
            type="button"
            aria-label="Eintrag löschen"
            disabled={isPending}
            onClick={() => startTransition(() => deleteCompletion(entry.id))}
            className="flex h-6 w-6 min-w-6 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-chip hover:text-danger disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ))}
    </>
  );
}
