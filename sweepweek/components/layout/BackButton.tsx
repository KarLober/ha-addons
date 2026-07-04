"use client";

export function BackButton({
  enabled,
  targetPath,
}: {
  enabled: boolean;
  targetPath?: string;
}) {
  if (!enabled) return null;

  function handleClick() {
    const hasParent = window.parent && window.parent !== window;

    if (targetPath) {
      // browser_mod (a common custom HA integration) lets ingress content
      // ask the outer HA frontend to navigate - works even if same-origin
      // access to window.parent is restricted. Harmless no-op if the
      // integration isn't installed.
      try {
        if (hasParent) {
          window.parent.postMessage(
            {
              type: "call-service",
              domain: "browser_mod",
              service: "navigate",
              service_data: { path: targetPath },
            },
            "*",
          );
        }
      } catch {}
      try {
        if (hasParent) {
          window.parent.location.href = targetPath;
          return;
        }
      } catch {}
      window.location.href = targetPath;
      return;
    }

    try {
      if (hasParent) {
        window.parent.history.back();
        return;
      }
    } catch {}
    window.history.back();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Zurück"
      className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-chip text-text"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 5L8 12L15 19"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
