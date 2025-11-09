"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2 } from "lucide-react";

export function CopyButton({ shortUrl }: { shortUrl: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? (
        <>
          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </>
      )}
    </Button>
  );
}
