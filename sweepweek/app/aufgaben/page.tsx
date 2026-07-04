import { TasksScreen } from "@/components/aufgaben/TasksScreen";
import { getActiveTasksWithStatus, getRooms, getUsers } from "@/lib/db/queries";
import { resolveCurrentUser } from "@/lib/current-user";
import { getBackButtonConfig } from "@/lib/back-button-config";

export const dynamic = "force-dynamic";

export default async function AufgabenPage() {
  const [tasks, rooms, users] = await Promise.all([
    getActiveTasksWithStatus(),
    getRooms(),
    getUsers(),
  ]);
  const currentUser = await resolveCurrentUser(users);
  const { backButtonEnabled, backButtonPath } = getBackButtonConfig();

  return (
    <TasksScreen
      tasks={tasks}
      rooms={rooms}
      users={users}
      currentUserId={currentUser?.id ?? null}
      backButtonEnabled={backButtonEnabled}
      backButtonPath={backButtonPath}
    />
  );
}
