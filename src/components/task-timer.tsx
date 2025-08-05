"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Square, Timer } from "lucide-react";
import type { TaskStatus } from "@/lib/types";

interface TaskTimerProps {
  initialStatus: TaskStatus;
  onStatusChange: (newStatus: TaskStatus) => void;
}

export function TaskTimer({ initialStatus, onStatusChange }: TaskTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<TaskStatus>(initialStatus);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleStart = useCallback(() => {
    if (status !== 'Completato') {
      setIsRunning(true);
      if (status === 'Pianificato') {
        const newStatus = 'In corso';
        setStatus(newStatus);
        onStatusChange(newStatus);
      }
    }
  }, [status, onStatusChange]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    const newStatus = 'Completato';
    setStatus(newStatus);
    onStatusChange(newStatus);
  }, [onStatusChange]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const isCompleted = status === 'Completato';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Cronometro Attività
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="text-4xl font-bold font-mono bg-muted rounded-md p-4">
          {formatTime(seconds)}
        </div>
        <div className="flex justify-center gap-2">
          {!isRunning ? (
            <Button onClick={handleStart} disabled={isCompleted}>
              <Play className="mr-2" />
              Inizia
            </Button>
          ) : (
            <Button onClick={handlePause} variant="outline">
              <Pause className="mr-2" />
              Pausa
            </Button>
          )}
          <Button onClick={handleComplete} variant="destructive" disabled={isCompleted}>
            <Square className="mr-2" />
            Termina
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
