
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { Button } from "./ui/button";

export function TaskFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    if (e.target.value) {
      params.set("q", e.target.value);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleFilter = (key: 'status' | 'range', value: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    router.replace(`${pathname}?${params.toString()}`);
  };
  
  const resetFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    params.delete('status');
    params.delete('range');
    router.replace(`${pathname}?${params.toString()}`);
  }

  const currentStatus = searchParams.get('status');
  const currentRange = searchParams.get('range');
  const hasActiveFilters = !!currentStatus || !!currentRange;

  return (
    <div className="space-y-4">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca attività per descrizione..."
          className="pl-10"
          onChange={handleSearch}
          defaultValue={searchParams.get("q") || ""}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium mr-2">Filtra per:</span>
          
          <Button variant={!hasActiveFilters ? 'default' : 'outline'} size="sm" onClick={resetFilters}>Tutte</Button>
          
          <Button variant={currentStatus === 'Pianificato' ? 'default' : 'outline'} size="sm" onClick={() => handleFilter('status', 'Pianificato')}>Pianificate</Button>
          <Button variant={currentStatus === 'In corso' ? 'default' : 'outline'} size="sm" onClick={() => handleFilter('status', 'In corso')}>In Corso</Button>
          <Button variant={currentStatus === 'Completato' ? 'default' : 'outline'} size="sm" onClick={() => handleFilter('status', 'Completato')}>Completate</Button>
          
          <div className="border-l h-6 mx-2"></div>
          
          <Button variant={currentRange === 'week' ? 'default' : 'outline'} size="sm" onClick={() => handleFilter('range', 'week')}>Questa Settimana</Button>
          <Button variant={currentRange === 'month' ? 'default' : 'outline'} size="sm" onClick={() => handleFilter('range', 'month')}>Questo Mese</Button>
      </div>
    </div>
  );
}
