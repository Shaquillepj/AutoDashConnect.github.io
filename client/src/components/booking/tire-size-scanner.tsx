import { useRef, useState } from "react";
import { Camera, CheckCircle, Loader2, ScanLine, Upload } from "lucide-react";
import { createWorker } from "tesseract.js";
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

interface ScanResult {
  sizes: string[];
  pressuresPsi: number[];
}

interface TireSizeScannerProps {
  onTireSizeDetected: (tireSize: string) => void;
}

function parseTireSizes(text: string): ScanResult {
  // Matches standard tire size codes: optional prefix + 3 digits / 2 digits + R/B/D + 2-3 digits
  // e.g. P215/60R16, LT265/70R17, 215/60R16
  const sizePattern = /\b(?:P|LT|ST|T|C)?(\d{3})\/(\d{2})[RBD](\d{2,3})\b/gi;
  const sizeMatches = Array.from(text.matchAll(sizePattern)).map(m => m[0].toUpperCase());
  const sizes = Array.from(new Set(sizeMatches));

  // PSI values — look for numbers next to "PSI" or "psi"
  const psiPattern = /(\d{2,3})\s*psi/gi;
  const psiValues = Array.from(text.matchAll(psiPattern)).map(m => parseInt(m[1]));

  // kPa values — convert to PSI (÷ 6.895)
  const kpaPattern = /(\d{3})\s*kpa/gi;
  const kpaValues = Array.from(text.matchAll(kpaPattern)).map(m =>
    Math.round(parseInt(m[1]) / 6.895)
  );

  return {
    sizes,
    pressuresPsi: Array.from(new Set([...psiValues, ...kpaValues])),
  };
}

export function TireSizeScanner({ onTireSizeDetected }: TireSizeScannerProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleScan = async () => {
    if (!preview) return;
    setScanning(true);
    setProgress("Loading OCR engine…");
    try {
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(`Reading sticker… ${Math.round(m.progress * 100)}%`);
          } else if (m.status.startsWith("loading")) {
            setProgress("Loading OCR engine…");
          }
        },
      });

      const { data: { text } } = await worker.recognize(preview);
      await worker.terminate();

      const parsed = parseTireSizes(text);

      if (parsed.sizes.length === 0) {
        toast({
          title: "No tire size found",
          description: "Make sure the sticker is well-lit and in focus, then try again.",
          variant: "destructive",
        });
      } else {
        setResult(parsed);
      }
    } catch (err: any) {
      toast({
        title: "Scan failed",
        description: err.message || "Could not read the image.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
      setProgress("");
    }
  };

  const handleUseSize = (size: string) => {
    onTireSizeDetected(size);
    setOpen(false);
    resetState();
  };

  const resetState = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setResult(null);
    setScanning(false);
    setProgress("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetState(); }}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2 shrink-0">
          <ScanLine className="w-4 h-4" />
          Scan Sticker
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Tire Size Scanner
          </DialogTitle>
          <DialogDescription>
            Photo the sticker on your driver-side door jamb — it lists your
            vehicle's recommended tire size and cold inflation pressure.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload / preview area */}
          <div
            className="border-2 border-dashed border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => !scanning && fileInputRef.current?.click()}
          >
            {preview ? (
              <img
                src={preview}
                alt="Door jamb sticker"
                className="w-full max-h-56 object-contain bg-gray-50"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                <Upload className="w-8 h-8" />
                <span className="text-sm font-medium">Tap to upload or take a photo</span>
                <span className="text-xs">JPG, PNG, WebP — processed on-device, never uploaded</span>
              </div>
            )}
          </div>

          {/* capture="environment" opens the rear camera on mobile */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Scan button */}
          {preview && !result && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleScan}
              disabled={scanning}
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {progress || "Scanning…"}
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
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                <CheckCircle className="w-4 h-4" />
                {result.sizes.length} tire size{result.sizes.length > 1 ? "s" : ""} detected
              </div>

              <div className="space-y-1 text-sm">
                {result.sizes.map((size, i) => (
                  <div key={size} className="flex items-center justify-between">
                    <span className="text-gray-500">
                      {result.sizes.length === 1 ? "All tires" : i === 0 ? "Front" : "Rear"}
                    </span>
                    <span className="font-mono font-semibold text-gray-900">{size}</span>
                  </div>
                ))}
                {result.pressuresPsi.length > 0 && (
                  <div className="pt-1 border-t border-green-200 text-xs text-gray-500">
                    Cold pressure: {result.pressuresPsi.join(" / ")} PSI
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {result.sizes.map((size, i) => (
                  <Button
                    key={size}
                    size="sm"
                    className={i === 0 ? "flex-1 bg-green-600 hover:bg-green-700" : "flex-1"}
                    variant={i === 0 ? "default" : "outline"}
                    onClick={() => handleUseSize(size)}
                  >
                    Use {result.sizes.length > 1 ? (i === 0 ? "Front" : "Rear") : "This Size"}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {result && (
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
