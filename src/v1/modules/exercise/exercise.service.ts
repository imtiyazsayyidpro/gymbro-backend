import { statusCodes } from "@/src/constants/statusCodes";
import AppError from "@/src/lib/AppError";
import paginate from "@/src/lib/paginate";
import prisma from "@/src/lib/prisma";
import { Equipment, ExerciseType, MuscleGroup, Prisma } from "@/generated/prisma/client";

type ExercisePayload = {
  name: string;
  description?: string | null;
  videoUrl?: string | null;
  primaryMuscleGroup?: MuscleGroup | null;
  muscleGroups?: MuscleGroup[] | null;
  equipment?: Equipment | null;
  exerciseType?: ExerciseType;
};

function throwDuplicateExerciseName() {
  throw new AppError("Exercise with this name already exists", statusCodes.CONFLICT);
}

function handleExerciseUniqueError(err: unknown) {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    const target = Array.isArray(err.meta?.target) ? err.meta.target : [];

    if (target.includes("userId") && target.includes("name")) {
      throwDuplicateExerciseName();
    }
  }

  throw err;
}

async function ensureExerciseNameIsAvailable(userId: number, name: string, excludeId?: number) {
  const existingExercise = await prisma.exercise.findFirst({
    where: {
      userId,
      name,
      isActive: true,
      ...(excludeId && { NOT: { id: excludeId } }),
    },
  });

  if (existingExercise) throwDuplicateExerciseName();
}

async function getAllExercises(filters: {
  userId: number;
  search?: string;
  primaryMuscleGroup?: MuscleGroup;
  equipment?: Equipment;
  exerciseType?: ExerciseType;
  page?: number;
  limit?: number;
  orderBy?: "asc" | "desc";
  orderByField?: "createdAt" | "updatedAt" | "name" | "primaryMuscleGroup" | "equipment" | "exerciseType";
}) {
  const { userId, search, primaryMuscleGroup, equipment, exerciseType, page = 1, limit = 10, orderBy = "desc", orderByField = "createdAt" } = filters;

  const where = {
    userId,
    isActive: true,
    ...(primaryMuscleGroup && { primaryMuscleGroup }),
    ...(equipment && { equipment }),
    ...(exerciseType && { exerciseType }),
    ...(search && {
      OR: [{ name: { contains: search } }, { description: { contains: search } }],
    }),
  };

  const [exercises, total] = await prisma.$transaction([
    prisma.exercise.findMany({
      where,
      orderBy: { [orderByField]: orderBy },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.exercise.count({ where }),
  ]);

  return {
    exercises,
    pagination: paginate(total, page, limit),
  };
}

async function getSingleExerciseById(userId: number, id: number) {
  const exercise = await prisma.exercise.findFirst({
    where: { id, userId, isActive: true },
  });

  if (!exercise) throw new AppError("Exercise not found", statusCodes.NOT_FOUND);

  return exercise;
}

async function createExercise(userId: number, data: ExercisePayload) {
  await ensureExerciseNameIsAvailable(userId, data.name);

  try {
    return await prisma.exercise.create({
      data: {
        ...data,
        userId,
        muscleGroups: data.muscleGroups ?? undefined,
      },
    });
  } catch (err) {
    handleExerciseUniqueError(err);
  }
}

async function updateExercise(userId: number, id: number, data: Partial<ExercisePayload>) {
  await getSingleExerciseById(userId, id);

  if (data.name) {
    await ensureExerciseNameIsAvailable(userId, data.name, id);
  }

  const { muscleGroups, ...exerciseData } = data;
  const updateData: Prisma.ExerciseUpdateInput = {
    ...exerciseData,
    ...(muscleGroups !== undefined && { muscleGroups: muscleGroups ?? Prisma.DbNull }),
  };

  try {
    return await prisma.exercise.update({
      where: { id },
      data: updateData,
    });
  } catch (err) {
    handleExerciseUniqueError(err);
  }
}

async function deleteExercise(userId: number, id: number) {
  await getSingleExerciseById(userId, id);

  return await prisma.exercise.update({
    where: { id },
    data: { isActive: false },
  });
}

export const exerciseService = {
  getAllExercises,
  getSingleExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
