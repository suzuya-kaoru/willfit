"use client";

import { ArrowDown, ArrowUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import type {
  CreateWorkoutSessionInput,
  WorkoutSessionExerciseInput,
  UpdateWorkoutSessionInput,
} from "@/app/_actions/workout-session-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  ExerciseWithBodyParts,
  WorkoutSessionWithExercises,
  WorkoutTemplateWithExercises,
} from "@/lib/types";

export type WorkoutSessionDialogInput =
  | CreateWorkoutSessionInput
  | UpdateWorkoutSessionInput;

export interface WorkoutSessionDialogProps {
  session: WorkoutSessionWithExercises | null;
  isOpen: boolean;
  isNew: boolean;
  templates: WorkoutTemplateWithExercises[];
  allExercises: ExerciseWithBodyParts[];
  onClose: () => void;
  onSave: (input: WorkoutSessionDialogInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

// 編集用の拡張型
interface EditingExercise extends WorkoutSessionExerciseInput {
  _id: string; // for UI key
  name: string; // 表示用
  bodyPartNames: string[]; // 表示用
}

export function WorkoutSessionDialog({
  session,
  isOpen,
  isNew,
  templates,
  allExercises,
  onClose,
  onSave,
  onDelete,
}: WorkoutSessionDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  const [exercises, setExercises] = useState<EditingExercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ダイアログが開かれたとき、またはsessionが変更されたときに初期化
  useEffect(() => {
    if (isOpen) {
      if (session) {
        setName(session.name);
        setDescription(session.description ?? "");
        setTemplateId(session.templateId.toString());
        setExercises(
          session.exercises.map((ex) => ({
            _id: crypto.randomUUID(),
            exerciseId: ex.exerciseId,
            displayOrder: ex.displayOrder,
            targetWeight: ex.targetWeight,
            targetReps: ex.targetReps,
            targetSets: ex.targetSets,
            restSeconds: ex.restSeconds,
            note: ex.note,
            name: ex.exercise.name,
            bodyPartNames: ex.exercise.bodyParts.map((bp) => bp.name),
          })),
        );
      } else {
        setName("");
        setDescription("");
        setTemplateId("");
        setExercises([]);
      }
    }
  }, [isOpen, session]);

  // テンプレート選択時の処理（新規作成時のみ、または意図的な上書き）
  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    const selectedTemplate = templates.find((m) => m.id.toString() === id);
    if (selectedTemplate) {
      // テンプレート名が未入力なら自動設定
      if (!name) {
        setName(selectedTemplate.name);
      }
      // テンプレートの種目をコピー
      const newExercises: EditingExercise[] = selectedTemplate.exercises.map(
        (ex, index) => ({
          _id: crypto.randomUUID(),
          exerciseId: ex.id,
          displayOrder: index + 1,
          name: ex.name,
          bodyPartNames: ex.bodyParts.map((bp) => bp.name),
          // デフォルト値
          targetWeight: 0,
          targetReps: 10,
          targetSets: 3,
          restSeconds: 60,
        }),
      );
      setExercises(newExercises);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !templateId || exercises.length === 0) return;
    setIsSubmitting(true);

    try {
      const exerciseInputs: WorkoutSessionExerciseInput[] = exercises.map(
        (ex, index) => ({
          exerciseId: ex.exerciseId,
          displayOrder: index + 1,
          targetWeight: ex.targetWeight,
          targetReps: ex.targetReps,
          targetSets: ex.targetSets,
          restSeconds: ex.restSeconds,
          note: ex.note,
        }),
      );

      if (session?.id) {
        await onSave({
          id: session.id,
          name: name.trim(),
          description: description.trim() || undefined,
          exercises: exerciseInputs,
        });
      } else {
        await onSave({
          templateId: parseInt(templateId, 10),
          name: name.trim(),
          description: description.trim() || undefined,
          exercises: exerciseInputs,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // 種目追加
  const addExercise = (exerciseId: string) => {
    const ex = allExercises.find((e) => e.id.toString() === exerciseId);
    if (!ex) return;

    setExercises((prev) => [
      ...prev,
      {
        _id: crypto.randomUUID(),
        exerciseId: ex.id,
        displayOrder: prev.length + 1,
        name: ex.name,
        bodyPartNames: ex.bodyParts.map((bp) => bp.name),
        targetWeight: 0,
        targetReps: 10,
        targetSets: 3,
        restSeconds: 60,
      },
    ]);
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const moveExercise = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= exercises.length) return;

    const newExercises = [...exercises];
    [newExercises[index], newExercises[targetIndex]] = [
      newExercises[targetIndex],
      newExercises[index],
    ];
    setExercises(newExercises);
  };

  const updateExercise = (
    index: number,
    field: keyof WorkoutSessionExerciseInput,
    value: string | number,
  ) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto rounded-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isNew ? "新規セッション作成" : "セッションを編集"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 基本設定 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="base-template">ベーステンプレ</Label>
              <Select
                value={templateId}
                onValueChange={handleTemplateChange}
                disabled={!isNew}
              >
                <SelectTrigger id="base-template">
                  <SelectValue placeholder="テンプレを選択" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-name">セッション名</Label>
              <Input
                id="session-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 胸トレ Aセッション"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明（任意）</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="セッションの詳細や目標などを入力"
              className="h-20"
            />
          </div>

          {/* 種目設定リスト */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-medium">種目と目標設定</h3>
              <Select onValueChange={addExercise}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="種目録を追加" />
                </SelectTrigger>
                <SelectContent>
                  {allExercises.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id.toString()}>
                      {ex.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {exercises.map((ex, index) => (
                <div
                  key={ex._id}
                  className="rounded-lg border bg-card p-3 shadow-sm"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <span className="font-medium">{ex.name}</span>
                      <div className="flex gap-1 text-[10px] text-muted-foreground">
                        {ex.bodyPartNames.join(", ")}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveExercise(index, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveExercise(index, "down")}
                        disabled={index === exercises.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => removeExercise(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        重量(kg)
                      </Label>
                      <Input
                        type="number"
                        className="h-8 text-sm"
                        value={ex.targetWeight || ""}
                        onChange={(e) =>
                          updateExercise(
                            index,
                            "targetWeight",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        回数
                      </Label>
                      <Input
                        type="number"
                        className="h-8 text-sm"
                        value={ex.targetReps || ""}
                        onChange={(e) =>
                          updateExercise(
                            index,
                            "targetReps",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        セット
                      </Label>
                      <Input
                        type="number"
                        className="h-8 text-sm"
                        value={ex.targetSets || ""}
                        onChange={(e) =>
                          updateExercise(
                            index,
                            "targetSets",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        休憩(秒)
                      </Label>
                      <Input
                        type="number"
                        className="h-8 text-sm"
                        value={ex.restSeconds || ""}
                        onChange={(e) =>
                          updateExercise(
                            index,
                            "restSeconds",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <Input
                      placeholder="メモ (任意)"
                      className="h-7 text-xs"
                      value={ex.note || ""}
                      onChange={(e) =>
                        updateExercise(index, "note", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
              {exercises.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  種目が設定されていません。
                  <br />
                  テンプレを選択するか、種目を追加してください。
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {!isNew && (
            <Button
              variant="destructive"
              disabled={isSubmitting}
              onClick={async () => {
                if (session?.id) {
                  setIsSubmitting(true);
                  await onDelete(session.id);
                  setIsSubmitting(false);
                  onClose();
                }
              }}
            >
              削除
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !name.trim() ||
              !templateId ||
              exercises.length === 0 ||
              isSubmitting
            }
          >
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 後方互換性エイリアス
export type SessionPlanDialogInput = WorkoutSessionDialogInput;
export type SessionPlanDialogProps = WorkoutSessionDialogProps;
export const SessionPlanDialog = WorkoutSessionDialog;
