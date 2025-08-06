
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { useCallback } from "react";
import type { TaskStatus } from "@/lib/types";

export function TaskFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const searchTerm = searchParams.get("q") || "";
  const currentStatus = searchParams.get('status') as TaskStatus | null;
  const currentRange = searchParams.get('range');

  const createQueryString = useCallback(
    (updates: { name: string; value: string | null }[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      
      updates.forEach(({ name, value }) => {
        if (value === null) {
          params.delete(name);
        } else {
          params.set(name, value);
        }
      });
      
      return params.toString();
    },
    [searchParams]
  );
  
  const handleStatusClick = (value: TaskStatus | null) => {
    // This filter should only refer to the status
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (value === null) {
        params.delete('status');
    } else {
        params.set('status', value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleRangeClick = (value: string) => {
     const newQueryString = createQueryString([{ 
        name: 'range', 
        value: currentRange === value ? null : value 
    }]);
    router.replace(`${pathname}?${newQueryString}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQueryString = createQueryString([{ name: 'q', value: e.target.value || null }]);
    router.replace(`${pathname}?${newQueryString}`);
  };

  const resetFilters = () => {
    router.replace(pathname);
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
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium mr-2">Filtra per:</span>
          
          <Button variant={!hasActiveFilters ? 'default' : 'outline'} size="sm" onClick={resetFilters}>Tutte</Button>
          
          <div className="border-l h-6 mx-2"></div>

          <Button variant={currentStatus === 'Pianificato' ? 'default' : 'outline'} size="sm" onClick={() => handleStatusClick('Pianificato')}>Pianificate</Button>
          <Button variant={currentStatus === 'In corso' ? 'default' : 'outline'} size="sm" onClick={() => handleStatusClick('In corso')}>In Corso</Button>
          <Button variant={currentStatus === 'Completato' ? 'default' : 'outline'} size="sm" onClick={() => handleStatusClick('Completato')}>Completate</Button>
          
          <div className="border-l h-6 mx-2"></div>
          
          <Button variant={currentRange === 'week' ? 'default' : 'outline'} size="sm" onClick={() => handleRangeClick('week')}>Questa Settimana</Button>
          <Button variant={currentRange === 'month' ? 'default' : 'outline'} size="sm" onClick={() => handleRangeClick('month')}>Questo Mese</Button>
      </div>
    </div>
  );
}
