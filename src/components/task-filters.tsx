
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { useTransition, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export function TaskFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentRange = searchParams.get('range');
  const currentSearchTerm = searchParams.get('q') || '';
  const currentDate = searchParams.get('date');
  
  const [inputValue, setInputValue] = useState(currentSearchTerm);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentDate ? parseISO(currentDate) : undefined
  );
  
  // Debounce effect for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== currentSearchTerm) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('page');

        if (inputValue) {
          params.set('q', inputValue);
        } else {
          params.delete('q');
        }
        
        const newQueryString = params.toString();
        startTransition(() => {
            router.replace(`${pathname}?${newQueryString}`);
        });
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timer); // Cleanup the timer
  }, [inputValue, currentSearchTerm, pathname, router, searchParams]);


  const handleFilterChange = (key: 'range' | 'date', value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    
    // When a new filter is set, clear the other type of date filter
    if (key === 'range' && value !== null) {
      params.delete('date');
      setSelectedDate(undefined);
    }
    if (key === 'date' && value !== null) {
      params.delete('range');
    }

    if (value === null || params.get(key) === value) {
      params.delete(key);
       if (key === 'date') setSelectedDate(undefined);
    } else {
      params.set(key, value);
    }
    
    const newQueryString = params.toString();
    startTransition(() => {
        router.replace(`${pathname}?${newQueryString}`);
    });
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="ricerca solo per cliente"
                className="pl-10"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            />
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium mr-2">Filtra per:</span>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  size="sm"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                     currentDate && "bg-primary text-primary-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Scegli una data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date || undefined);
                    handleFilterChange('date', date ? format(date, 'yyyy-MM-dd') : null);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <div className="border-l h-6 mx-2"></div>
            
            <Button variant={currentRange === 'week' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterChange('range', 'week')} disabled={isPending}>Questa Settimana</Button>
            <Button variant={currentRange === 'month' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterChange('range', 'month')} disabled={isPending}>Questo Mese</Button>
            <Button variant={currentRange === 'year' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterChange('range', 'year')} disabled={isPending}>Questo Anno</Button>
        </div>
    </div>
  );
}
