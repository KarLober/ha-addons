"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 5000;

export function PollRefresh() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
