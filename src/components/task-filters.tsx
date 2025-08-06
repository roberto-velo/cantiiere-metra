
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { useCallback, useTransition } from "react";
import type { TaskStatus } from "@/lib/types";

export function TaskFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const searchTerm = searchParams.get("q") || "";
  const currentStatus = searchParams.get('status') as TaskStatus | null;
  const currentRange = searchParams.get('range');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      params.delete('page');
      return params.toString();
    },
    [searchParams]
  );
  
  const handleFilterChange = (name: 'status' | 'range', value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');

    if (value === null || params.get(name) === value) {
      // If the value is null or the same as the current one, remove the filter
      params.delete(name);
    } else {
      // Otherwise, set the new filter value
      params.set(name, value);
    }
    
    const newQueryString = params.toString();
    startTransition(() => {
        router.replace(`${pathname}?${newQueryString}`);
    });
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
     const params = new URLSearchParams(searchParams.toString());
     if(e.target.value) {
        params.set('q', e.target.value);
     } else {
        params.delete('q');
     }
     params.delete('page');

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
  
  const hasActiveFilters = !!currentStatus || !!currentRange || !!searchTerm;

  return (
    <div className="space-y-4">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca attività per descrizione..."
          className="pl-10"
          onChange={handleSearch}
          defaultValue={searchTerm}
          disabled={isPending}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium mr-2">Filtra per:</span>
          
          <Button variant={!hasActiveFilters ? 'secondary' : 'outline'} size="sm" onClick={resetFilters} disabled={isPending}>Tutte</Button>
          
          <div className="border-l h-6 mx-2"></div>

          <Button variant={currentStatus === 'Pianificato' ? 'secondary' : 'outline'} size="sm" onClick={() => handleFilterChange('status', 'Pianificato')} disabled={isPending}>Pianificate</Button>
          <Button variant={currentStatus === 'In corso' ? 'secondary' : 'outline'} size="sm" onClick={() => handleFilterChange('status', 'In corso')} disabled={isPending}>In Corso</Button>
          <Button variant={currentStatus === 'Completato' ? 'secondary' : 'outline'} size="sm" onClick={() => handleFilterChange('status', 'Completato')} disabled={isPending}>Completate</Button>
          
          <div className="border-l h-6 mx-2"></div>
          
          <Button variant={currentRange === 'week' ? 'secondary' : 'outline'} size="sm" onClick={() => handleFilterChange('range', 'week')} disabled={isPending}>Questa Settimana</Button>
          <Button variant={currentRange === 'month' ? 'secondary' : 'outline'} size="sm" onClick={() => handleFilterChange('range', 'month')} disabled={isPending}>Questo Mese</Button>
      </div>
    </div>
  );
}
