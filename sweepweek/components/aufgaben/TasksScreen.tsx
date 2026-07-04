"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { TaskRow } from "./TaskRow";
import { BUCKET_LABELS, type UrgencyBucket } from "@/lib/status";
import type { TaskWithStatus } from "@/lib/db/queries";

type Grouping = "urgency" | "room";

const URGENCY_ORDER: UrgencyBucket[] = ["overdue", "soon", "planned"];

export function TasksScreen({
  tasks,
  users,
  rooms,
  currentUserId,
  backButtonEnabled,
  backButtonPath,
}: {
  tasks: TaskWithStatus[];
  users: { id: number; name: string }[];
  rooms: { id: number; name: string }[];
  currentUserId: number | null;
  backButtonEnabled: boolean;
  backButtonPath?: string;
}) {
  const [grouping, setGrouping] = useState<Grouping>("urgency");
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  const sections =
    grouping === "urgency"
      ? URGENCY_ORDER.map((bucket) => ({
          key: bucket,
          label: BUCKET_LABELS[bucket],
          showRoom: true,
          tasks: tasks
            .filter((t) => t.status.bucket === bucket)
            .sort((a, b) => a.status.daysUntil - b.status.daysUntil),
        })).filter((s) => s.tasks.length > 0)
      : rooms
          .map((room) => ({
            key: `room-${room.id}`,
            label: room.name,
            showRoom: false,
            tasks: tasks
              .filter((t) => t.roomId === room.id)
              .sort((a, b) => a.status.daysUntil - b.status.daysUntil),
          }))
          .filter((s) => s.tasks.length > 0);

  return (
    <>
      <ScreenHeader
        title="Aufgaben"
        backButtonEnabled={backButtonEnabled}
        backButtonPath={backButtonPath}
      >
        <div className="flex gap-1.5 rounded-xl bg-chip p-1">
          <button
            type="button"
            onClick={() => setGrouping("urgency")}
            className={`flex-1 rounded-[10px] py-2 text-[13px] font-semibold transition-colors ${
              grouping === "urgency"
                ? "bg-surface text-text shadow-sm"
                : "text-text-secondary"
            }`}
          >
            Dringlichkeit
          </button>
          <button
            type="button"
            onClick={() => setGrouping("room")}
            className={`flex-1 rounded-[10px] py-2 text-[13px] font-semibold transition-colors ${
              grouping === "room"
                ? "bg-surface text-text shadow-sm"
                : "text-text-secondary"
            }`}
          >
            Raum
          </button>
        </div>
      </ScreenHeader>

      <div className="px-5 pb-6">
        {sections.map((section) => (
          <div key={section.key} className="mb-7">
            <div className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-text-secondary">
              {section.label}
            </div>
            {section.tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                users={users}
                currentUserId={currentUserId}
                showRoom={section.showRoom}
                expanded={expandedTaskId === task.id}
                onToggleExpand={() =>
                  setExpandedTaskId((current) =>
                    current === task.id ? null : task.id,
                  )
                }
              />
            ))}
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="py-10 text-center text-sm text-text-secondary">
            Keine Aufgaben – alles erledigt.
          </div>
        )}
      </div>
    </>
  );
}
