
"use client";

import { useState } from "react";
import localApi from "@/lib/data";
import type { TaskStatus } from "@/lib/types";
import { TaskTimer } from "./task-timer";


export function TaskTimerWrapper({ taskId, initialStatus }: { taskId: string, initialStatus: TaskStatus }) {
  const [status, setStatus] = useState<TaskStatus>(initialStatus);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setStatus(newStatus);
    await localApi.updateTaskStatus(taskId, newStatus);
  };

  return <TaskTimer initialStatus={status} onStatusChange={handleStatusChange} />;
}
