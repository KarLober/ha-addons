export type UrgencyBucket = "overdue" | "soon" | "planned";

export type TaskStatus = {
  lastDone: Date | null;
  nextDue: Date;
  daysUntil: number;
  bucket: UrgencyBucket;
};

export const BUCKET_LABELS: Record<UrgencyBucket, string> = {
  overdue: "Überfällig",
  soon: "Bald fällig",
  planned: "Im Plan",
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function diffInDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}

function bucketForDays(daysUntil: number): UrgencyBucket {
  if (daysUntil < 0) return "overdue";
  if (daysUntil <= 3) return "soon";
  return "planned";
}

export function computeTaskStatus(
  intervalDays: number,
  lastDone: Date | null,
  today: Date = new Date(),
): TaskStatus {
  const todayMidnight = startOfDay(today);

  if (lastDone === null) {
    return {
      lastDone: null,
      nextDue: todayMidnight,
      daysUntil: 0,
      bucket: bucketForDays(0),
    };
  }

  const lastDoneMidnight = startOfDay(lastDone);
  const nextDue = addDays(lastDoneMidnight, intervalDays);
  const daysUntil = diffInDays(nextDue, todayMidnight);

  return {
    lastDone: lastDoneMidnight,
    nextDue,
    daysUntil,
    bucket: bucketForDays(daysUntil),
  };
}

export function formatDueText(daysUntil: number): string {
  if (daysUntil < 0) {
    const n = -daysUntil;
    return `${n} Tag${n === 1 ? "" : "e"} überfällig`;
  }
  if (daysUntil === 0) return "Heute fällig";
  if (daysUntil === 1) return "Morgen fällig";
  return `in ${daysUntil} Tagen fällig`;
}
