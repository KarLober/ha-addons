"use client";

import { useState, useTransition } from "react";
import {
  addTask,
  deleteTask,
  updateTaskInterval,
  updateTaskName,
} from "@/app/verwaltung/actions";
import type { ManageTask } from "@/lib/db/queries";

export function TasksSection({
  tasks,
  rooms,
}: {
  tasks: ManageTask[];
  rooms: { id: number; name: string }[];
}) {
  const [newName, setNewName] = useState("");
  const [newInterval, setNewInterval] = useState(7);
  const [selectedRoomId, setSelectedRoomId] = useState<number | "">(
    rooms[0]?.id ?? "",
  );
  const [isPending, startTransition] = useTransition();

  const activeRoomId =
    rooms.some((r) => r.id === selectedRoomId) ? selectedRoomId : (rooms[0]?.id ?? "");

  function handleAdd() {
    if (!newName.trim() || !activeRoomId) return;
    startTransition(async () => {
      await addTask(newName, Number(activeRoomId), newInterval);
      setNewName("");
      setNewInterval(7);
    });
  }

  function handleDelete(id: number) {
    startTransition(() => deleteTask(id));
  }

  const visibleTasks = tasks.filter((t) => t.roomId === activeRoomId);

  return (
    <section className="mb-8">
      <h2 className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-text-secondary">
        Aufgaben
      </h2>

      <div className="mb-2.5 flex gap-1.5 overflow-x-auto pb-1">
        {rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => setSelectedRoomId(room.id)}
            className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-semibold ${
              room.id === activeRoomId
                ? "bg-accent text-accent-text"
                : "bg-chip text-text"
            }`}
          >
            {room.name}
          </button>
        ))}
      </div>

      {visibleTasks.map((task) => (
        <div
          key={task.id}
          className="mb-2 flex flex-wrap items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-3"
        >
          <div className="min-w-0 flex-1">
            <input
              defaultValue={task.name}
              onBlur={(e) => {
                if (e.target.value.trim() !== task.name) {
                  startTransition(() =>
                    updateTaskName(task.id, e.target.value),
                  );
                }
              }}
              className="block w-full rounded-lg border border-transparent bg-chip px-2.5 py-1.5 text-sm font-semibold outline-none transition-colors hover:border-border focus:border-accent focus:bg-surface"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              defaultValue={task.intervalDays}
              onBlur={(e) => {
                const value = Number(e.target.value);
                if (value !== task.intervalDays) {
                  startTransition(() => updateTaskInterval(task.id, value));
                }
              }}
              className="w-[52px] rounded-lg border border-border bg-bg px-2 py-1.5 text-sm"
            />
            <span className="text-xs text-text-secondary">Tage</span>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleDelete(task.id)}
            className="whitespace-nowrap text-xs font-semibold text-danger disabled:opacity-50"
          >
            Entfernen
          </button>
        </div>
      ))}

      {visibleTasks.length === 0 && (
        <div className="py-3.5 text-[13px] text-text-secondary">
          Keine Aufgaben in diesem Raum.
        </div>
      )}

      <div className="mt-1 flex flex-col gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Neue Aufgabe"
          className="rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm outline-none"
        />
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            value={newInterval}
            onChange={(e) => setNewInterval(Number(e.target.value))}
            className="w-[64px] rounded-[10px] border border-border bg-surface px-2 py-2.5 text-sm outline-none"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={handleAdd}
            className="whitespace-nowrap rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-bold text-accent-text disabled:opacity-50"
          >
            Hinzufügen
          </button>
        </div>
      </div>
    </section>
  );
}
