
"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DayPicker, type DateFormatter, type DayProps } from "react-day-picker";
import { it } from 'date-fns/locale';
import { parseISO, format, isSameDay } from 'date-fns';
import { cn } from "@/lib/utils";
import { type Task, type TaskStatus, type Client } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tasksByDate = tasks.reduce((acc, task) => {
    try {
        const taskDate = parseISO(task.date);
        const taskDateStr = format(taskDate, 'yyyy-MM-dd');
        if (!acc[taskDateStr]) {
        acc[taskDateStr] = [];
        }
        acc[taskDateStr].push(task);
    } catch (e) {
        console.error(`Invalid date format for task ${task.id}: ${task.date}`);
    }
    return acc;
  }, {} as Record<string, Task[]>);

  const formatCaption: DateFormatter = (date, options) => {
    return format(date, 'LLLL yyyy', { locale: options?.locale });
  };

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', dateStr);
    params.delete('range'); 
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const DayContent = (props: DayProps) => {
    const dateStr = format(props.date, 'yyyy-MM-dd');
    const tasksForDay = tasksByDate[dateStr] || [];

    const dayNumber = format(props.date, 'd');
    
    if (tasksForDay.length > 0) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative w-full h-full flex items-center justify-center cursor-pointer">
              <span>{dayNumber}</span>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {tasksForDay.slice(0, 4).map(task => (
                      <div key={task.id} className={cn("h-1.5 w-1.5 rounded-full", statusBadgeColors[task.status])}></div>
                  ))}
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Attività del {format(props.date, 'dd/MM/yyyy')}</h4>
                <p className="text-sm text-muted-foreground">
                  {tasksForDay.length} attività pianificate.
                </p>
              </div>
              <div className="grid gap-2">
                 {tasksForDay.map(task => {
                    const client = clients.find(c => c.id === task.clientId);
                    return (
                        <div key={task.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                             <span className={cn("flex h-2 w-2 translate-y-1 rounded-full", statusBadgeColors[task.status])} />
                             <div className="grid gap-1">
                                <p className="text-sm font-medium leading-none">{task.description}</p>
                                <p className="text-sm text-muted-foreground">
                                    {client?.name || 'Cliente non trovato'} - {task.time}
                                </p>
                            </div>
                        </div>
                    )
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      );
    }
    
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{dayNumber}</span>
      </div>
    );
  };
  
  const selectedDateParam = searchParams.get('date');
  const selectedDate = selectedDateParam ? parseISO(selectedDateParam) : undefined;
  
  const modifiers = {
      selected: selectedDate,
  };
  const modifiersClassNames = {
      selected: 'bg-primary text-primary-foreground',
  };


  return (
    <DayPicker
      locale={it}
      mode="single"
      onDayClick={handleDayClick}
      selected={selectedDate}
      formatters={{ formatCaption }}
      components={{
        Day: DayContent
      }}
      className="w-full"
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-24 w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_wrapper: "h-full w-full p-2 font-normal flex items-start justify-center hover:bg-accent rounded-md cursor-pointer",
        day: "h-full w-full",
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

