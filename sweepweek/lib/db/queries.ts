import { asc, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { tasks, rooms, users, completions } from "./schema";
import { computeTaskStatus, formatDueText, type TaskStatus } from "@/lib/status";

export type TaskWithStatus = {
  id: number;
  name: string;
  description: string | null;
  intervalDays: number;
  roomId: number;
  roomName: string;
  status: TaskStatus;
  dueText: string;
};

export async function getActiveTasksWithStatus(): Promise<TaskWithStatus[]> {
  const rows = await db.query.tasks.findMany({
    where: eq(tasks.active, true),
    with: { room: true, completions: true },
    orderBy: [asc(tasks.sortOrder)],
  });

  return rows.map((task) => {
    const lastDone = task.completions.length
      ? new Date(
          Math.max(...task.completions.map((c) => c.completedAt.getTime())),
        )
      : null;
    const status = computeTaskStatus(task.intervalDays, lastDone);
    return {
      id: task.id,
      name: task.name,
      description: task.description,
      intervalDays: task.intervalDays,
      roomId: task.roomId,
      roomName: task.room.name,
      status,
      dueText: formatDueText(status.daysUntil),
    };
  });
}

export async function getRooms() {
  return db.query.rooms.findMany({ orderBy: [asc(rooms.sortOrder)] });
}

export async function getUsers() {
  return db.query.users.findMany({ orderBy: [asc(users.id)] });
}

export type ManageTask = {
  id: number;
  name: string;
  intervalDays: number;
  active: boolean;
  roomId: number;
  roomName: string;
};

export async function getAllTasksForManage(): Promise<ManageTask[]> {
  const rows = await db.query.tasks.findMany({
    with: { room: true },
    orderBy: [asc(tasks.sortOrder)],
  });

  return rows.map((t) => ({
    id: t.id,
    name: t.name,
    intervalDays: t.intervalDays,
    active: t.active,
    roomId: t.roomId,
    roomName: t.room.name,
  }));
}

export type TimelineEntry = {
  id: number;
  date: Date;
  taskName: string;
  roomName: string;
  personLabel: string;
};

export async function getTimeline(limit = 30): Promise<TimelineEntry[]> {
  const rows = await db.query.completions.findMany({
    orderBy: [desc(completions.completedAt)],
    limit,
    with: {
      task: { with: { room: true } },
      participants: { with: { user: true } },
    },
  });

  return rows.map((c) => {
    const names = c.participants.map((p) => p.user.name);
    const personLabel = names.length > 1 ? "Zusammen" : (names[0] ?? "");
    return {
      id: c.id,
      date: c.completedAt,
      taskName: c.task.name,
      roomName: c.task.room.name,
      personLabel,
    };
  });
}

export type UserStat = {
  id: number;
  name: string;
  color: string;
  count: number;
};

export async function getUserStats(): Promise<{
  userStats: UserStat[];
  togetherCount: number;
}> {
  const allUsers = await db.query.users.findMany({ orderBy: [asc(users.id)] });
  const allCompletions = await db.query.completions.findMany({
    with: { participants: true },
  });

  const counts = new Map<number, number>();
  allUsers.forEach((u) => counts.set(u.id, 0));
  let togetherCount = 0;

  allCompletions.forEach((c) => {
    if (c.participants.length > 1) togetherCount++;
    c.participants.forEach((p) =>
      counts.set(p.userId, (counts.get(p.userId) ?? 0) + 1),
    );
  });

  return {
    userStats: allUsers.map((u) => ({
      id: u.id,
      name: u.name,
      color: u.color,
      count: counts.get(u.id) ?? 0,
    })),
    togetherCount,
  };
}
