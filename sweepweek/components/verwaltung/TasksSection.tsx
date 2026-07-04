"use client";

import { useState, useTransition } from "react";
import {
  addTask,
  deleteTask,
  updateTaskInterval,
  updateTaskName,
  updateTaskRoom,
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
  const [newRoomId, setNewRoomId] = useState<number | "">(rooms[0]?.id ?? "");
  const [newInterval, setNewInterval] = useState(7);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!newName.trim() || !newRoomId) return;
    startTransition(async () => {
      await addTask(newName, Number(newRoomId), newInterval);
      setNewName("");
      setNewInterval(7);
    });
  }

  function handleDelete(id: number, name: string) {
    if (
      !confirm(
        `Aufgabe "${name}" wirklich entfernen? Die Erledigungs-Historie geht dabei verloren.`,
      )
    )
      return;
    startTransition(() => deleteTask(id));
  }

  const sorted = [...tasks].sort((a, b) =>
    a.roomName.localeCompare(b.roomName, "de"),
  );

  return (
    <section className="mb-8">
      <h2 className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-text-secondary">
        Aufgaben
      </h2>

      {sorted.map((task) => (
        <div
          key={task.id}
          className="mb-2 flex flex-wrap items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-3"
        >
          <div className="min-w-0 flex-1">
            <select
              defaultValue={task.roomId}
              onChange={(e) =>
                startTransition(() =>
                  updateTaskRoom(task.id, Number(e.target.value)),
                )
              }
              className="mb-0.5 -ml-1 rounded bg-transparent text-xs text-text-secondary outline-none"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
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
            onClick={() => handleDelete(task.id, task.name)}
            className="whitespace-nowrap text-xs font-semibold text-danger disabled:opacity-50"
          >
            Entfernen
          </button>
        </div>
      ))}

      <div className="mt-1 flex flex-col gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Neue Aufgabe"
          className="rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm outline-none"
        />
        <div className="flex gap-2">
          <select
            value={newRoomId}
            onChange={(e) => setNewRoomId(Number(e.target.value))}
            className="min-w-0 flex-1 rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm outline-none"
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
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
