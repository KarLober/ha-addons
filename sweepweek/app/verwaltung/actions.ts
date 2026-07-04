"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { rooms, tasks, users } from "@/lib/db/schema";

const USER_COLORS = [
  "#5b7480",
  "#c9738a",
  "#b9832a",
  "#3f8f52",
  "#8fa9b6",
  "#9a7fc9",
];

function revalidateAll() {
  revalidatePath("/verwaltung");
  revalidatePath("/aufgaben");
  revalidatePath("/statistik");
}

function nextSortOrder(rows: { sortOrder: number }[]): number {
  return rows.reduce((max, r) => Math.max(max, r.sortOrder), -1) + 1;
}

// ---------- Räume ----------

export async function addRoom(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const existing = db.select({ sortOrder: rooms.sortOrder }).from(rooms).all();
  db.insert(rooms)
    .values({ name: trimmed, sortOrder: nextSortOrder(existing) })
    .run();
  revalidateAll();
}

export async function updateRoomName(id: number, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  db.update(rooms).set({ name: trimmed }).where(eq(rooms.id, id)).run();
  revalidateAll();
}

export async function deleteRoom(id: number) {
  try {
    db.delete(rooms).where(eq(rooms.id, id)).run();
  } catch {
    throw new Error(
      "Raum kann nicht gelöscht werden, solange ihm Aufgaben zugeordnet sind.",
    );
  }
  revalidateAll();
}

// ---------- Aufgaben ----------

export async function addTask(
  name: string,
  roomId: number,
  intervalDays: number,
) {
  const trimmed = name.trim();
  if (!trimmed || !roomId) return;
  const interval = Math.max(1, Math.floor(intervalDays) || 1);
  const existing = db.select({ sortOrder: tasks.sortOrder }).from(tasks).all();
  db.insert(tasks)
    .values({
      name: trimmed,
      roomId,
      intervalDays: interval,
      sortOrder: nextSortOrder(existing),
    })
    .run();
  revalidateAll();
}

export async function updateTaskName(id: number, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  db.update(tasks).set({ name: trimmed }).where(eq(tasks.id, id)).run();
  revalidateAll();
}

export async function updateTaskInterval(id: number, intervalDays: number) {
  const interval = Math.max(1, Math.floor(intervalDays) || 1);
  db.update(tasks).set({ intervalDays: interval }).where(eq(tasks.id, id)).run();
  revalidateAll();
}

export async function deleteTask(id: number) {
  db.delete(tasks).where(eq(tasks.id, id)).run();
  revalidateAll();
}

// ---------- Nutzer ----------

export async function addUser(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const existing = db.select({ color: users.color }).from(users).all();
  const color = USER_COLORS[existing.length % USER_COLORS.length];
  db.insert(users).values({ name: trimmed, color }).run();
  revalidateAll();
}

export async function updateUserName(id: number, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  db.update(users).set({ name: trimmed }).where(eq(users.id, id)).run();
  revalidateAll();
}

export async function deleteUser(id: number) {
  db.delete(users).where(eq(users.id, id)).run();
  revalidateAll();
}

// ---------- Export/Import ----------

export type ExportPayload = {
  version: 1;
  rooms: { name: string; icon: string | null; sortOrder: number }[];
  users: { name: string; color: string }[];
  tasks: {
    name: string;
    roomName: string;
    intervalDays: number;
    active: boolean;
    sortOrder: number;
  }[];
};

export async function exportConfig(): Promise<ExportPayload> {
  const allRooms = db.select().from(rooms).all();
  const allUsers = db.select().from(users).all();
  const allTasks = db.select().from(tasks).all();
  const roomNameById = new Map(allRooms.map((r) => [r.id, r.name]));

  return {
    version: 1,
    rooms: allRooms.map((r) => ({
      name: r.name,
      icon: r.icon,
      sortOrder: r.sortOrder,
    })),
    users: allUsers.map((u) => ({ name: u.name, color: u.color })),
    tasks: allTasks.map((t) => ({
      name: t.name,
      roomName: roomNameById.get(t.roomId) ?? "",
      intervalDays: t.intervalDays,
      active: t.active,
      sortOrder: t.sortOrder,
    })),
  };
}

export type ImportResult = {
  roomsAdded: number;
  roomsUpdated: number;
  tasksAdded: number;
  tasksUpdated: number;
  usersAdded: number;
};

function isImportPayload(data: unknown): data is ExportPayload {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return Array.isArray(d.rooms) && Array.isArray(d.users) && Array.isArray(d.tasks);
}

export async function importConfig(data: unknown): Promise<ImportResult> {
  if (!isImportPayload(data)) {
    throw new Error("Ungültige Datei: erwartetes Format nicht erkannt.");
  }

  const result: ImportResult = {
    roomsAdded: 0,
    roomsUpdated: 0,
    tasksAdded: 0,
    tasksUpdated: 0,
    usersAdded: 0,
  };

  db.transaction((tx) => {
    // Räume zusammenführen
    const existingRooms = tx.select().from(rooms).all();
    const roomIdByName = new Map(existingRooms.map((r) => [r.name, r.id]));
    let roomSort = nextSortOrder(existingRooms);

    for (const room of data.rooms) {
      const trimmed = room.name.trim();
      if (!trimmed) continue;
      const existingId = roomIdByName.get(trimmed);
      if (existingId !== undefined) {
        tx.update(rooms)
          .set({ icon: room.icon, sortOrder: room.sortOrder })
          .where(eq(rooms.id, existingId))
          .run();
        result.roomsUpdated++;
      } else {
        const inserted = tx
          .insert(rooms)
          .values({ name: trimmed, icon: room.icon, sortOrder: roomSort++ })
          .returning()
          .get();
        roomIdByName.set(trimmed, inserted.id);
        result.roomsAdded++;
      }
    }

    // Nutzer zusammenführen
    const existingUsers = tx.select().from(users).all();
    const existingUserNames = new Set(existingUsers.map((u) => u.name));
    let userColorCount = existingUsers.length;

    for (const user of data.users) {
      const trimmed = user.name.trim();
      if (!trimmed || existingUserNames.has(trimmed)) continue;
      const color = USER_COLORS[userColorCount % USER_COLORS.length];
      tx.insert(users).values({ name: trimmed, color }).run();
      existingUserNames.add(trimmed);
      userColorCount++;
      result.usersAdded++;
    }

    // Aufgaben zusammenführen (Abgleich über Name + Raumname)
    const existingTasks = tx
      .select({ id: tasks.id, name: tasks.name, roomId: tasks.roomId })
      .from(tasks)
      .all();
    const taskIdByKey = new Map(
      existingTasks.map((t) => [`${t.roomId}::${t.name}`, t.id]),
    );
    let taskSort = nextSortOrder(tx.select().from(tasks).all());

    for (const task of data.tasks) {
      const trimmed = task.name.trim();
      if (!trimmed) continue;
      const roomId = roomIdByName.get(task.roomName.trim());
      if (roomId === undefined) {
        throw new Error(
          `Aufgabe "${trimmed}" referenziert unbekannten Raum "${task.roomName}".`,
        );
      }
      const key = `${roomId}::${trimmed}`;
      const existingId = taskIdByKey.get(key);
      if (existingId !== undefined) {
        tx.update(tasks)
          .set({
            intervalDays: task.intervalDays,
            active: task.active,
            sortOrder: task.sortOrder,
          })
          .where(eq(tasks.id, existingId))
          .run();
        result.tasksUpdated++;
      } else {
        const inserted = tx
          .insert(tasks)
          .values({
            name: trimmed,
            roomId,
            intervalDays: Math.max(1, Math.floor(task.intervalDays) || 1),
            active: task.active,
            sortOrder: taskSort++,
          })
          .returning()
          .get();
        taskIdByKey.set(key, inserted.id);
        result.tasksAdded++;
      }
    }
  });

  revalidateAll();
  return result;
}
