import { statusCodes } from "@/src/constants/statusCodes";
import AppError from "@/src/lib/AppError";
import paginate from "@/src/lib/paginate";
import prisma from "@/src/lib/prisma";

type RoutineExercisePayload = {
  exerciseId: number;
  order: number;
  targetSets?: number | null;
  targetReps?: string | null;
  restSeconds?: number | null;
  notes?: string | null;
};

type CreateRoutinePayload = {
  name: string;
  description?: string | null;
  exercises?: RoutineExercisePayload[];
};

type UpdateRoutinePayload = {
  name?: string;
  description?: string | null;
};

type UpdateRoutineExercisePayload = Partial<RoutineExercisePayload>;

async function verifyExercisesBelongToUser(userId: number, exerciseIds: number[]) {
  const uniqueExerciseIds = [...new Set(exerciseIds)];

  if (!uniqueExerciseIds.length) return;

  const exercisesCount = await prisma.exercise.count({
    where: {
      id: { in: uniqueExerciseIds },
      userId,
      isActive: true,
    },
  });

  if (exercisesCount !== uniqueExerciseIds.length) {
    throw new AppError("Exercise not found", statusCodes.NOT_FOUND);
  }
}

async function getRoutineById(userId: number, id: number) {
  const routine = await prisma.routine.findFirst({
    where: { id, userId, isActive: true },
  });

  if (!routine) throw new AppError("Routine not found", statusCodes.NOT_FOUND);

  return routine;
}

async function getRoutineExerciseById(routineId: number, routineExerciseId: number) {
  const routineExercise = await prisma.routineExercise.findFirst({
    where: { id: routineExerciseId, routineId },
  });

  if (!routineExercise) throw new AppError("Routine exercise not found", statusCodes.NOT_FOUND);

  return routineExercise;
}

async function getAllRoutines(filters: {
  userId: number;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: "asc" | "desc";
  orderByField?: "createdAt" | "updatedAt" | "name";
}) {
  const { userId, search, page = 1, limit = 10, orderBy = "desc", orderByField = "createdAt" } = filters;

  const where = {
    userId,
    isActive: true,
    ...(search && {
      OR: [{ name: { contains: search } }, { description: { contains: search } }],
    }),
  };

  const [routines, total] = await prisma.$transaction([
    prisma.routine.findMany({
      where,
      orderBy: { [orderByField]: orderBy },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: { exercises: true },
        },
      },
    }),
    prisma.routine.count({ where }),
  ]);

  return {
    routines,
    pagination: paginate(total, page, limit),
  };
}

async function getSingleRoutineById(userId: number, id: number) {
  const routine = await prisma.routine.findFirst({
    where: { id, userId, isActive: true },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: {
          exercise: true,
        },
      },
    },
  });

  if (!routine) throw new AppError("Routine not found", statusCodes.NOT_FOUND);

  return routine;
}

async function createRoutine(userId: number, data: CreateRoutinePayload) {
  if (data.exercises?.length) {
    await verifyExercisesBelongToUser(
      userId,
      data.exercises.map((exercise) => exercise.exerciseId),
    );
  }

  return await prisma.routine.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
      ...(data.exercises?.length && {
        exercises: {
          create: data.exercises,
        },
      }),
    },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: {
          exercise: true,
        },
      },
    },
  });
}

async function updateRoutine(userId: number, id: number, data: UpdateRoutinePayload) {
  await getRoutineById(userId, id);

  return await prisma.routine.update({
    where: { id },
    data,
  });
}

async function deleteRoutine(userId: number, id: number) {
  await getRoutineById(userId, id);

  return await prisma.routine.update({
    where: { id },
    data: { isActive: false },
  });
}

async function addExerciseToRoutine(userId: number, routineId: number, data: RoutineExercisePayload) {
  await getRoutineById(userId, routineId);
  await verifyExercisesBelongToUser(userId, [data.exerciseId]);

  return await prisma.routineExercise.create({
    data: {
      ...data,
      routineId,
    },
    include: {
      exercise: true,
    },
  });
}

async function updateRoutineExercise(userId: number, routineId: number, routineExerciseId: number, data: UpdateRoutineExercisePayload) {
  await getRoutineById(userId, routineId);
  await getRoutineExerciseById(routineId, routineExerciseId);

  if (data.exerciseId) {
    await verifyExercisesBelongToUser(userId, [data.exerciseId]);
  }

  return await prisma.routineExercise.update({
    where: { id: routineExerciseId },
    data,
    include: {
      exercise: true,
    },
  });
}

async function removeExerciseFromRoutine(userId: number, routineId: number, routineExerciseId: number) {
  await getRoutineById(userId, routineId);
  await getRoutineExerciseById(routineId, routineExerciseId);

  return await prisma.routineExercise.delete({
    where: { id: routineExerciseId },
  });
}

export const routineService = {
  getAllRoutines,
  getSingleRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  addExerciseToRoutine,
  updateRoutineExercise,
  removeExerciseFromRoutine,
};
