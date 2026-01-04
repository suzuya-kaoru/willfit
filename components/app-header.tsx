"use client";

import { User } from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title = "WillFit" }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <Logo className="h-9 w-9" />
          <span className="text-xl font-bold tracking-tight">{title}</span>
        </div>
        <Avatar className="h-9 w-9 ring-2 ring-border/50 transition-all hover:ring-primary/50">
          <AvatarFallback className="bg-linear-to-br from-secondary to-muted text-secondary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
