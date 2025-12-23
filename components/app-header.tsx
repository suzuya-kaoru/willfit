"use client";

import { Dumbbell, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title = "WillFit" }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">{title}</span>
        </div>
        <Avatar className="h-9 w-9 ring-2 ring-border/50 transition-all hover:ring-primary/50">
          <AvatarFallback className="bg-gradient-to-br from-secondary to-muted text-secondary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
