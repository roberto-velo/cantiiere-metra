
"use client";

import { useState } from "react";
import type { TaskStatus } from "@/lib/types";
import { TaskTimer } from "./task-timer";
import { updateTaskStatusAction, updateTaskDurationAction } from "@/lib/actions";
import { useNotifications } from "@/hooks/use-notifications";

export function TaskTimerWrapper({ taskId, initialStatus, initialDuration }: { taskId: string, initialStatus: TaskStatus, initialDuration?: number }) {
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const { addNotification } = useNotifications();

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setStatus(newStatus);
    await updateTaskStatusAction(taskId, newStatus);
    
    if (newStatus === 'In corso') {
        addNotification(`Attività ${taskId} avviata`, 'task-started');
    } else if (newStatus === 'Completato') {
        // This is handled by onComplete to include duration
    } else {
        // Potentially handle 'Paused' status if it exists.
        addNotification(`Attività ${taskId} in pausa`, 'task-paused');
    }
  };

  const handleComplete = async (duration: number) => {
    setStatus('Completato');
    await updateTaskDurationAction(taskId, duration);
    addNotification(`Attività ${taskId} completata`, 'task-completed');
  };

  return <TaskTimer 
            initialStatus={status} 
            initialDuration={initialDuration}
            onStatusChange={handleStatusChange}
            onComplete={handleComplete} 
          />;
}
