import { z } from "zod";

const workoutSetTypeEnum = z.enum(["NORMAL", "WARMUP", "DROP", "FAILURE"]);

function parseSetTypes(value: string) {
  return value
    .split(",")
    .map((setType) => setType.trim())
    .filter(Boolean);
}

function validateDateRange(data: { startDate?: Date; endDate?: Date }) {
  if (data.startDate && data.endDate) {
    return data.endDate >= data.startDate;
  }

  return true;
}

export const exerciseProgressParamsSchema = z.object({
  exerciseId: z.coerce.number({ error: "Invalid exercise ID" }).int("Invalid exercise ID").positive("Invalid exercise ID"),
});

export const routineProgressParamsSchema = z.object({
  routineId: z.coerce.number({ error: "Invalid routine ID" }).int("Invalid routine ID").positive("Invalid routine ID"),
});

export const exerciseProgressQuerySchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    setTypes: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (!value) return true;
          return parseSetTypes(value).every((setType) => workoutSetTypeEnum.safeParse(setType).success);
        },
        { message: "Invalid set type" },
      ),
  })
  .refine(validateDateRange, "End date cannot be before start date");

export const dateRangeQuerySchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(validateDateRange, "End date cannot be before start date");

export const muscleGroupVolumeQuerySchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    routineId: z.coerce.number().int("Routine ID must be an integer").positive("Routine ID must be positive").optional(),
  })
  .refine(validateDateRange, "End date cannot be before start date");
