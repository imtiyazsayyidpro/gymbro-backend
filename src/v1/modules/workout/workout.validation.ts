import { z } from "zod";

const workoutStatusEnum = z.enum(["IN_PROGRESS", "COMPLETED", "CANCELLED"]);
const workoutExerciseStatusEnum = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED"]);
const workoutSetTypeEnum = z.enum(["NORMAL", "WARMUP", "DROP", "FAILURE"]);

export const workoutParamsSchema = z.object({
  id: z.coerce.number({ error: "Invalid ID" }).int("Invalid ID").positive("Invalid ID"),
});

export const startRoutineParamsSchema = z.object({
  routineId: z.coerce.number({ error: "Invalid routine ID" }).int("Invalid routine ID").positive("Invalid routine ID"),
});

export const workoutExerciseParamsSchema = z.object({
  workoutId: z.coerce.number({ error: "Invalid workout ID" }).int("Invalid workout ID").positive("Invalid workout ID"),
  workoutExerciseId: z.coerce.number({ error: "Invalid workout exercise ID" }).int("Invalid workout exercise ID").positive("Invalid workout exercise ID"),
});

export const workoutSetParamsSchema = z.object({
  workoutId: z.coerce.number({ error: "Invalid workout ID" }).int("Invalid workout ID").positive("Invalid workout ID"),
  workoutExerciseId: z.coerce.number({ error: "Invalid workout exercise ID" }).int("Invalid workout exercise ID").positive("Invalid workout exercise ID"),
  setId: z.coerce.number({ error: "Invalid set ID" }).int("Invalid set ID").positive("Invalid set ID"),
});

export const workoutQuerySchema = z.object({
  page: z.coerce.number().int("Page must be an integer").positive("Page must be positive").optional(),
  limit: z.coerce.number().int("Limit must be an integer").positive("Limit must be positive").max(100, "Limit cannot exceed 100").optional(),
  status: workoutStatusEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  orderBy: z.enum(["asc", "desc"]).optional(),
  orderByField: z.enum(["date", "createdAt", "updatedAt", "startedAt", "completedAt", "name", "status"]).optional(),
});

export const updateWorkoutExerciseSchema = z
  .object({
    order: z.number().int("Order must be an integer").positive("Order must be positive").optional(),
    targetSets: z.number().int("Target sets must be an integer").positive("Target sets must be positive").optional().nullable(),
    targetReps: z.string().optional().nullable(),
    restSeconds: z.number().int("Rest seconds must be an integer").positive("Rest seconds must be positive").optional().nullable(),
    notes: z.string().optional().nullable(),
    status: workoutExerciseStatusEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");

const workoutSetSchema = z.object({
  setNumber: z.number().int("Set number must be an integer").positive("Set number must be positive").optional(),
  weight: z.number().nonnegative("Weight cannot be negative").optional().nullable(),
  reps: z.number().int("Reps must be an integer").positive("Reps must be positive").optional().nullable(),
  setType: workoutSetTypeEnum.optional(),
  notes: z.string().optional().nullable(),
});

export const addWorkoutSetSchema = workoutSetSchema.refine((data) => data.weight != null || data.reps != null, "Weight or reps is required");

export const updateWorkoutSetSchema = workoutSetSchema.refine((data) => Object.keys(data).length > 0, "At least one field is required");
