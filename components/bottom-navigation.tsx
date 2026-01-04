"use client";

import { BarChart3, Calendar, Home, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/schedule", label: "スケジュール", icon: Calendar },
  { href: "/analytics", label: "分析", icon: BarChart3 },
  { href: "/settings", label: "設定", icon: Settings },
];

export function BottomNavigation() {
  const pathname = usePathname();

  // Hide navigation during active workout
  if (pathname.startsWith("/workout/")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/20">
      <div className="mx-auto max-w-md px-2 pb-safe">
        <div className="flex h-16 items-center justify-around rounded-t-2xl bg-card shadow-lg border-t border-x border-border/50">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-5 py-2 transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                    isActive && "bg-primary/15",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-all",
                      isActive && "scale-110",
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium transition-all",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -top-0.5 h-0.5 w-8 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
