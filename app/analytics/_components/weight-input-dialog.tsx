"use client";

import { Loader2, Scale } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { createWeightRecordAction } from "@/app/_actions/weight-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface WeightInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeight?: number;
  currentBodyFat?: number;
}

export function WeightInputDialog({
  isOpen,
  onClose,
  currentWeight,
  currentBodyFat,
}: WeightInputDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [weight, setWeight] = useState(currentWeight?.toString() ?? "");
  const [bodyFat, setBodyFat] = useState(currentBodyFat?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  // スライダーの基準値（ダイアログを開いた時の値を固定）
  const [weightSliderBase, setWeightSliderBase] = useState(currentWeight ?? 70);

  // Reset logic
  useEffect(() => {
    if (isOpen) {
      const initialWeight = currentWeight ?? 70;
      const initialBodyFat = currentBodyFat ?? 0;
      setWeight(initialWeight.toString());
      setWeightSliderBase(initialWeight);
      setBodyFat(initialBodyFat.toString());
      setError(null);
    }
  }, [isOpen, currentWeight, currentBodyFat]);

  const handleSave = () => {
    const w = parseFloat(weight);
    const bf = bodyFat ? parseFloat(bodyFat) : undefined;

    // クライアント側バリデーション
    if (Number.isNaN(w) || w <= 0) {
      setError("体重を正しく入力してください");
      return;
    }

    if (w < 1 || w > 500) {
      setError("体重は1kg〜500kgの範囲で入力してください");
      return;
    }

    if (bf !== undefined && (bf < 0 || bf > 100)) {
      setError("体脂肪率は0%〜100%の範囲で入力してください");
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await createWeightRecordAction({
        weight: w,
        bodyFat: bf,
        recordedAt: new Date(),
      });
      if (result.success) {
        onClose();
      } else {
        setError(result.error ?? "保存に失敗しました");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            Body Composition
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Weight Input */}
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-secondary/30 p-3 rounded-lg border border-border/50">
              <Label className="text-base font-semibold">体重</Label>
              <div className="flex items-baseline gap-1">
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-24 text-right text-xl font-bold bg-transparent border-0 focus-visible:ring-0 p-0 h-auto"
                  placeholder="0.0"
                />
                <span className="text-sm text-muted-foreground font-medium">
                  kg
                </span>
              </div>
            </div>
            {/* Quick Slider Adjustment (±2kg from base value) */}
            <Slider
              value={[weight ? parseFloat(weight) : weightSliderBase]}
              min={weightSliderBase - 2}
              max={weightSliderBase + 2}
              step={0.1}
              onValueChange={(vals) => setWeight(vals[0].toFixed(1))}
              className="py-2"
            />
          </div>

          {/* Body Fat Input */}
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-secondary/30 p-3 rounded-lg border border-border/50">
              <Label className="text-base font-semibold">体脂肪率</Label>
              <div className="flex items-baseline gap-1">
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="w-24 text-right text-xl font-bold bg-transparent border-0 focus-visible:ring-0 p-0 h-auto"
                  placeholder="--.-"
                />
                <span className="text-sm text-muted-foreground font-medium">
                  %
                </span>
              </div>
            </div>
            {/* Slider for Body Fat (0% - 50%) */}
            <Slider
              defaultValue={[currentBodyFat ?? 0]}
              value={[bodyFat ? parseFloat(bodyFat) : (currentBodyFat ?? 0)]}
              min={0}
              max={50}
              step={0.1}
              onValueChange={(vals) => setBodyFat(vals[0].toFixed(1))}
              className="py-2"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20"
            onClick={handleSave}
            disabled={isPending || !weight}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                保存中...
              </>
            ) : (
              "記録する"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
