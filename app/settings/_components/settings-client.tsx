"use client";

import {
  ChevronRight,
  Dumbbell,
  LayoutList,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  type CreateExerciseInput,
  createExerciseAction,
  deleteExerciseAction,
  type UpdateExerciseInput,
  updateExerciseAction,
} from "@/app/_actions/exercise-actions";
import {
  type CreateMenuInput,
  createMenuAction,
  deleteMenuAction,
  type UpdateMenuInput,
  updateMenuAction,
} from "@/app/_actions/menu-actions";
import { AppHeader } from "@/components/app-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  BodyPart,
  ExerciseWithBodyParts,
  WorkoutMenuWithExercises,
} from "@/lib/types";
import { ExerciseEditDialog, MenuEditDialog } from "./dialogs";

export interface SettingsClientProps {
  initialExercises: ExerciseWithBodyParts[];
  initialMenus: WorkoutMenuWithExercises[];
  initialBodyParts: BodyPart[];
}

export function SettingsClient({
  initialExercises,
  initialMenus,
  initialBodyParts,
}: SettingsClientProps) {
  // propsを直接使用（冗長なuseState+useEffectを削除）
  const exercises = initialExercises;
  const menus = initialMenus;
  const bodyParts = initialBodyParts;

  const [searchQuery, setSearchQuery] = useState("");
  const [editingExercise, setEditingExercise] =
    useState<ExerciseWithBodyParts | null>(null);
  const [editingMenu, setEditingMenu] =
    useState<WorkoutMenuWithExercises | null>(null);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isAddingMenu, setIsAddingMenu] = useState(false);
  const router = useRouter();

  // Filter exercises by search query
  const filteredExercises = exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.bodyParts.some((bp) => bp.name.includes(searchQuery)),
  );

  // Exercise CRUD
  const handleSaveExercise = async (
    input: CreateExerciseInput | UpdateExerciseInput,
  ) => {
    if (isAddingExercise) {
      await createExerciseAction(input);
      router.refresh();
      setIsAddingExercise(false);
    } else if ("id" in input) {
      await updateExerciseAction(input);
      router.refresh();
      setEditingExercise(null);
    }
  };

  const handleDeleteExercise = async (id: number) => {
    await deleteExerciseAction(id);
    router.refresh();
  };

  // Menu CRUD
  const handleSaveMenu = async (input: CreateMenuInput | UpdateMenuInput) => {
    if (isAddingMenu) {
      await createMenuAction(input);
      router.refresh();
      setIsAddingMenu(false);
    } else if ("id" in input) {
      await updateMenuAction(input);
      router.refresh();
      setEditingMenu(null);
    }
  };

  const handleDeleteMenu = async (id: number) => {
    await deleteMenuAction(id);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="設定" />

      <main className="mx-auto max-w-md px-4 pt-2 pb-4">
        <Tabs defaultValue="menus" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
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
          </TabsList>

          {/* Menu Management Tab */}
          <TabsContent value="menus" className="space-y-4">
            <Button
              className="w-full gap-2"
              onClick={() => {
                setIsAddingMenu(true);
                setEditingMenu(null);
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
                setEditingExercise(null);
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
