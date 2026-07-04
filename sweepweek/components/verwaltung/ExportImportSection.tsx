"use client";

import { useRef, useState, useTransition } from "react";
import { exportConfig, importConfig } from "@/app/verwaltung/actions";

export function ExportImportSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [messageIsError, setMessageIsError] = useState(false);

  function handleExport() {
    startTransition(async () => {
      const data = await exportConfig();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sweepweek-daten.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      startTransition(async () => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const result = await importConfig(data);
          setMessageIsError(false);
          setMessage(
            `Import erfolgreich: ${result.roomsAdded} Räume, ${result.tasksAdded} Aufgaben, ${result.usersAdded} Nutzer neu; ${result.roomsUpdated + result.tasksUpdated} aktualisiert.`,
          );
        } catch (err) {
          setMessageIsError(true);
          setMessage(err instanceof Error ? err.message : "Ungültige Datei.");
        }
      });
    };
    reader.readAsText(file);
  }

  return (
    <section className="mb-8">
      {message && (
        <div
          className={`mb-2 rounded-lg px-3 py-2 text-[13px] ${
            messageIsError
              ? "bg-danger-bg text-danger"
              : "bg-chip text-text-secondary"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={handleExport}
          className="flex-1 rounded-[10px] bg-chip py-2.5 text-[13px] font-semibold disabled:opacity-50"
        >
          Exportieren
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 rounded-[10px] bg-chip py-2.5 text-[13px] font-semibold disabled:opacity-50"
        >
          Importieren
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImportFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </section>
  );
}
