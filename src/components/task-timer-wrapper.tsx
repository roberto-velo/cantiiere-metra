
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
        addNotification(`Attività #${taskId.slice(-4)} avviata`, 'task-started');
    }
  };

  const handleComplete = async (duration: number) => {
    setStatus('Completato');
    await updateTaskDurationAction(taskId, duration);
    addNotification(`Attività #${taskId.slice(-4)} completata`, 'task-completed');
  };

  return <TaskTimer 
            initialStatus={status} 
            initialDuration={initialDuration}
            onStatusChange={handleStatusChange}
            onComplete={handleComplete} 
          />;
}

    