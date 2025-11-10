"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { QrCodeDialog } from "./qr-code-dialog";

interface QrCodeButtonProps {
  shortUrl: string;
  shortCode: string;
  variant?: "outline" | "ghost" | "default";
  size?: "sm" | "default" | "lg";
}

export function QrCodeButton({
  shortUrl,
  shortCode,
  variant = "outline",
  size = "sm",
}: QrCodeButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setDialogOpen(true)}>
        <QrCode className="h-4 w-4 mr-2" />
        QR Code
      </Button>

      <QrCodeDialog
        shortUrl={shortUrl}
        shortCode={shortCode}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
