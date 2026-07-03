import { TasksScreen } from "@/components/aufgaben/TasksScreen";
import { getActiveTasksWithStatus, getRooms, getUsers } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function AufgabenPage() {
  const [tasks, rooms, users] = await Promise.all([
    getActiveTasksWithStatus(),
    getRooms(),
    getUsers(),
  ]);

  return <TasksScreen tasks={tasks} rooms={rooms} users={users} />;
}
