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

export async function updateTaskRoom(id: number, roomId: number) {
  db.update(tasks).set({ roomId }).where(eq(tasks.id, id)).run();
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
