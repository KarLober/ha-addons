import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { RoomsSection } from "@/components/verwaltung/RoomsSection";
import { TasksSection } from "@/components/verwaltung/TasksSection";
import { UsersSection } from "@/components/verwaltung/UsersSection";
import { getAllTasksForManage, getRooms, getUsers } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function VerwaltungPage() {
  const [rooms, tasks, users] = await Promise.all([
    getRooms(),
    getAllTasksForManage(),
    getUsers(),
  ]);

  return (
    <>
      <ScreenHeader title="Verwaltung" />
      <div className="px-5 pb-6">
        <RoomsSection rooms={rooms} />
        <TasksSection tasks={tasks} rooms={rooms} />
        <UsersSection users={users} />
      </div>
    </>
  );
}
