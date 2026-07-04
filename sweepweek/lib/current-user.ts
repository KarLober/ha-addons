import { headers } from "next/headers";

export async function resolveCurrentUser<T extends { name: string }>(
  users: T[],
): Promise<T | null> {
  const h = await headers();
  const candidates = [
    h.get("x-remote-user-name"),
    h.get("x-remote-user-display-name"),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const match = users.find(
      (u) => u.name.trim().toLowerCase() === candidate.trim().toLowerCase(),
    );
    if (match) return match;
  }

  return null;
}
