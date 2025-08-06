
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
import { useState, useEffect } from "react";

export function NotificationMenu() {
  const { notifications, getIcon, clearNotifications } = useNotifications();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This hook only runs on the client, after the component has mounted.
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render a placeholder or nothing on the server
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Notifiche</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
             <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {notifications.length}
            </span>
          )}
          <span className="sr-only">Notifiche</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
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
