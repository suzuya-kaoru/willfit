"use client";

import { ArrowLeft, Check, Clock, Info, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import type {
  ExerciseWithBodyParts,
  WorkoutMenuWithExercises,
} from "@/lib/types";

/**
 * ============================================================================
 * Client Component: インタラクティブなUI要素と状態管理（クライアント側で実行）
 * ============================================================================
 *
 * このコンポーネントは以下の責務を持ちます：
 * - 経過時間タイマーの管理
 * - セット入力の状態管理
 * - 体調・疲労感・メモの状態管理
 * - ダイアログの開閉状態
 * - 保存処理（将来的にAPI呼び出しに置き換え）
 */

// ローカル用のセット型（IDはstring）
interface LocalSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

// ローカル用の種目記録型
interface LocalExerciseRecord {
  exerciseId: number;
  exercise: ExerciseWithBodyParts;
  sets: LocalSet[];
  previousRecord?: string;
}

/**
 * Workout Client Component Props
 */
export interface WorkoutClientProps {
  menu: WorkoutMenuWithExercises;
  previousRecords: Map<number, string>; // exerciseId -> previousRecord string
}

/**
 * Workout Client Component
 * インタラクティブな操作（タイマー、セット入力、保存）を担当
 */
export function WorkoutClient({ menu, previousRecords }: WorkoutClientProps) {
  const router = useRouter();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [exerciseRecords, setExerciseRecords] = useState<LocalExerciseRecord[]>(
    [],
  );
  const [condition, setCondition] = useState(7);
  const [fatigue, setFatigue] = useState(5);
  const [note, setNote] = useState("");
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Initialize exercise logs
  useEffect(() => {
    const records: LocalExerciseRecord[] = menu.exercises.map((exercise) => {
      const previousRecord = previousRecords.get(exercise.id);

      return {
        exerciseId: exercise.id,
        exercise,
        sets: [
          {
            id: `${exercise.id}-1`,
            setNumber: 1,
            weight: 0,
            reps: 0,
            completed: false,
          },
          {
            id: `${exercise.id}-2`,
            setNumber: 2,
            weight: 0,
            reps: 0,
            completed: false,
          },
          {
            id: `${exercise.id}-3`,
            setNumber: 3,
            weight: 0,
            reps: 0,
            completed: false,
          },
        ],
        previousRecord,
      };
    });
    setExerciseRecords(records);
  }, [menu, previousRecords]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const updateSet = (
    exerciseId: number,
    setId: string,
    field: keyof LocalSet,
    value: number | boolean,
  ) => {
    setExerciseRecords((prev) =>
      prev.map((record) => {
        if (record.exerciseId !== exerciseId) return record;
        return {
          ...record,
          sets: record.sets.map((set) => {
            if (set.id !== setId) return set;
            return { ...set, [field]: value };
          }),
        };
      }),
    );
  };

  const addSet = (exerciseId: number) => {
    setExerciseRecords((prev) =>
      prev.map((record) => {
        if (record.exerciseId !== exerciseId) return record;
        const newSetNumber = record.sets.length + 1;
        return {
          ...record,
          sets: [
            ...record.sets,
            {
              id: `${exerciseId}-${newSetNumber}`,
              setNumber: newSetNumber,
              weight: 0,
              reps: 0,
              completed: false,
            },
          ],
        };
      }),
    );
  };

  const handleSave = () => {
    // TODO: DB移行時は、ここでAPI呼び出しを行う
    // 例: await saveWorkoutSession({ menuId, exerciseRecords, condition, fatigue, note, elapsedTime })
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowEndDialog(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm font-semibold leading-tight">
                {menu.name}
              </h1>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTime(elapsedTime)}
              </div>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowEndDialog(true)}
          >
            終了
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 p-4">
        {/* Exercise List */}
        <Accordion
          type="multiple"
          defaultValue={exerciseRecords.map((r) => r.exerciseId.toString())}
          className="space-y-3"
        >
          {exerciseRecords.map((record) => (
            <AccordionItem
              key={record.exerciseId}
              value={record.exerciseId.toString()}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/30">
                <div className="flex flex-1 items-center justify-between pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{record.exercise.name}</span>
                    <FormInfoDialog exercise={record.exercise} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {record.sets.filter((s) => s.completed).length}/
                      {record.sets.length}
                    </span>
                    {record.sets.every((s) => s.completed) && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {record.previousRecord && (
                  <p className="mb-3 text-xs text-muted-foreground">
                    前回: {record.previousRecord}
                  </p>
                )}

                {/* Sets Table */}
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
                    <div className="col-span-2 text-center">Set</div>
                    <div className="col-span-4 text-center">kg</div>
                    <div className="col-span-4 text-center">Reps</div>
                    <div className="col-span-2 text-center">Done</div>
                  </div>

                  {record.sets.map((set) => (
                    <div
                      key={set.id}
                      className={`grid grid-cols-12 gap-2 items-center rounded-lg p-2 transition-colors ${
                        set.completed ? "bg-primary/10" : "bg-secondary/30"
                      }`}
                    >
                      <div className="col-span-2 text-center text-sm font-medium">
                        {set.setNumber}
                      </div>
                      <div className="col-span-4">
                        <Input
                          type="number"
                          step="0.5"
                          value={set.weight || ""}
                          onChange={(e) =>
                            updateSet(
                              record.exerciseId,
                              set.id,
                              "weight",
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                          className="h-9 text-center"
                          placeholder="60"
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          type="number"
                          value={set.reps || ""}
                          onChange={(e) =>
                            updateSet(
                              record.exerciseId,
                              set.id,
                              "reps",
                              Number.parseInt(e.target.value, 10) || 0,
                            )
                          }
                          className="h-9 text-center"
                          placeholder="10"
                        />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <Checkbox
                          checked={set.completed}
                          onCheckedChange={(checked) =>
                            updateSet(
                              record.exerciseId,
                              set.id,
                              "completed",
                              !!checked,
                            )
                          }
                          className="h-6 w-6 rounded-md"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => addSet(record.exerciseId)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  セット追加
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Session Notes */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-base font-medium">セッションメモ</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">体調</div>
                <span className="text-sm font-medium text-primary">
                  {condition}/10
                </span>
              </div>
              <Slider
                value={[condition]}
                onValueChange={([v]) => setCondition(v)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">疲労感</div>
                <span className="text-sm font-medium text-primary">
                  {fatigue}/10
                </span>
              </div>
              <Slider
                value={[fatigue]}
                onValueChange={([v]) => setFatigue(v)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm">気づき・反省</div>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="今日のトレーニングで気づいたこと..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Sticky Save Button */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 p-4 backdrop-blur-sm">
        <div className="mx-auto max-w-md">
          <Button onClick={handleSave} className="w-full gap-2" size="lg">
            <Save className="h-5 w-5" />
            トレーニングを終了して保存
          </Button>
        </div>
      </div>

      {/* End Confirmation Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="max-w-[90vw] rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>トレーニングを終了しますか？</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            入力したデータは保存されません（開発中）。
          </p>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => setShowEndDialog(false)}
            >
              続ける
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              保存して終了
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Form Info Dialog Component
function FormInfoDialog({ exercise }: { exercise: ExerciseWithBodyParts }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* biome-ignore lint/a11y/useSemanticElements: AccordionTrigger が <button> のため、<div> を使用する必要がある */}
      <div
        role="button"
        tabIndex={0}
        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full hover:bg-secondary"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <Info className="h-4 w-4 text-muted-foreground" />
      </div>
      <DialogContent className="max-w-[90vw] rounded-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {exercise.name}
            <div className="flex gap-1">
              {exercise.bodyParts.map((part) => (
                <span
                  key={part.id}
                  className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                >
                  {part.name}
                </span>
              ))}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {exercise.formNote && (
            <div>
              <h4 className="mb-2 text-sm font-medium">フォームのポイント</h4>
              <p className="text-sm text-muted-foreground">
                {exercise.formNote}
              </p>
            </div>
          )}
          {exercise.videoUrl && (
            <div>
              <h4 className="mb-2 text-sm font-medium">参考動画</h4>
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                動画を見る
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
