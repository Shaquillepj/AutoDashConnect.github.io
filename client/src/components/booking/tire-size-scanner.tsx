import { useRef, useState } from "react";
import { Camera, CheckCircle, Loader2, ScanLine, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface TireScanResult {
  frontTire: string | null;
  rearTire: string | null;
  spare: string | null;
  pressureFrontPsi: number | null;
  pressureRearPsi: number | null;
  rawText?: string;
}

interface TireSizeScannerProps {
  onTireSizeDetected: (tireSize: string) => void;
}

export function TireSizeScanner({ onTireSizeDetected }: TireSizeScannerProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<TireScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      // dataUrl is "data:<mimeType>;base64,<data>"
      const [header, base64] = dataUrl.split(",");
      const mime = header.replace("data:", "").replace(";base64", "");
      setPreview(dataUrl);
      setImageBase64(base64);
      setMimeType(mime);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!imageBase64) return;
    setScanning(true);
    setResult(null);
    try {
      const response = await fetch("/api/ocr/tire-size", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Scan failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      toast({
        title: "Scan failed",
        description: err.message || "Could not read tire size from image.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  const handleUseSize = (size: string) => {
    onTireSizeDetected(size);
    setOpen(false);
    resetState();
  };

  const resetState = () => {
    setPreview(null);
    setImageBase64(null);
    setResult(null);
    setScanning(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const primarySize = result?.frontTire;
  const hasResult = result && (primarySize || result.rawText);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetState(); }}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <ScanLine className="w-4 h-4" />
          Scan Door Jamb Sticker
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Tire Size Scanner
          </DialogTitle>
          <DialogDescription>
            Take a photo of the sticker on your driver-side door jamb. It lists
            your vehicle's recommended tire size and pressure.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload area */}
          <div
            className="border-2 border-dashed border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img
                src={preview}
                alt="Door jamb sticker preview"
                className="w-full max-h-56 object-contain bg-gray-50"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                <Upload className="w-8 h-8" />
                <span className="text-sm font-medium">Tap to upload or take a photo</span>
                <span className="text-xs">JPG, PNG, WebP accepted</span>
              </div>
            )}
          </div>

          {/* Hidden file input — capture="environment" opens rear camera on mobile */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Scan button */}
          {imageBase64 && !hasResult && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleScan}
              disabled={scanning}
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reading sticker…
                </>
              ) : (
                <>
                  <ScanLine className="w-4 h-4 mr-2" />
                  Scan Image
                </>
              )}
            </Button>
          )}

          {/* Results */}
          {hasResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <CheckCircle className="w-4 h-4" />
                Tire size detected
              </div>

              {result.rawText && !primarySize ? (
                <p className="text-sm text-gray-700 font-mono">{result.rawText}</p>
              ) : (
                <div className="space-y-1 text-sm">
                  {result.frontTire && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{result.rearTire ? "Front" : "All tires"}</span>
                      <span className="font-mono font-semibold text-gray-900">{result.frontTire}</span>
                    </div>
                  )}
                  {result.rearTire && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rear</span>
                      <span className="font-mono font-semibold text-gray-900">{result.rearTire}</span>
                    </div>
                  )}
                  {result.spare && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Spare</span>
                      <span className="font-mono text-gray-700">{result.spare}</span>
                    </div>
                  )}
                  {(result.pressureFrontPsi || result.pressureRearPsi) && (
                    <div className="pt-1 border-t border-green-200 text-xs text-gray-500">
                      {result.pressureFrontPsi && (
                        <span>
                          {result.pressureRearPsi ? "Front" : "Cold pressure"}: {result.pressureFrontPsi} PSI
                          {result.pressureRearPsi ? `  ·  Rear: ${result.pressureRearPsi} PSI` : ""}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                {primarySize && (
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleUseSize(primarySize)}
                  >
                    Use {result.rearTire ? "Front" : ""} Size
                  </Button>
                )}
                {result.rearTire && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleUseSize(result.rearTire!)}
                  >
                    Use Rear Size
                  </Button>
                )}
                {result.rawText && !primarySize && (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleUseSize(result.rawText!)}
                  >
                    Use This
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Retry option after result */}
          {hasResult && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-gray-500"
              onClick={resetState}
            >
              Scan a different image
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
