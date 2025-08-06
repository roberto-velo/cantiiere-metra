
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


  const handleFilterChange = (key: 'range', value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    params.delete('date');

    if (value === null || params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    const newQueryString = params.toString();
    startTransition(() => {
        router.replace(`${pathname}?${newQueryString}`);
    });
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-4 flex-1">
        <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="ricerca solo per cliente"
                className="pl-10"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            />
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <Button variant={!currentRange ? 'default' : 'outline'} size="sm" onClick={() => handleFilterChange('range', null)} disabled={isPending}>Tutte le date</Button>
            <Button variant={currentRange === 'week' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterChange('range', 'week')} disabled={isPending}>Questa Settimana</Button>
            <Button variant={currentRange === 'month' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterChange('range', 'month')} disabled={isPending}>Questo Mese</Button>
            <Button variant={currentRange === 'year' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterChange('range', 'year')} disabled={isPending}>Questo Anno</Button>
        </div>
    </div>
  );
}
