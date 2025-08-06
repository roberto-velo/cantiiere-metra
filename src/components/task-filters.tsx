
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

  useEffect(() => {
    setInputValue(currentSearchTerm);
  }, [currentSearchTerm]);
  

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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
  };
  
  const resetFilters = () => {
    startTransition(() => {
        router.replace(pathname);
    });
  };
  
  const hasActiveFilters = !!currentRange || !!currentSearchTerm;

  return (
    <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Cerca attività, cliente o tecnico..."
                className="pl-10"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            />
        </form>
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
