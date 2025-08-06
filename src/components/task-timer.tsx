
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

const statusStyles: Record<TaskStatus, { bg: string, text: string, pulse: boolean }> = {
    Pianificato: { bg: "bg-muted", text: "text-muted-foreground", pulse: false },
    "In corso": { bg: "bg-orange-500/10", text: "text-orange-500", pulse: true },
    Completato: { bg: "bg-green-500/10", text: "text-green-500", pulse: false },
}


export function TaskTimer({ initialStatus, initialDuration = 0, onStatusChange, onComplete, onPause }: TaskTimerProps) {
  const [seconds, setSeconds] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  
  const isCompleted = status === 'Completato';
  
  useEffect(() => {
    setStatus(initialStatus);
    setSeconds(initialDuration);
    if (initialStatus !== "In corso") {
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

    // Set running state immediately
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
  
  const currentStyle = isRunning ? statusStyles["In corso"] : statusStyles[status];
  const canTerminate = status === 'In corso' && (isRunning || seconds > 0);


  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Timer className="h-5 w-5" />
          Cronometro
        </CardTitle>
        <div className={cn("px-3 py-1 text-xs font-medium rounded-full transition-colors", currentStyle.bg, currentStyle.text)}>
            {isRunning ? 'In Corso' : status}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2 flex flex-col items-center justify-center gap-4">
        <div className="relative text-center">
             <div className={cn(
                "text-5xl font-bold font-sans tracking-tighter rounded-md py-1 transition-colors duration-300", 
                currentStyle.text
            )}>
              {formatTime(seconds)}
            </div>
            {isRunning && currentStyle.pulse && <div className="absolute inset-0 bg-orange-400/20 -z-10 rounded-full animate-pulse-slow"></div>}
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

