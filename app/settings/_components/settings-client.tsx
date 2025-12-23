"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Dumbbell,
  LayoutList,
  Pencil,
  Plus,
  Scale,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type {
  ExerciseWithBodyParts,
  BodyPart,
  WeightRecord,
  WorkoutMenuWithExercises,
} from "@/lib/types";

export interface SettingsClientProps {
  initialExercises: ExerciseWithBodyParts[];
  initialMenus: WorkoutMenuWithExercises[];
  initialWeightRecords: WeightRecord[];
  initialBodyParts: BodyPart[];
}

export function SettingsClient({
  initialExercises,
  initialMenus,
  initialWeightRecords,
  initialBodyParts,
}: SettingsClientProps) {
  const [exercises, setExercises] =
    useState<ExerciseWithBodyParts[]>(initialExercises);
  const [menus, setMenus] = useState<WorkoutMenuWithExercises[]>(initialMenus);
  const [weightRecords, setWeightRecords] =
    useState<WeightRecord[]>(initialWeightRecords);
  const bodyParts = initialBodyParts;
  const [searchQuery, setSearchQuery] = useState("");
  const [editingExercise, setEditingExercise] =
    useState<ExerciseWithBodyParts | null>(null);
  const [editingMenu, setEditingMenu] =
    useState<WorkoutMenuWithExercises | null>(null);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isAddingMenu, setIsAddingMenu] = useState(false);
  const [weightInput, setWeightInput] = useState("");

  // Filter exercises by search query
  const filteredExercises = exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.bodyParts.some((bp) => bp.name.includes(searchQuery)),
  );

  // Exercise CRUD
  const handleSaveExercise = (exercise: ExerciseWithBodyParts) => {
    if (isAddingExercise) {
      const newExercise: ExerciseWithBodyParts = {
        ...exercise,
        id: Date.now(), // 数値ID（実際のDBではAUTO_INCREMENT）
        userId: 1, // 数値ID
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setExercises([...exercises, newExercise]);
      setIsAddingExercise(false);
    } else {
      setExercises(
        exercises.map((ex) =>
          ex.id === exercise.id ? { ...exercise, updatedAt: new Date() } : ex,
        ),
      );
      setEditingExercise(null);
    }
  };

  const handleDeleteExercise = (id: number) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  // Menu CRUD
  const handleSaveMenu = (menu: WorkoutMenuWithExercises) => {
    if (isAddingMenu) {
      const newMenu: WorkoutMenuWithExercises = {
        ...menu,
        id: Date.now(), // 数値ID（実際のDBではAUTO_INCREMENT）
        userId: 1, // 数値ID
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setMenus([...menus, newMenu]);
      setIsAddingMenu(false);
    } else {
      setMenus(
        menus.map((m) =>
          m.id === menu.id ? { ...menu, updatedAt: new Date() } : m,
        ),
      );
      setEditingMenu(null);
    }
  };

  const handleDeleteMenu = (id: number) => {
    setMenus(menus.filter((m) => m.id !== id));
  };

  // Weight Record CRUD
  const handleSaveWeightRecord = () => {
    const weight = parseFloat(weightInput);
    if (Number.isNaN(weight) || weight <= 0) return;

    const newRecord: WeightRecord = {
      id: Date.now(), // 数値ID（実際のDBではAUTO_INCREMENT）
      userId: 1, // 数値ID
      recordedAt: new Date(),
      weight,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setWeightRecords([newRecord, ...weightRecords]);
    setWeightInput("");
  };

  const handleDeleteWeightRecord = (id: number) => {
    setWeightRecords(weightRecords.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="設定" />

      <main className="mx-auto max-w-md p-4">
        <Tabs defaultValue="menus" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="menus"
              className="gap-1 text-xs sm:gap-2 sm:text-sm"
            >
              <LayoutList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">メニュー管理</span>
              <span className="sm:hidden">メニュー</span>
            </TabsTrigger>
            <TabsTrigger
              value="exercises"
              className="gap-1 text-xs sm:gap-2 sm:text-sm"
            >
              <Dumbbell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">種目管理</span>
              <span className="sm:hidden">種目</span>
            </TabsTrigger>
            <TabsTrigger
              value="weight"
              className="gap-1 text-xs sm:gap-2 sm:text-sm"
            >
              <Scale className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">体重管理</span>
              <span className="sm:hidden">体重</span>
            </TabsTrigger>
          </TabsList>

          {/* Menu Management Tab */}
          <TabsContent value="menus" className="space-y-4">
            <Button
              className="w-full gap-2"
              onClick={() => {
                setIsAddingMenu(true);
                setEditingMenu({
                  id: 0, // 新規作成時は0（実際のDBではAUTO_INCREMENT）
                  userId: 1, // 数値ID
                  name: "",
                  exercises: [],
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
              }}
            >
              <Plus className="h-4 w-4" />
              新規メニュー作成
            </Button>

            <div className="space-y-3">
              {menus.map((menu) => (
                <Card key={menu.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">{menu.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingMenu(menu);
                          setIsAddingMenu(false);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteMenu(menu.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {menu.exercises.map((ex, index) => (
                        <div
                          key={ex.id}
                          className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1"
                        >
                          <span className="text-xs font-medium text-secondary-foreground">
                            {index + 1}. {ex.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    {menu.exercises.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        種目が設定されていません
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Exercise Management Tab */}
          <TabsContent value="exercises" className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="種目を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Button
              className="w-full gap-2"
              onClick={() => {
                setIsAddingExercise(true);
                setEditingExercise({
                  id: 0, // 新規作成時は0（実際のDBではAUTO_INCREMENT）
                  userId: 1, // 数値ID
                  name: "",
                  bodyParts: [],
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
              }}
            >
              <Plus className="h-4 w-4" />
              新規種目追加
            </Button>

            <div className="space-y-2">
              {filteredExercises.map((exercise) => (
                <Card
                  key={exercise.id}
                  className="cursor-pointer hover:bg-secondary/20 transition-colors"
                  onClick={() => {
                    setEditingExercise(exercise);
                    setIsAddingExercise(false);
                  }}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-medium">{exercise.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {exercise.bodyParts.map((part) => (
                          <Badge
                            key={part.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {part.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}

              {filteredExercises.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {searchQuery
                    ? "該当する種目が見つかりません"
                    : "種目がありません"}
                </p>
              )}
            </div>
          </TabsContent>

          {/* Weight Management Tab */}
          <TabsContent value="weight" className="space-y-4">
            {/* Weight Input Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <Scale className="h-4 w-4 text-primary" />
                  体重を記録
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="70.0"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      className="pr-8"
                      min="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      kg
                    </span>
                  </div>
                  <Button
                    onClick={handleSaveWeightRecord}
                    disabled={!weightInput || parseFloat(weightInput) <= 0}
                  >
                    記録
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Weight Records History */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">記録履歴</h3>
              {weightRecords.length > 0 ? (
                <div className="space-y-2">
                  {weightRecords.map((record) => (
                    <Card key={record.id} className="overflow-hidden">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Scale className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {record.weight.toFixed(1)} kg
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(record.recordedAt, "yyyy年M月d日 HH:mm", {
                                locale: ja,
                              })}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteWeightRecord(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      まだ体重記録がありません
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Exercise Edit Dialog */}
      <ExerciseEditDialog
        exercise={editingExercise}
        isOpen={!!editingExercise || isAddingExercise}
        isNew={isAddingExercise}
        bodyParts={bodyParts}
        onClose={() => {
          setEditingExercise(null);
          setIsAddingExercise(false);
        }}
        onSave={handleSaveExercise}
        onDelete={handleDeleteExercise}
      />

      {/* Menu Edit Dialog */}
      <MenuEditDialog
        menu={editingMenu}
        isOpen={!!editingMenu || isAddingMenu}
        isNew={isAddingMenu}
        exercises={exercises}
        onClose={() => {
          setEditingMenu(null);
          setIsAddingMenu(false);
        }}
        onSave={handleSaveMenu}
        onDelete={handleDeleteMenu}
      />

      <BottomNavigation />
    </div>
  );
}

// Exercise Edit Dialog Component
interface ExerciseEditDialogProps {
  exercise: ExerciseWithBodyParts | null;
  isOpen: boolean;
  isNew: boolean;
  bodyParts: BodyPart[];
  onClose: () => void;
  onSave: (exercise: ExerciseWithBodyParts) => void;
  onDelete: (id: number) => void;
}

function ExerciseEditDialog({
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

  // Reset form when exercise changes
  useEffect(() => {
    if (exercise) {
      setName(exercise.name);
      setSelectedBodyParts(exercise.bodyParts.map((bp) => bp.id));
      setFormNote(exercise.formNote || "");
      setVideoUrl(exercise.videoUrl || "");
    }
  }, [exercise]);

  const handleSave = () => {
    if (!name.trim()) return;

    const selectedParts = bodyParts.filter((bp) =>
      selectedBodyParts.includes(bp.id),
    );

    onSave({
      id: exercise?.id || 0, // 新規作成時は0（実際のDBではAUTO_INCREMENT）
      userId: exercise?.userId || 1, // 数値ID
      name: name.trim(),
      bodyParts: selectedParts,
      formNote: formNote.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      createdAt: exercise?.createdAt || new Date(),
      updatedAt: new Date(),
    });
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
              onClick={() => {
                if (exercise?.id) {
                  onDelete(exercise.id);
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

// Menu Edit Dialog Component
interface MenuEditDialogProps {
  menu: WorkoutMenuWithExercises | null;
  isOpen: boolean;
  isNew: boolean;
  exercises: ExerciseWithBodyParts[];
  onClose: () => void;
  onSave: (menu: WorkoutMenuWithExercises) => void;
  onDelete: (id: number) => void;
}

function MenuEditDialog({
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

  // Reset form when menu changes
  useEffect(() => {
    if (menu) {
      setName(menu.name);
      setSelectedExercises(menu.exercises);
    }
  }, [menu]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: menu?.id || 0, // 新規作成時は0（実際のDBではAUTO_INCREMENT）
      userId: menu?.userId || 1, // 数値ID
      name: name.trim(),
      exercises: selectedExercises,
      createdAt: menu?.createdAt || new Date(),
      updatedAt: new Date(),
    });
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
            {isNew ? "新規メニュー作成" : "メニューを編集"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="menu-name" className="text-sm font-medium">
              メニュー名
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
              onClick={() => {
                if (menu?.id) {
                  onDelete(menu.id);
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
