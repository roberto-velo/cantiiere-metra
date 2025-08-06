
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { useTransition, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

export function TaskFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentRange = searchParams.get('range');
  const currentSearchTerm = searchParams.get('q') || '';
  
  const [inputValue, setInputValue] = useState(currentSearchTerm);
  
  // Debounce effect for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only trigger search if the input value is different from the current URL param
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


  const handleDateFilterChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');

    if (value === null || params.get('range') === value) {
      params.delete('range');
    } else {
      params.set('range', value);
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
            
            <Button variant={!currentRange ? 'secondary' : 'outline'} size="sm" onClick={() => handleDateFilterChange(null)} disabled={isPending}>Tutte le date</Button>
            
            <div className="border-l h-6 mx-2"></div>
            
            <Button variant={currentRange === 'week' ? 'secondary' : 'outline'} size="sm" onClick={() => handleDateFilterChange('week')} disabled={isPending}>Questa Settimana</Button>
            <Button variant={currentRange === 'month' ? 'secondary' : 'outline'} size="sm" onClick={() => handleDateFilterChange('month')} disabled={isPending}>Questo Mese</Button>
            <Button variant={currentRange === 'year' ? 'secondary' : 'outline'} size="sm" onClick={() => handleDateFilterChange('year')} disabled={isPending}>Questo Anno</Button>
        </div>
    </div>
  );
}
