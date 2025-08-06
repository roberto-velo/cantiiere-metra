
"use client";

import { useState } from "react";
import { DayPicker, type DateFormatter } from "react-day-picker";
import { it } from 'date-fns/locale';
import { parseISO, format } from 'date-fns';
import { cn } from "@/lib/utils";
import { type Task, type TaskStatus, type Client } from "@/lib/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { Button } from "./ui/button";

interface TaskCalendarProps {
  tasks: Task[];
  clients: Client[];
}

const statusBadgeColors: Record<TaskStatus, string> = {
  Pianificato: "bg-blue-500",
  "In corso": "bg-orange-500",
  Completato: "bg-green-500",
};

export function TaskCalendar({ tasks, clients }: TaskCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const tasksByDate = tasks.reduce((acc, task) => {
    const taskDateStr = format(parseISO(task.date), 'yyyy-MM-dd');
    if (!acc[taskDateStr]) {
      acc[taskDateStr] = [];
    }
    acc[taskDateStr].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const formatCaption: DateFormatter = (date, options) => {
    return format(date, 'LLLL yyyy', { locale: options?.locale });
  };
  
  const DayContent = (props: { date: Date }) => {
    const dateStr = format(props.date, 'yyyy-MM-dd');
    const tasksForDay = tasksByDate[dateStr] || [];

    if (tasksForDay.length === 0) {
      return <>{format(props.date, 'd')}</>;
    }

    return (
       <Popover>
        <PopoverTrigger asChild>
            <div className="relative w-full h-full flex items-center justify-center">
                <span>{format(props.date, 'd')}</span>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {tasksForDay.slice(0, 3).map(task => (
                        <div key={task.id} className={cn("h-1.5 w-1.5 rounded-full", statusBadgeColors[task.status])}></div>
                    ))}
                </div>
            </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
            <div className="grid gap-4">
                <div className="space-y-2">
                    <h4 className="font-medium leading-none">Attività del {format(props.date, 'PPP', {locale: it})}</h4>
                </div>
                <div className="grid gap-2">
                   {tasksForDay.map(task => {
                    const client = clients.find(c => c.id === task.clientId);
                    return (
                     <div key={task.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:pb-0">
                        <span className={cn("flex h-2 w-2 translate-y-1 rounded-full", statusBadgeColors[task.status])} />
                        <div className="grid gap-1">
                            <p className="font-medium">{task.description}</p>
                            <p className="text-sm text-muted-foreground">
                                {client?.name ? (
                                    <>
                                        Cliente: {client.name}
                                        <br/>
                                        Ore: {task.time}
                                    </>
                                ) : (
                                    `Ore: ${task.time}`
                                )}
                            </p>
                            <Button variant="link" size="sm" asChild className="p-0 h-auto justify-start">
                                <Link href={`/attivita/${task.id}`}>Visualizza Dettagli</Link>
                            </Button>
                        </div>
                    </div>
                   )})}
                </div>
            </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <DayPicker
      locale={it}
      mode="single"
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      formatters={{ formatCaption }}
      components={{
        DayContent: DayContent
      }}
      className="w-full"
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-24 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-full w-full p-2 font-normal aria-selected:opacity-100 flex items-start justify-center"
        ),
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
      }}
    />
  );
}
