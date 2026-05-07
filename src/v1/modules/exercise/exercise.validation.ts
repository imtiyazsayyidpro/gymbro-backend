import { z } from "zod";

const muscleGroupEnum = z.enum([
  "CHEST",
  "BACK",
  "SHOULDERS",
  "BICEPS",
  "TRICEPS",
  "FOREARMS",
  "LEGS",
  "QUADS",
  "HAMSTRINGS",
  "GLUTES",
  "CALVES",
  "CORE",
  "ABS",
  "FULL_BODY",
  "CARDIO",
  "OTHER",
]);

const equipmentEnum = z.enum([
  "BODYWEIGHT",
  "BARBELL",
  "DUMBBELL",
  "KETTLEBELL",
  "MACHINE",
  "CABLE",
  "RESISTANCE_BAND",
  "EZ_BAR",
  "TRAP_BAR",
  "BENCH",
  "PULL_UP_BAR",
  "CARDIO_MACHINE",
  "OTHER",
]);

const exerciseTypeEnum = z.enum(["RESISTANCE", "CARDIO", "MOBILITY", "STRETCHING", "BALANCE", "OTHER"]);

export const exerciseParamsSchema = z.object({
  id: z.coerce.number({ error: "Invalid ID" }),
});

export const exerciseQuerySchema = z.object({
  search: z.string().optional(),
  primaryMuscleGroup: muscleGroupEnum.optional(),
  equipment: equipmentEnum.optional(),
  exerciseType: exerciseTypeEnum.optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  orderBy: z.enum(["asc", "desc"]).optional(),
  orderByField: z.enum(["createdAt", "updatedAt", "name", "primaryMuscleGroup", "equipment", "exerciseType"]).optional(),
});

export const createExerciseSchema = z.object({
  name: z.string({ error: "Name is required" }).min(1, "Name is required"),
  description: z.string().optional().nullable(),
  videoUrl: z.string().url("Video URL must be a valid URL").optional().nullable(),
  primaryMuscleGroup: muscleGroupEnum.optional().nullable(),
  muscleGroups: z.array(muscleGroupEnum).optional().nullable(),
  equipment: equipmentEnum.optional().nullable(),
  exerciseType: exerciseTypeEnum.optional(),
});

export const updateExerciseSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  description: z.string().optional().nullable(),
  videoUrl: z.string().url("Video URL must be a valid URL").optional().nullable(),
  primaryMuscleGroup: muscleGroupEnum.optional().nullable(),
  muscleGroups: z.array(muscleGroupEnum).optional().nullable(),
  equipment: equipmentEnum.optional().nullable(),
  exerciseType: exerciseTypeEnum.optional(),
});
