"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Square, Timer } from "lucide-react";
import type { TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";


interface TaskTimerProps {
  initialStatus: TaskStatus;
  initialDuration?: number;
  onStatusChange: (newStatus: TaskStatus) => void;
  onComplete: (duration: number) => void;
  onPause: () => void;
}

const statusColors: Record<TaskStatus, string> = {
    Pianificato: "bg-muted",
    "In corso": "bg-orange-500/20 text-orange-700",
    Completato: "bg-green-500/20 text-green-700",
}


export function TaskTimer({ initialStatus, initialDuration = 0, onStatusChange, onComplete, onPause }: TaskTimerProps) {
  const [seconds, setSeconds] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  
  const isCompleted = status === 'Completato';
  
  // Set initial state for timer based on task status
  useEffect(() => {
    setStatus(initialStatus);
    setSeconds(initialDuration);
    // if task is "In corso" when page loads, but timer is not running, it means it's paused.
    if (initialStatus === "In corso") {
        setIsRunning(false); 
    }
  }, [initialStatus, initialDuration]);

  // Timer interval logic
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
    if (isCompleted) return;

    setIsRunning(true);
    if (status === 'Pianificato') {
      const newStatus = 'In corso';
      setStatus(newStatus);
      onStatusChange(newStatus);
    }
  }, [status, onStatusChange, isCompleted]);

  const handlePause = useCallback(() => {
    if (isCompleted || !isRunning) return;
    setIsRunning(false);
    onPause();
  }, [onPause, isCompleted, isRunning]);

  const handleComplete = useCallback(() => {
    if(isCompleted) return;
    setIsRunning(false);
    const newStatus: TaskStatus = 'Completato';
    setStatus(newStatus);
    onComplete(seconds);
  }, [onComplete, seconds, isCompleted]);


  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };
  
  const timerBgColor = isRunning ? statusColors["In corso"] : statusColors[status];
  const canTerminate = status === 'In corso' && (isRunning || seconds > 0);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Cronometro Attività
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className={cn(
            "text-4xl font-bold font-mono rounded-md p-4 transition-colors duration-300", 
            timerBgColor
        )}>
          {formatTime(seconds)}
        </div>
        <div className="flex justify-center gap-2">
          {!isRunning ? (
            <Button onClick={handleStart} disabled={isCompleted}>
              <Play className="mr-2" />
              {status === 'In corso' ? 'Riprendi' : 'Inizia'}
            </Button>
          ) : (
            <Button onClick={handlePause} variant="outline">
              <Pause className="mr-2" />
              Pausa
            </Button>
          )}
          <Button onClick={handleComplete} variant="destructive" disabled={isCompleted || !canTerminate}>
            <Square className="mr-2" />
            Termina
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
