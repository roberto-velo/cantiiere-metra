
"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DayPicker, type DateFormatter } from "react-day-picker";
import { it } from 'date-fns/locale';
import { parseISO, format } from 'date-fns';
import { cn } from "@/lib/utils";
import { type Task, type TaskStatus } from "@/lib/types";

interface TaskCalendarProps {
  tasks: Task[];
}

const statusBadgeColors: Record<TaskStatus, string> = {
  Pianificato: "bg-blue-500",
  "In corso": "bg-orange-500",
  Completato: "bg-green-500",
};

export function TaskCalendar({ tasks }: TaskCalendarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tasksByDate = tasks.reduce((acc, task) => {
    try {
        const taskDateStr = format(parseISO(task.date), 'yyyy-MM-dd');
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
    params.delete('range'); // Remove range filter when a specific date is selected
    router.push(`${pathname}?${params.toString()}`);
  };

  const DayContent = (props: { date: Date }) => {
    const dateStr = format(props.date, 'yyyy-MM-dd');
    const tasksForDay = tasksByDate[dateStr] || [];

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{format(props.date, 'd')}</span>
        {tasksForDay.length > 0 && (
           <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                {tasksForDay.slice(0, 4).map(task => (
                    <div key={task.id} className={cn("h-1.5 w-1.5 rounded-full", statusBadgeColors[task.status])}></div>
                ))}
            </div>
        )}
      </div>
    );
  };

  return (
    <DayPicker
      locale={it}
      mode="single"
      onDayClick={handleDayClick}
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
          "h-full w-full p-2 font-normal aria-selected:opacity-100 flex items-start justify-center hover:bg-accent rounded-md cursor-pointer"
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
