"use client";

import { useTransition } from "react";
import { completeTask } from "@/app/aufgaben/actions";
import type { TaskWithStatus } from "@/lib/db/queries";

function todayIso(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

const bucketDotClass: Record<TaskWithStatus["status"]["bucket"], string> = {
  overdue: "bg-danger",
  soon: "bg-warning",
  planned: "bg-success",
};

const bucketTextClass: Record<TaskWithStatus["status"]["bucket"], string> = {
  overdue: "text-danger",
  soon: "text-warning",
  planned: "text-success",
};

export function TaskRow({
  task,
  users,
  currentUserId,
  showRoom,
  expanded,
  onToggleExpand,
}: {
  task: TaskWithStatus;
  users: { id: number; name: string }[];
  currentUserId: number | null;
  showRoom: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleComplete(userIds: number[]) {
    startTransition(async () => {
      await completeTask(task.id, userIds, todayIso());
    });
  }

  return (
    <div className="mb-2 overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center gap-3 p-3.5">
        <div
          className={`h-[9px] w-[9px] min-w-[9px] rounded-full ${bucketDotClass[task.status.bucket]}`}
        />
        <div className="min-w-0 flex-1">
          {showRoom && (
            <div className="mb-0.5 truncate text-xs text-text-secondary">
              {task.roomName}
            </div>
          )}
          <div className="mb-0.5 truncate text-[15px] font-semibold">
            {task.name}
          </div>
          <div
            className={`text-[13px] font-medium ${bucketTextClass[task.status.bucket]}`}
          >
            {task.dueText}
          </div>
        </div>
        <div className="flex items-stretch overflow-hidden rounded-full border border-accent">
          <button
            type="button"
            disabled={currentUserId === null || isPending}
            onClick={() => handleComplete([currentUserId!])}
            className="whitespace-nowrap px-3.5 py-1.5 text-[13px] font-semibold text-accent disabled:opacity-40"
          >
            Erledigt
          </button>
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label="Andere Auswahl anzeigen"
            className="border-l border-accent px-2.5 py-1.5 text-[13px] leading-[1.2] text-accent"
          >
            ⌄
          </button>
        </div>
      </div>

      {expanded && (
        <div className="flex flex-wrap items-center gap-2 px-3.5 pb-3.5">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              disabled={isPending}
              onClick={() => handleComplete([user.id])}
              className="rounded-[10px] bg-chip px-3.5 py-2 text-[13px] font-semibold disabled:opacity-50"
            >
              {user.name}
            </button>
          ))}
          {users.length > 1 && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleComplete(users.map((u) => u.id))}
              className="rounded-[10px] bg-chip px-3.5 py-2 text-[13px] font-semibold disabled:opacity-50"
            >
              Zusammen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
