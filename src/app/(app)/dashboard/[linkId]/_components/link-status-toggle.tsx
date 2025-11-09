"use client";

import { useState, useTransition } from "react";
import { toggleLinkStatus } from "@/actions/links";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LinkStatusToggleProps {
  linkId: string;
  isActive: boolean;
  shortCode: string;
}

export function LinkStatusToggle({
  linkId,
  isActive,
  shortCode,
}: LinkStatusToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticActive, setOptimisticActive] = useState(isActive);

  const handleToggle = () => {
    setOptimisticActive(!optimisticActive);

    startTransition(async () => {
      const result = await toggleLinkStatus(linkId);

      if (!result.success) {
        setOptimisticActive(optimisticActive);
        toast.error(result.error || "Failed to update link status");
      } else {
        toast.success(
          optimisticActive
            ? `Link ${shortCode} deactivated`
            : `Link ${shortCode} activated`
        );
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Badge
        variant={optimisticActive ? "default" : "secondary"}
        className={
          optimisticActive
            ? "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-500/20"
            : "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20"
        }
      >
        {optimisticActive ? "Active" : "Inactive"}
      </Badge>

      <div className="flex items-center gap-2">
        <Switch
          checked={optimisticActive}
          onCheckedChange={handleToggle}
          disabled={isPending}
        />
        {isPending && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      </div>
    </div>
  );
}
