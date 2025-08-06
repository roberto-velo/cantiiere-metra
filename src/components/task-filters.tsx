
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { useTransition } from "react";

export function TaskFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentRange = searchParams.get('range');

  const handleFilterChange = (value: string | null) => {
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
  
  const resetFilters = () => {
    startTransition(() => {
        router.replace(pathname);
    });
  };
  
  const hasActiveFilters = !!currentRange;

  return (
    <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium mr-2">Filtra per:</span>
        
        <Button variant={!hasActiveFilters ? 'secondary' : 'outline'} size="sm" onClick={resetFilters} disabled={isPending}>Tutte</Button>
        
        <div className="border-l h-6 mx-2"></div>
        
        <Button variant={currentRange === 'week' ? 'secondary' : 'outline'} size="sm" onClick={() => handleFilterChange('week')} disabled={isPending}>Questa Settimana</Button>
        <Button variant={currentRange === 'month' ? 'secondary' : 'outline'} size="sm" onClick={() => handleFilterChange('month')} disabled={isPending}>Questo Mese</Button>
        <Button variant={currentRange === 'year' ? 'secondary' : 'outline'} size="sm" onClick={() => handleFilterChange('year')} disabled={isPending}>Questo Anno</Button>
    </div>
  );
}
