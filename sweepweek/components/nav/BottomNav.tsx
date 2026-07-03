"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/aufgaben",
    label: "Aufgaben",
    icon: (color: string) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="6" r="1.8" fill={color} />
        <rect x="16" y="5" width="5" height="2" rx="1" fill={color} />
        <circle cx="12" cy="12" r="1.8" fill={color} />
        <rect x="16" y="11" width="5" height="2" rx="1" fill={color} />
        <circle cx="12" cy="18" r="1.8" fill={color} />
        <rect x="16" y="17" width="5" height="2" rx="1" fill={color} />
      </svg>
    ),
  },
  {
    href: "/statistik",
    label: "Statistik",
    icon: (color: string) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="12" width="4" height="7" rx="1" fill={color} />
        <rect x="10.5" y="7" width="4" height="12" rx="1" fill={color} />
        <rect x="16" y="3" width="4" height="16" rx="1" fill={color} />
      </svg>
    ),
  },
  {
    href: "/verwaltung",
    label: "Verwaltung",
    icon: (color: string) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <line
          x1="4"
          y1="7"
          x2="20"
          y2="7"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="14" cy="7" r="2.2" fill="var(--color-nav-bg)" stroke={color} strokeWidth="2" />
        <line
          x1="4"
          y1="17"
          x2="20"
          y2="17"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="10" cy="17" r="2.2" fill="var(--color-nav-bg)" stroke={color} strokeWidth="2" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 flex border-t border-border bg-nav-bg pb-[env(safe-area-inset-bottom)]">
      {items.map((item) => {
        const active = pathname?.startsWith(item.href);
        const color = active ? "var(--color-accent)" : "var(--color-text-tertiary)";
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5"
          >
            {item.icon(color)}
            <span
              className="text-[11px] font-semibold"
              style={{ color }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
