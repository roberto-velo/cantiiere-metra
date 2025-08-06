
"use client";

import { useState } from "react";
import type { TaskStatus } from "@/lib/types";
import { TaskTimer } from "./task-timer";
import { updateTaskStatusAction } from "@/lib/actions";


export function TaskTimerWrapper({ taskId, initialStatus }: { taskId: string, initialStatus: TaskStatus }) {
  const [status, setStatus] = useState<TaskStatus>(initialStatus);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setStatus(newStatus);
    // We call the server action, but don't need to block/wait for the UI.
    // Error handling can be added here if needed.
    await updateTaskStatusAction(taskId, newStatus);
  };

  return <TaskTimer initialStatus={status} onStatusChange={handleStatusChange} />;
}
