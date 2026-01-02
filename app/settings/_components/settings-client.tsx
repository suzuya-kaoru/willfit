"use client";

import {
  ChevronRight,
  ClipboardList,
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
  type CreateTemplateInput,
  createTemplateAction,
  deleteTemplateAction,
  type UpdateTemplateInput,
  updateTemplateAction,
} from "@/app/_actions/template-actions";
import {
  type CreateWorkoutSessionInput,
  createWorkoutSessionAction,
  deleteWorkoutSessionAction,
  type UpdateWorkoutSessionInput,
  updateWorkoutSessionAction,
} from "@/app/_actions/workout-session-actions";
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
  WorkoutSessionWithExercises,
  WorkoutTemplateWithExercises,
} from "@/lib/types";
import {
  ExerciseEditDialog,
  TemplateEditDialog,
  WorkoutSessionDialog,
} from "./dialogs";

export interface SettingsClientProps {
  initialExercises: ExerciseWithBodyParts[];
  initialTemplates: WorkoutTemplateWithExercises[];
  initialWorkoutSessions: WorkoutSessionWithExercises[];
  initialBodyParts: BodyPart[];
}

export function SettingsClient({
  initialExercises,
  initialTemplates,
  initialWorkoutSessions,
  initialBodyParts,
}: SettingsClientProps) {
  // propsを直接使用
  const exercises = initialExercises;
  const templates = initialTemplates;
  const workoutSessions = initialWorkoutSessions;
  const bodyParts = initialBodyParts;

  const [searchQuery, setSearchQuery] = useState("");
  const [editingExercise, setEditingExercise] =
    useState<ExerciseWithBodyParts | null>(null);
  const [editingTemplate, setEditingTemplate] =
    useState<WorkoutTemplateWithExercises | null>(null);
  const [editingSession, setEditingSession] =
    useState<WorkoutSessionWithExercises | null>(null);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [isAddingSession, setIsAddingSession] = useState(false);
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

  // Template CRUD
  const handleSaveTemplate = async (
    input: CreateTemplateInput | UpdateTemplateInput,
  ) => {
    if (isAddingTemplate) {
      await createTemplateAction(input);
      router.refresh();
      setIsAddingTemplate(false);
    } else if ("id" in input) {
      await updateTemplateAction(input);
      router.refresh();
      setEditingTemplate(null);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    await deleteTemplateAction(id);
    router.refresh();
  };

  // WorkoutSession CRUD
  const handleSaveSession = async (
    input: CreateWorkoutSessionInput | UpdateWorkoutSessionInput,
  ) => {
    if (isAddingSession) {
      await createWorkoutSessionAction(input as CreateWorkoutSessionInput);
      router.refresh();
      setIsAddingSession(false);
    } else if ("id" in input) {
      await updateWorkoutSessionAction(input as UpdateWorkoutSessionInput);
      router.refresh();
      setEditingSession(null);
    }
  };

  const handleDeleteSession = async (id: number) => {
    await deleteWorkoutSessionAction(id);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="設定" />

      <main className="mx-auto max-w-md px-4 pt-2 pb-4">
        <Tabs defaultValue="session-plans" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="session-plans"
              className="gap-1 text-xs sm:gap-2 sm:text-sm"
            >
              <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">セッション管理</span>
              <span className="sm:hidden">セッション</span>
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="gap-1 text-xs sm:gap-2 sm:text-sm"
            >
              <LayoutList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">テンプレ管理</span>
              <span className="sm:hidden">テンプレ</span>
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

          {/* Session Management Tab */}
          <TabsContent value="session-plans" className="space-y-4">
            <Button
              className="w-full gap-2"
              onClick={() => {
                setIsAddingSession(true);
                setEditingSession(null);
              }}
            >
              <Plus className="h-4 w-4" />
              新規セッション作成
            </Button>

            <div className="space-y-3">
              {workoutSessions.map((session) => (
                <Card key={session.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-base">
                        {session.name}
                      </CardTitle>
                      {session.description && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {session.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingSession(session);
                          setIsAddingSession(false);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteSession(session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 text-xs font-semibold text-muted-foreground">
                      ベーステンプレート: {session.template.name}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {session.exercises.map((ex, index) => (
                        <div
                          key={ex.id}
                          className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1"
                        >
                          <span className="text-xs font-medium text-secondary-foreground">
                            {index + 1}. {ex.exercise.name}
                          </span>
                          {(ex.targetWeight || ex.targetReps) && (
                            <span className="text-[10px] text-muted-foreground ml-1">
                              {ex.targetWeight ? `${ex.targetWeight}kg` : ""}
                              {ex.targetWeight && ex.targetReps ? " x " : ""}
                              {ex.targetReps ? `${ex.targetReps}回` : ""}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {session.exercises.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        種目が設定されていません
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {workoutSessions.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  セッションがありません。
                  <br />
                  よく行うトレーニングの目標設定を保存しましょう。
                </p>
              )}
            </div>
          </TabsContent>

          {/* Template Management Tab */}
          <TabsContent value="templates" className="space-y-4">
            <Button
              className="w-full gap-2"
              onClick={() => {
                setIsAddingTemplate(true);
                setEditingTemplate(null);
              }}
            >
              <Plus className="h-4 w-4" />
              新規テンプレ作成
            </Button>

            <div className="space-y-3">
              {templates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingTemplate(template);
                          setIsAddingTemplate(false);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {template.exercises.map((ex, index) => (
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
                    {template.exercises.length === 0 && (
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

      {/* Template Edit Dialog */}
      <TemplateEditDialog
        template={editingTemplate}
        isOpen={!!editingTemplate || isAddingTemplate}
        isNew={isAddingTemplate}
        exercises={exercises}
        onClose={() => {
          setEditingTemplate(null);
          setIsAddingTemplate(false);
        }}
        onSave={handleSaveTemplate}
        onDelete={handleDeleteTemplate}
      />

      {/* WorkoutSession Edit Dialog */}
      <WorkoutSessionDialog
        session={editingSession}
        isOpen={!!editingSession || isAddingSession}
        isNew={isAddingSession}
        templates={templates}
        allExercises={exercises}
        onClose={() => {
          setEditingSession(null);
          setIsAddingSession(false);
        }}
        onSave={handleSaveSession}
        onDelete={handleDeleteSession}
      />

      <BottomNavigation />
    </div>
  );
}
