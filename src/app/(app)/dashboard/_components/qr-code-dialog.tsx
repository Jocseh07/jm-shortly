"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface QrCodeDialogProps {
  shortUrl: string;
  shortCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QrCodeDialog({
  shortUrl,
  shortCode,
  open,
  onOpenChange,
}: QrCodeDialogProps) {
  const [size, setSize] = useState(512);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  const downloadPNG = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(shortUrl, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: "H",
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `qr-${shortCode}.png`;
      link.click();

      toast.success("QR code downloaded", {
        description: `Saved as qr-${shortCode}.png`,
      });
    } catch (error) {
      console.error("PNG download error:", error);
      toast.error("Download failed", {
        description: "Could not generate QR code",
      });
    }
  };

  const downloadSVG = () => {
    try {
      const svg = document.querySelector("#qr-preview svg");
      if (!svg) {
        toast.error("Download failed", {
          description: "QR code not found",
        });
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-${shortCode}.svg`;
      link.click();

      URL.revokeObjectURL(url);

      toast.success("QR code downloaded", {
        description: `Saved as qr-${shortCode}.svg`,
      });
    } catch (error) {
      console.error("SVG download error:", error);
      toast.error("Download failed", {
        description: "Could not generate QR code",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>
            Download QR code for {shortUrl}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code Preview */}
          <div className="flex justify-center p-6 bg-muted rounded-lg" id="qr-preview">
            <QRCodeSVG
              value={shortUrl}
              size={Math.min(size, 256)}
              level="H"
              fgColor={fgColor}
              bgColor={bgColor}
              includeMargin={true}
            />
          </div>

          {/* Customization Options */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-size">Size</Label>
              <Select
                value={size.toString()}
                onValueChange={(value) => setSize(parseInt(value, 10))}
              >
                <SelectTrigger id="qr-size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="256">256×256 (Small)</SelectItem>
                  <SelectItem value="512">512×512 (Medium)</SelectItem>
                  <SelectItem value="1024">1024×1024 (Large)</SelectItem>
                  <SelectItem value="2048">2048×2048 (Extra Large)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qr-fg-color">Foreground Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="qr-fg-color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-10 w-full rounded border cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr-bg-color">Background Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="qr-bg-color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-full rounded border cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={downloadPNG} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button onClick={downloadSVG} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download SVG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
