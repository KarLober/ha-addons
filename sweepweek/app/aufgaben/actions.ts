"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { completions, completionParticipants } from "@/lib/db/schema";

export async function completeTask(
  taskId: number,
  userIds: number[],
  completedAtIso: string,
  note?: string,
) {
  if (userIds.length === 0) {
    throw new Error("Mindestens eine Person muss ausgewählt sein.");
  }

  const completedAt = new Date(`${completedAtIso}T12:00:00`);
  if (Number.isNaN(completedAt.getTime())) {
    throw new Error("Ungültiges Datum.");
  }

  db.transaction((tx) => {
    const completion = tx
      .insert(completions)
      .values({ taskId, completedAt, note: note?.trim() || null })
      .returning()
      .get();

    tx.insert(completionParticipants)
      .values(userIds.map((userId) => ({ completionId: completion.id, userId })))
      .run();
  });

  revalidatePath("/aufgaben");
  revalidatePath("/statistik");
}
