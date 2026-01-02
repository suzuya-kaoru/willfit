"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import type {
  CreateMenuInput,
  UpdateMenuInput,
} from "@/app/_actions/menu-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
  ExerciseWithBodyParts,
  WorkoutMenuWithExercises,
} from "@/lib/types";

// ダイアログからの入力型（新規: id なし、更新: id あり）
export type MenuDialogInput = CreateMenuInput | UpdateMenuInput;

export interface MenuEditDialogProps {
  menu: WorkoutMenuWithExercises | null;
  isOpen: boolean;
  isNew: boolean;
  exercises: ExerciseWithBodyParts[];
  onClose: () => void;
  onSave: (input: MenuDialogInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function MenuEditDialog({
  menu,
  isOpen,
  isNew,
  exercises,
  onClose,
  onSave,
  onDelete,
}: MenuEditDialogProps) {
  const [name, setName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<
    ExerciseWithBodyParts[]
  >([]);

  // Reset form when dialog opens/menu changes
  useEffect(() => {
    if (isOpen) {
      setName(menu?.name ?? "");
      setSelectedExercises(menu?.exercises ?? []);
    }
  }, [isOpen, menu]);

  const handleSave = async () => {
    if (!name.trim()) return;

    const baseInput = {
      name: name.trim(),
      exerciseIds: selectedExercises.map((ex) => ex.id),
    };

    // 更新時は id を含める
    if (menu?.id) {
      await onSave({ ...baseInput, id: menu.id });
    } else {
      await onSave(baseInput);
    }
    onClose();
  };

  const toggleExercise = (exercise: ExerciseWithBodyParts) => {
    setSelectedExercises((prev) =>
      prev.some((e) => e.id === exercise.id)
        ? prev.filter((e) => e.id !== exercise.id)
        : [...prev, exercise],
    );
  };

  const moveExercise = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedExercises.length) return;

    const newExercises = [...selectedExercises];
    [newExercises[index], newExercises[targetIndex]] = [
      newExercises[targetIndex],
      newExercises[index],
    ];
    setSelectedExercises(newExercises);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto rounded-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isNew ? "新規テンプレ作成" : "テンプレを編集"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="menu-name" className="text-sm font-medium">
              テンプレ名
            </label>
            <Input
              id="menu-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Day1 胸・背中"
            />
          </div>

          {/* Selected Exercises with Reorder */}
          {selectedExercises.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">選択した種目（順番）</div>
              <div className="space-y-1">
                {selectedExercises.map((ex, index) => (
                  <div
                    key={ex.id}
                    className="flex items-center gap-2 rounded-lg bg-primary/10 p-2"
                  >
                    <span className="w-6 text-center text-sm font-medium text-primary">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm">{ex.name}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveExercise(index, "up")}
                        disabled={index === 0}
                        className="rounded p-1 hover:bg-secondary disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveExercise(index, "down")}
                        disabled={index === selectedExercises.length - 1}
                        className="rounded p-1 hover:bg-secondary disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExercise(ex)}
                        className="rounded p-1 hover:bg-destructive/20"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exercise Selection */}
          <div className="space-y-2">
            <div className="text-sm font-medium">種目を追加</div>
            <div className="max-h-[200px] space-y-1 overflow-y-auto rounded-lg border border-border p-2">
              {exercises
                .filter((ex) => !selectedExercises.some((s) => s.id === ex.id))
                .map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => toggleExercise(exercise)}
                    className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-secondary/50"
                  >
                    <span className="text-sm">{exercise.name}</span>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              {exercises.filter(
                (ex) => !selectedExercises.some((s) => s.id === ex.id),
              ).length === 0 && (
                <p className="py-2 text-center text-sm text-muted-foreground">
                  すべての種目が選択済みです
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {!isNew && (
            <Button
              variant="destructive"
              onClick={async () => {
                if (menu?.id) {
                  await onDelete(menu.id);
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
