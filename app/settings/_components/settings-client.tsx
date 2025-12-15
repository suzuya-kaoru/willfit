"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Dumbbell,
  LayoutList,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
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
import { mockBodyParts } from "@/lib/mock-data";
import type {
  ExerciseWithBodyParts,
  WorkoutMenuWithExercises,
} from "@/lib/types";

export interface SettingsClientProps {
  initialExercises: ExerciseWithBodyParts[];
  initialMenus: WorkoutMenuWithExercises[];
}

export function SettingsClient({
  initialExercises,
  initialMenus,
}: SettingsClientProps) {
  const [exercises, setExercises] =
    useState<ExerciseWithBodyParts[]>(initialExercises);
  const [menus, setMenus] = useState<WorkoutMenuWithExercises[]>(initialMenus);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingExercise, setEditingExercise] =
    useState<ExerciseWithBodyParts | null>(null);
  const [editingMenu, setEditingMenu] =
    useState<WorkoutMenuWithExercises | null>(null);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isAddingMenu, setIsAddingMenu] = useState(false);

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="設定" />

      <main className="mx-auto max-w-md p-4">
        <Tabs defaultValue="menus" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menus" className="gap-2">
              <LayoutList className="h-4 w-4" />
              メニュー管理
            </TabsTrigger>
            <TabsTrigger value="exercises" className="gap-2">
              <Dumbbell className="h-4 w-4" />
              種目管理
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
        </Tabs>
      </main>

      {/* Exercise Edit Dialog */}
      <ExerciseEditDialog
        exercise={editingExercise}
        isOpen={!!editingExercise || isAddingExercise}
        isNew={isAddingExercise}
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
  onClose: () => void;
  onSave: (exercise: ExerciseWithBodyParts) => void;
  onDelete: (id: number) => void;
}

function ExerciseEditDialog({
  exercise,
  isOpen,
  isNew,
  onClose,
  onSave,
  onDelete,
}: ExerciseEditDialogProps) {
  const [name, setName] = useState("");
  const [selectedBodyParts, setSelectedBodyParts] = useState<number[]>([]);
  const [formNote, setFormNote] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Reset form when exercise changes
  useState(() => {
    if (exercise) {
      setName(exercise.name);
      setSelectedBodyParts(exercise.bodyParts.map((bp) => bp.id));
      setFormNote(exercise.formNote || "");
      setYoutubeUrl(exercise.youtubeUrl || "");
    }
  });

  const handleSave = () => {
    if (!name.trim()) return;

    const bodyParts = mockBodyParts.filter((bp) =>
      selectedBodyParts.includes(bp.id),
    );

    onSave({
      id: exercise?.id || 0, // 新規作成時は0（実際のDBではAUTO_INCREMENT）
      userId: exercise?.userId || 1, // 数値ID
      name: name.trim(),
      bodyParts,
      formNote: formNote.trim() || undefined,
      youtubeUrl: youtubeUrl.trim() || undefined,
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
              {mockBodyParts.map((part) => (
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
            <label
              htmlFor="exercise-youtube-url"
              className="text-sm font-medium"
            >
              YouTube URL
            </label>
            <Input
              id="exercise-youtube-url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
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
  useState(() => {
    if (menu) {
      setName(menu.name);
      setSelectedExercises(menu.exercises);
    }
  });

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
