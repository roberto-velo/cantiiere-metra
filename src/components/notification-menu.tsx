
"use client";

import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Bell, Trash2 } from "lucide-react";
import { SheetHeader, SheetTitle } from "./ui/sheet";

export function NotificationMenu() {
  const { notifications, getIcon, clearNotifications } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
          <span className="sr-only">Notifiche</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <SheetHeader>
            <SheetTitle className="sr-only">Notifiche</SheetTitle>
        </SheetHeader>
        <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifiche Recenti</span>
            {notifications.length > 0 && (
                 <Button variant="ghost" size="sm" onClick={clearNotifications}>
                    <Trash2 className="h-4 w-4 mr-1"/>
                    Pulisci
                 </Button>
            )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map((n) => {
            const Icon = getIcon(n.type);
            return (
              <DropdownMenuItem key={n.id} className="flex items-start gap-3">
                <Icon className="h-4 w-4 mt-1 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{n.text}</span>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </div>
              </DropdownMenuItem>
            );
          })
        ) : (
          <DropdownMenuItem disabled>Nessuna notifica</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
