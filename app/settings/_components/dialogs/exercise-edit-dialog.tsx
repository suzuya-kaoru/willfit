"use client";

import { useEffect, useState } from "react";
import type {
  CreateExerciseInput,
  UpdateExerciseInput,
} from "@/app/_actions/exercise-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { BodyPart, ExerciseWithBodyParts } from "@/lib/types";

// ダイアログからの入力型（新規: id なし、更新: id あり）
export type ExerciseDialogInput = CreateExerciseInput | UpdateExerciseInput;

export interface ExerciseEditDialogProps {
  exercise: ExerciseWithBodyParts | null;
  isOpen: boolean;
  isNew: boolean;
  bodyParts: BodyPart[];
  onClose: () => void;
  onSave: (input: ExerciseDialogInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function ExerciseEditDialog({
  exercise,
  isOpen,
  isNew,
  bodyParts,
  onClose,
  onSave,
  onDelete,
}: ExerciseEditDialogProps) {
  const [name, setName] = useState("");
  const [selectedBodyParts, setSelectedBodyParts] = useState<number[]>([]);
  const [formNote, setFormNote] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Reset form when dialog opens/exercise changes
  useEffect(() => {
    if (isOpen) {
      setName(exercise?.name ?? "");
      setSelectedBodyParts(exercise?.bodyParts.map((bp) => bp.id) ?? []);
      setFormNote(exercise?.formNote ?? "");
      setVideoUrl(exercise?.videoUrl ?? "");
    }
  }, [isOpen, exercise]);

  const handleSave = async () => {
    if (!name.trim()) return;

    const baseInput = {
      name: name.trim(),
      bodyPartIds: selectedBodyParts,
      formNote: formNote.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
    };

    // 更新時は id を含める
    if (exercise?.id) {
      await onSave({ ...baseInput, id: exercise.id });
    } else {
      await onSave(baseInput);
    }
    onClose();
  };

  const toggleBodyPart = (partId: number) => {
    setSelectedBodyParts((prev) =>
      prev.includes(partId)
        ? prev.filter((p) => p !== partId)
        : [...prev, partId],
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] rounded-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "新規種目追加" : "種目を編集"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="exercise-name" className="text-sm font-medium">
              種目名
            </label>
            <Input
              id="exercise-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ベンチプレス"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">対象部位</div>
            <div className="flex flex-wrap gap-2">
              {bodyParts.map((part) => (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => toggleBodyPart(part.id)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    selectedBodyParts.includes(part.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {part.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="exercise-form-note" className="text-sm font-medium">
              フォームメモ
            </label>
            <Textarea
              id="exercise-form-note"
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              placeholder="フォームのポイントや注意点..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="exercise-video-url" className="text-sm font-medium">
              動画URL
            </label>
            <Input
              id="exercise-video-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video..."
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {!isNew && (
            <Button
              variant="destructive"
              onClick={async () => {
                if (exercise?.id) {
                  await onDelete(exercise.id);
                  onClose();
                }
              }}
            >
              削除
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
