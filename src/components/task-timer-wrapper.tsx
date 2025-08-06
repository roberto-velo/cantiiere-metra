
"use client";

import { useState } from "react";
import type { TaskStatus } from "@/lib/types";
import { TaskTimer } from "./task-timer";
import { updateTaskStatusAction, updateTaskDurationAction } from "@/lib/actions";

export function TaskTimerWrapper({ taskId, initialStatus, initialDuration }: { taskId: string, initialStatus: TaskStatus, initialDuration?: number }) {
  const [status, setStatus] = useState<TaskStatus>(initialStatus);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setStatus(newStatus);
    await updateTaskStatusAction(taskId, newStatus);
  };

  const handleComplete = async (duration: number) => {
    setStatus('Completato');
    await updateTaskDurationAction(taskId, duration);
  };

  return <TaskTimer 
            initialStatus={status} 
            initialDuration={initialDuration}
            onStatusChange={handleStatusChange}
            onComplete={handleComplete} 
          />;
}
