import { z } from "zod";

const routineExerciseSchema = z.object({
  exerciseId: z.number({ error: "Exercise ID is required" }).int("Exercise ID must be an integer").positive("Exercise ID must be positive"),
  order: z.number({ error: "Order is required" }).int("Order must be an integer").positive("Order must be positive"),
  targetSets: z.number().int("Target sets must be an integer").positive("Target sets must be positive").optional().nullable(),
  targetReps: z.string().optional().nullable(),
  restSeconds: z.number().int("Rest seconds must be an integer").positive("Rest seconds must be positive").optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const routineParamsSchema = z.object({
  id: z.coerce.number({ error: "Invalid ID" }),
});

export const routineExerciseParamsSchema = z.object({
  routineId: z.coerce.number({ error: "Invalid routine ID" }),
  routineExerciseId: z.coerce.number({ error: "Invalid routine exercise ID" }),
});

export const routineQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  orderBy: z.enum(["asc", "desc"]).optional(),
  orderByField: z.enum(["createdAt", "updatedAt", "name"]).optional(),
});

export const createRoutineSchema = z.object({
  name: z.string({ error: "Name is required" }).min(1, "Name is required"),
  description: z.string().optional().nullable(),
  exercises: z.array(routineExerciseSchema).optional(),
});

export const updateRoutineSchema = z
  .object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    description: z.string().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");

export const addRoutineExerciseSchema = routineExerciseSchema;

export const updateRoutineExerciseSchema = z
  .object({
    exerciseId: z.number().int("Exercise ID must be an integer").positive("Exercise ID must be positive").optional(),
    order: z.number().int("Order must be an integer").positive("Order must be positive").optional(),
    targetSets: z.number().int("Target sets must be an integer").positive("Target sets must be positive").optional().nullable(),
    targetReps: z.string().optional().nullable(),
    restSeconds: z.number().int("Rest seconds must be an integer").positive("Rest seconds must be positive").optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");
