"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateLink } from "@/actions/links";
import { LinkType } from "./columns";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Loader2 } from "lucide-react";
import { DateTimePicker } from "@/components/ui/date-time-picker";

interface EditLinkDialogProps {
  link: LinkType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLinkDialog({
  link,
  open,
  onOpenChange,
}: EditLinkDialogProps) {
  const [originalUrl, setOriginalUrl] = useState(link.originalUrl);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(
    link.expiresAt ? new Date(link.expiresAt) : undefined
  );
  const [expirationMessage, setExpirationMessage] = useState(
    link.expirationMessage || ""
  );
  const [activateAt, setActivateAt] = useState<Date | undefined>(
    link.activateAt ? new Date(link.activateAt) : undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  
  const now = new Date();
  const isExpired = link.expiresAt && new Date(link.expiresAt) < now;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateLink(link.id, {
        originalUrl,
        expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
        expirationMessage: expirationMessage || undefined,
        activateAt: activateAt ? activateAt.toISOString() : undefined,
      });

      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.error || "Failed to update link");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
          <DialogDescription>
            Update the destination URL, expiration date, or activation schedule for this short link.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {isExpired && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-md text-sm">
                ⚠️ This link has expired on {new Date(link.expiresAt!).toLocaleString()}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="originalUrl">Long URL</Label>
              <Input
                id="originalUrl"
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/very/long/url"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">
                Expiration Date{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <DateTimePicker
                value={expiresAt}
                onChange={setExpiresAt}
                placeholder="Pick expiration date and time"
                disabled={isPending}
              />
              <p className="text-sm text-muted-foreground">
                Link will expire and become inaccessible after this date
              </p>
            </div>

            {expiresAt && (
              <div className="space-y-2">
                <Label htmlFor="expirationMessage">
                  Custom Expiration Message{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="expirationMessage"
                  value={expirationMessage}
                  onChange={(e) => setExpirationMessage(e.target.value)}
                  placeholder="This link has expired. Please contact us for a new link."
                  disabled={isPending}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  Custom message to show when link expires ({expirationMessage.length}/200 characters)
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="activateAt">
                Schedule Activation{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <DateTimePicker
                value={activateAt}
                onChange={setActivateAt}
                placeholder="Pick activation date and time"
                disabled={isPending}
              />
              <p className="text-sm text-muted-foreground">
                Link will not be accessible until this date and time
              </p>
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              <LoadingSwap isLoading={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save changes"
                )}
              </LoadingSwap>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
