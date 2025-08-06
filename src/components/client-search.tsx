
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

export function ClientSearch({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== (searchParams.get('q') || '')) {
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

    return () => clearTimeout(timer);
  }, [inputValue, pathname, router, searchParams]);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Cerca cliente per nome..."
        className="pl-10"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isPending}
      />
    </div>
  );
}
