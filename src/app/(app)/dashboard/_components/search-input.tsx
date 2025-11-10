"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@uidotdev/usehooks";
import { Button } from "@/components/ui/button";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Initialize from URL
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchValue, 500);

  // Track current URL search param to prevent duplicate updates
  const currentSearchParam = searchParams.get("search") || "";

  // Update URL when debounced value changes
  useEffect(() => {
    // Only update if the debounced value is different from current URL
    if (debouncedSearch !== currentSearchParam) {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        
        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        } else {
          params.delete("search");
        }
        
        const queryString = params.toString();
        const newUrl = queryString ? `/dashboard?${queryString}` : "/dashboard";
        
        // Use replace instead of push to avoid polluting history
        router.replace(newUrl);
      });
    }
    // Note: searchParams is intentionally excluded from deps to prevent infinite loop
    // since it's a new object reference on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, currentSearchParam, router]);

  const handleClear = () => {
    setSearchValue("");
  };

  return (
    <div className="relative flex-1 w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search by short code or URL..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="pl-9 pr-20 w-full"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {isPending && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {searchValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-7 w-7 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
    </div>
  );
}
