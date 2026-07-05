"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { completions } from "@/lib/db/schema";

export async function deleteCompletion(id: number) {
  db.delete(completions).where(eq(completions.id, id)).run();

  revalidatePath("/aufgaben");
  revalidatePath("/statistik");
}
