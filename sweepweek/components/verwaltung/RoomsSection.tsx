"use client";

import { useState, useTransition } from "react";
import { addRoom, deleteRoom, updateRoomName } from "@/app/verwaltung/actions";

export function RoomsSection({
  rooms,
}: {
  rooms: { id: number; name: string }[];
}) {
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    if (!newName.trim()) return;
    startTransition(async () => {
      await addRoom(newName);
      setNewName("");
    });
  }

  function handleDelete(id: number, name: string) {
    if (!confirm(`Raum "${name}" wirklich entfernen?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteRoom(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Fehler beim Löschen.");
      }
    });
  }

  return (
    <section className="mb-8">
      <h2 className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-text-secondary">
        Räume
      </h2>

      {error && (
        <div className="mb-2 rounded-lg bg-danger-bg px-3 py-2 text-[13px] text-danger">
          {error}
        </div>
      )}

      {rooms.map((room) => (
        <div
          key={room.id}
          className="mb-2 flex items-center justify-between gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-3"
        >
          <input
            defaultValue={room.name}
            onBlur={(e) => {
              if (e.target.value.trim() !== room.name) {
                startTransition(() => updateRoomName(room.id, e.target.value));
              }
            }}
            className="min-w-0 flex-1 rounded-lg border border-transparent bg-chip px-2.5 py-1.5 text-sm font-semibold outline-none transition-colors hover:border-border focus:border-accent focus:bg-surface"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleDelete(room.id, room.name)}
            className="whitespace-nowrap text-xs font-semibold text-danger disabled:opacity-50"
          >
            Entfernen
          </button>
        </div>
      ))}

      <div className="mt-1 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Neuer Raum"
          className="min-w-0 flex-1 rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm outline-none"
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
    </section>
  );
}
