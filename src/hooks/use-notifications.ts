
"use client";

import { useSyncExternalStore, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { PlusCircle, Play, Pause, CheckCircle, LucideIcon, Bell } from 'lucide-react';

export type NotificationType = 'task-created' | 'task-started' | 'task-paused' | 'task-completed';

export interface Notification {
  id: string;
  text: string;
  time: string;
  isoTime: string;
  type: NotificationType;
  color: string;
}

const NOTIFICATIONS_KEY = "cantiereflow-notifications";
const MAX_NOTIFICATIONS = 20;

const iconMap: Record<NotificationType, LucideIcon> = {
    'task-created': PlusCircle,
    'task-started': Play,
    'task-paused': Pause,
    'task-completed': CheckCircle
};

const colorMap: Record<NotificationType, string> = {
    'task-created': 'text-blue-500',
    'task-started': 'text-orange-500',
    'task-paused': 'text-yellow-500',
    'task-completed': 'text-green-500'
};


// --- Store ---
type NotificationStore = {
  notifications: Notification[];
}

let store: NotificationStore = {
  notifications: [],
};

const listeners = new Set<() => void>();

const emitChange = () => {
  for (const listener of listeners) {
    listener();
  }
}

const subscribe = (callback: () => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

const getSnapshot = () => {
  return store;
}

// --- Actions ---

const updateNotifications = (newNotifications: Notification[]) => {
    store = { notifications: newNotifications };
    try {
        const storableNotifications = newNotifications.map(n => ({
            id: n.id, 
            text: n.text, 
            isoTime: n.isoTime, 
            type: n.type
        }));
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(storableNotifications));
    } catch (error) {
        console.error("Failed to save notifications to localStorage", error);
    }
    emitChange();
}


export const notificationsApi = {
  add: (text: string, type: NotificationType) => {
    const newNotificationRaw = {
      id: crypto.randomUUID(),
      text,
      isoTime: new Date().toISOString(),
      type,
    };
    
    // Using a functional update to ensure we have the latest state
    const currentNotifications = getSnapshot().notifications;
    const updatedNotifications = [newNotificationRaw, ...currentNotifications]
      .slice(0, MAX_NOTIFICATIONS)
      .map(n => ({
        ...n,
        time: formatDistanceToNow(new Date(n.isoTime), { addSuffix: true, locale: it }),
        color: colorMap[n.type] || 'text-primary',
      }));

    updateNotifications(updatedNotifications);
  },

  clear: () => {
    try {
      localStorage.removeItem(NOTIFICATIONS_KEY);
      updateNotifications([]);
    } catch (error) {
        console.error("Failed to clear notifications from localStorage", error);
    }
  },

  load: () => {
     try {
      const storedNotifications = localStorage.getItem(NOTIFICATIONS_KEY);
      if (storedNotifications) {
        const parsed = JSON.parse(storedNotifications) as {id: string; text: string; isoTime: string, type: NotificationType}[];
        const loadedNotifications = parsed.map(n => ({
            ...n,
            time: formatDistanceToNow(new Date(n.isoTime), { addSuffix: true, locale: it }),
            color: colorMap[n.type] || 'text-primary'
        }));
        store = { notifications: loadedNotifications };
        emitChange();
      }
    } catch (error) {
        console.error("Failed to read notifications from localStorage", error);
    }
  }
}

// --- Hook ---

export function useNotifications() {
  const storeSnapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  
  // Load initial data only once on the client
  useEffect(() => {
    if (typeof window !== "undefined") {
      notificationsApi.load();
    }
  }, []);

  const getIcon = (type: NotificationType): LucideIcon => {
    return iconMap[type] || Bell;
  }

  return { 
    notifications: storeSnapshot.notifications, 
    addNotification: notificationsApi.add,
    clearNotifications: notificationsApi.clear,
    getIcon 
  };
}
