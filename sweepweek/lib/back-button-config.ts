// Only ever call this from genuine Server Component code (page.tsx files).
// ScreenHeader.tsx is reachable from a "use client" component too (TasksScreen),
// which means anything imported/executed there also runs in the browser -
// reading process.env there would silently read `undefined` client-side and
// cause a hydration mismatch against the server-rendered HTML.
export function getBackButtonConfig() {
  return {
    backButtonEnabled: process.env.BACK_BUTTON_ENABLED === "true",
    backButtonPath: process.env.BACK_BUTTON_PATH || undefined,
  };
}
