import type { ExerciseWithBodyParts } from "@/lib/types";

export type Period = "1m" | "3m" | "1y";
export type Metric = "weight" | "1rm" | "volume";

export interface WeightDataPoint {
  date: string;
  weight: number;
}

export interface ExerciseDataPoint {
  date: string;
  weight: number;
  "1rm": number;
  volume: number;
}

export interface PersonalBest {
  id: number;
  exerciseName: string;
  weight: number;
  date: string;
}

export interface AnalyticsClientProps {
  allExercises: ExerciseWithBodyParts[];
  allWeightRecords: Array<{
    recordedAt: Date;
    weight: number;
  }>;
  exerciseDataByExerciseId: Record<number, ExerciseDataPoint[]>;
  personalBests: PersonalBest[];
}
