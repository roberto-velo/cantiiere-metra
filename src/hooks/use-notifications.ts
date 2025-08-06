
"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { PlusCircle, Play, Pause, CheckCircle, LucideIcon } from 'lucide-react';

export type NotificationType = 'task-created' | 'task-started' | 'task-paused' | 'task-completed';

export interface Notification {
  id: string;
  text: string;
  time: string;
  type: NotificationType;
  color: string;
}

const NOTIFICATIONS_KEY = "cantiereflow-notifications";
const MAX_NOTIFICATIONS = 10;

const iconMap: Record<NotificationType, LucideIcon> = {
    'task-created': PlusCircle,
    'task-started': Play,
    'task-paused': Pause,
    'task-completed': CheckCircle
};
const colorMap: Record<NotificationType, string> = {
    'task-created': 'text-primary',
    'task-started': 'text-blue-500',
    'task-paused': 'text-orange-500',
    'task-completed': 'text-green-500'
};


export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // This effect runs only on the client side
    try {
      const storedNotifications = localStorage.getItem(NOTIFICATIONS_KEY);
      if (storedNotifications) {
        // Recalculate relative time on load
        const parsed = JSON.parse(storedNotifications) as {id: string; text: string; isoTime: string, type: NotificationType}[];
        const updated = parsed.map(n => ({
            ...n,
            time: formatDistanceToNow(new Date(n.isoTime), { addSuffix: true, locale: it }),
            color: colorMap[n.type]
        }));
        setNotifications(updated);
      }
    } catch (error) {
        console.error("Failed to read notifications from localStorage", error);
    }
  }, []);

  const addNotification = useCallback((text: string, type: NotificationType) => {
    // This function can be called from client components
    try {
      const newNotification = {
        id: crypto.randomUUID(),
        text,
        isoTime: new Date().toISOString(),
        type,
      };

      setNotifications((prev) => {
        const updatedNotifications = [newNotification, ...prev]
            .slice(0, MAX_NOTIFICATIONS)
            .map(n => ({
                ...n,
                time: formatDistanceToNow(new Date(n.isoTime), { addSuffix: true, locale: it }),
                color: colorMap[n.type]
            }));

        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications.map(n => ({id: n.id, text: n.text, isoTime: n.isoTime, type: n.type}))));
        return updatedNotifications;
      });
    } catch (error) {
        console.error("Failed to save notification to localStorage", error);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    try {
      localStorage.removeItem(NOTIFICATIONS_KEY);
      setNotifications([]);
    } catch (error) {
        console.error("Failed to clear notifications from localStorage", error);
    }
  }, []);
  
  const getIcon = (type: NotificationType): LucideIcon => {
    return iconMap[type] || Bell;
  }

  return { notifications, addNotification, clearNotifications, getIcon };
}
