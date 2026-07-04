import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { RoomsSection } from "@/components/verwaltung/RoomsSection";
import { TasksSection } from "@/components/verwaltung/TasksSection";
import { UsersSection } from "@/components/verwaltung/UsersSection";
import { ExportImportSection } from "@/components/verwaltung/ExportImportSection";
import { getAllTasksForManage, getRooms, getUsers } from "@/lib/db/queries";
import { resolveCurrentUser } from "@/lib/current-user";
import { getBackButtonConfig } from "@/lib/back-button-config";

export const dynamic = "force-dynamic";

export default async function VerwaltungPage() {
  const [rooms, tasks, users] = await Promise.all([
    getRooms(),
    getAllTasksForManage(),
    getUsers(),
  ]);
  const currentUser = await resolveCurrentUser(users);
  const { backButtonEnabled, backButtonPath } = getBackButtonConfig();

  return (
    <>
      <ScreenHeader
        title="Verwaltung"
        backButtonEnabled={backButtonEnabled}
        backButtonPath={backButtonPath}
      />
      <div className="px-5 pb-6">
        <div className="mb-3.5 rounded-xl border border-border bg-surface px-3.5 py-3">
          <div className="text-xs text-text-secondary">Angemeldet als</div>
          <div className="text-sm font-semibold">
            {currentUser?.name ?? "Nicht erkannt"}
          </div>
        </div>

        <ExportImportSection />

        <RoomsSection rooms={rooms} />
        <TasksSection tasks={tasks} rooms={rooms} />
        <UsersSection users={users} />
      </div>
    </>
  );
}
