"use client";

import { useTransition, useState, useEffect } from "react";
import { Loader2, Scale } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { createWeightRecordAction } from "@/app/_actions/weight-actions";

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

  // Reset logic
  useEffect(() => {
    if (isOpen) {
      if (currentWeight) setWeight(currentWeight.toString());
      if (currentBodyFat) setBodyFat(currentBodyFat.toString());
    }
  }, [isOpen, currentWeight, currentBodyFat]);

  const handleSave = () => {
    const w = parseFloat(weight);
    const bf = bodyFat ? parseFloat(bodyFat) : undefined;

    if (isNaN(w) || w <= 0) return;

    startTransition(async () => {
      await createWeightRecordAction({
        weight: w,
        bodyFat: bf,
        recordedAt: new Date(),
      });
      onClose();
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
            {/* Quick Slider Adjustment (±2kg from value) */}
            {weight && !isNaN(parseFloat(weight)) && (
              <Slider
                value={[parseFloat(weight)]}
                min={parseFloat(weight) - 2}
                max={parseFloat(weight) + 2}
                step={0.1}
                onValueChange={(vals) => setWeight(vals[0].toFixed(1))}
                className="py-2"
              />
            )}
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
            {/* Slider for Body Fat (5% - 40%) */}
            <Slider
              defaultValue={[currentBodyFat ?? 15]}
              value={[bodyFat ? parseFloat(bodyFat) : (currentBodyFat ?? 15)]}
              min={3}
              max={40}
              step={0.1}
              onValueChange={(vals) => setBodyFat(vals[0].toFixed(1))}
              className="py-2"
            />
          </div>

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
