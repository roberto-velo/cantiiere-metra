
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

export function TaskFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const searchTerm = searchParams.get("q") || "";
  const currentStatus = searchParams.get('status');
  const currentRange = searchParams.get('range');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get(name) === value) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      params.delete('page');
      return params.toString();
    },
    [searchParams]
  );
  
  const handleFilterClick = (name: 'status' | 'range', value: string) => {
    router.replace(`${pathname}?${createQueryString(name, value)}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (e.target.value) {
      params.set("q", e.target.value);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    params.delete('range');
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`);
  };
  
  const hasActiveFilters = !!currentStatus || !!currentRange;

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

          <Button variant={currentStatus === 'Pianificato' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterClick('status', 'Pianificato')}>Pianificate</Button>
          <Button variant={currentStatus === 'In corso' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterClick('status', 'In corso')}>In Corso</Button>
          <Button variant={currentStatus === 'Completato' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterClick('status', 'Completato')}>Completate</Button>
          
          <div className="border-l h-6 mx-2"></div>
          
          <Button variant={currentRange === 'week' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterClick('range', 'week')}>Questa Settimana</Button>
          <Button variant={currentRange === 'month' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterClick('range', 'month')}>Questo Mese</Button>
      </div>
    </div>
  );
}
