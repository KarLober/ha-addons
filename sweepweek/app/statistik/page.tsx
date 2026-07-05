import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Timeline } from "@/components/statistik/Timeline";
import { getTimeline, getUserStats } from "@/lib/db/queries";
import { getBackButtonConfig } from "@/lib/back-button-config";

export const dynamic = "force-dynamic";

export default async function StatistikPage() {
  const [{ userStats, togetherCount }, timeline] = await Promise.all([
    getUserStats(),
    getTimeline(30),
  ]);
  const { backButtonEnabled, backButtonPath } = getBackButtonConfig();

  const maxCount = Math.max(1, ...userStats.map((u) => u.count), togetherCount);

  return (
    <>
      <ScreenHeader
        title="Statistik"
        backButtonEnabled={backButtonEnabled}
        backButtonPath={backButtonPath}
      />

      <div className="px-5 pb-6">
        <div className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-text-secondary">
          Verteilung
        </div>
        <div className="rounded-2xl border border-border bg-surface p-[18px]">
          {userStats.map((user) => (
            <div key={user.id} className="mb-3.5 last:mb-0">
              <div className="mb-1.5 flex items-center justify-between text-sm font-semibold">
                <span>{user.name}</span>
                <span className="font-semibold text-text-secondary">
                  {user.count}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-chip">
                <div
                  className="h-full rounded-full transition-[width]"
                  style={{
                    width: `${Math.round((user.count / maxCount) * 100)}%`,
                    background: user.color,
                  }}
                />
              </div>
            </div>
          ))}
          <div className="mt-2.5 flex justify-between border-t border-border-soft pt-2.5 text-[13px] text-text-secondary">
            <span>Zusammen erledigt</span>
            <span className="font-semibold">{togetherCount}</span>
          </div>
        </div>

        <div className="mb-2.5 mt-7 text-[13px] font-bold uppercase tracking-wide text-text-secondary">
          Verlauf
        </div>
        <Timeline entries={timeline} />
      </div>
    </>
  );
}
