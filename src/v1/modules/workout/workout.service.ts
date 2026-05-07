import { statusCodes } from "@/src/constants/statusCodes";
import AppError from "@/src/lib/AppError";
import paginate from "@/src/lib/paginate";
import prisma from "@/src/lib/prisma";
import { WorkoutExerciseStatus, WorkoutSetType, WorkoutStatus } from "@/generated/prisma/client";

type UpdateWorkoutExercisePayload = {
  order?: number;
  targetSets?: number | null;
  targetReps?: string | null;
  restSeconds?: number | null;
  notes?: string | null;
  status?: WorkoutExerciseStatus;
};

type WorkoutSetPayload = {
  setNumber?: number;
  weight?: number | null;
  reps?: number | null;
  setType?: WorkoutSetType;
  notes?: string | null;
};

async function getWorkoutById(userId: number, id: number) {
  const workout = await prisma.workoutSession.findFirst({
    where: { id, userId },
  });

  if (!workout) throw new AppError("Workout not found", statusCodes.NOT_FOUND);

  return workout;
}

async function getInProgressWorkoutById(userId: number, id: number) {
  const workout = await getWorkoutById(userId, id);

  if (workout.status !== WorkoutStatus.IN_PROGRESS) {
    throw new AppError("Workout is not in progress", statusCodes.BAD_REQUEST);
  }

  return workout;
}

async function getWorkoutExerciseById(workoutSessionId: number, workoutExerciseId: number) {
  const workoutExercise = await prisma.workoutExercise.findFirst({
    where: { id: workoutExerciseId, workoutSessionId },
  });

  if (!workoutExercise) throw new AppError("Workout exercise not found", statusCodes.NOT_FOUND);

  return workoutExercise;
}

async function getWorkoutSetById(workoutExerciseId: number, setId: number) {
  const workoutSet = await prisma.workoutSet.findFirst({
    where: { id: setId, workoutExerciseId },
  });

  if (!workoutSet) throw new AppError("Set not found", statusCodes.NOT_FOUND);

  return workoutSet;
}

async function startWorkoutFromRoutine(userId: number, routineId: number) {
  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId, isActive: true },
    include: {
      exercises: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!routine) throw new AppError("Routine not found", statusCodes.NOT_FOUND);

  return await prisma.workoutSession.create({
    data: {
      userId,
      routineId,
      name: routine.name,
      status: WorkoutStatus.IN_PROGRESS,
      exercises: {
        create: routine.exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          order: exercise.order,
          targetSets: exercise.targetSets,
          targetReps: exercise.targetReps,
          restSeconds: exercise.restSeconds,
          notes: exercise.notes,
        })),
      },
    },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: {
          exercise: true,
          sets: {
            orderBy: { setNumber: "asc" },
          },
        },
      },
    },
  });
}

async function getActiveWorkout(userId: number) {
  return await prisma.workoutSession.findFirst({
    where: {
      userId,
      status: WorkoutStatus.IN_PROGRESS,
    },
    orderBy: { startedAt: "desc" },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: {
          exercise: true,
          sets: {
            orderBy: { setNumber: "asc" },
          },
        },
      },
    },
  });
}

async function getSingleWorkoutById(userId: number, id: number) {
  const workout = await prisma.workoutSession.findFirst({
    where: { id, userId },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: {
          exercise: true,
          sets: {
            orderBy: { setNumber: "asc" },
          },
        },
      },
    },
  });

  if (!workout) throw new AppError("Workout not found", statusCodes.NOT_FOUND);

  return workout;
}

async function getWorkoutHistory(filters: {
  userId: number;
  page?: number;
  limit?: number;
  status?: WorkoutStatus;
  startDate?: Date;
  endDate?: Date;
  orderBy?: "asc" | "desc";
  orderByField?: "date" | "createdAt" | "updatedAt" | "startedAt" | "completedAt" | "name" | "status";
}) {
  const { userId, page = 1, limit = 10, status, startDate, endDate, orderBy = "desc", orderByField = "date" } = filters;

  const where = {
    userId,
    ...(status && { status }),
    ...((startDate || endDate) && {
      date: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
    }),
  };

  const [workouts, total] = await prisma.$transaction([
    prisma.workoutSession.findMany({
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
    prisma.workoutSession.count({ where }),
  ]);

  return {
    workouts,
    pagination: paginate(total, page, limit),
  };
}

async function updateWorkoutExercise(userId: number, workoutId: number, workoutExerciseId: number, data: UpdateWorkoutExercisePayload) {
  await getInProgressWorkoutById(userId, workoutId);
  await getWorkoutExerciseById(workoutId, workoutExerciseId);

  return await prisma.workoutExercise.update({
    where: { id: workoutExerciseId },
    data,
    include: {
      exercise: true,
      sets: {
        orderBy: { setNumber: "asc" },
      },
    },
  });
}

async function addSet(userId: number, workoutId: number, workoutExerciseId: number, data: WorkoutSetPayload) {
  await getInProgressWorkoutById(userId, workoutId);
  const workoutExercise = await getWorkoutExerciseById(workoutId, workoutExerciseId);

  const setNumber = data.setNumber ?? ((await prisma.workoutSet.aggregate({ where: { workoutExerciseId }, _max: { setNumber: true } }))._max.setNumber ?? 0) + 1;

  return await prisma.$transaction(async (tx) => {
    const workoutSet = await tx.workoutSet.create({
      data: {
        ...data,
        setNumber,
        workoutExerciseId,
        setType: data.setType ?? WorkoutSetType.NORMAL,
      },
    });

    if (workoutExercise.status === WorkoutExerciseStatus.PENDING) {
      await tx.workoutExercise.update({
        where: { id: workoutExerciseId },
        data: { status: WorkoutExerciseStatus.IN_PROGRESS },
      });
    }

    return workoutSet;
  });
}

async function updateSet(userId: number, workoutId: number, workoutExerciseId: number, setId: number, data: WorkoutSetPayload) {
  await getInProgressWorkoutById(userId, workoutId);
  await getWorkoutExerciseById(workoutId, workoutExerciseId);
  await getWorkoutSetById(workoutExerciseId, setId);

  return await prisma.workoutSet.update({
    where: { id: setId },
    data,
  });
}

async function deleteSet(userId: number, workoutId: number, workoutExerciseId: number, setId: number) {
  await getInProgressWorkoutById(userId, workoutId);
  await getWorkoutExerciseById(workoutId, workoutExerciseId);
  await getWorkoutSetById(workoutExerciseId, setId);

  return await prisma.workoutSet.delete({
    where: { id: setId },
  });
}

async function completeWorkout(userId: number, id: number) {
  await getInProgressWorkoutById(userId, id);

  await prisma.workoutExercise.updateMany({
    where: {
      workoutSessionId: id,
      status: { not: WorkoutExerciseStatus.SKIPPED },
    },
    data: { status: WorkoutExerciseStatus.COMPLETED },
  });

  return await prisma.workoutSession.update({
    where: { id },
    data: {
      status: WorkoutStatus.COMPLETED,
      completedAt: new Date(),
    },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: {
          exercise: true,
          sets: {
            orderBy: { setNumber: "asc" },
          },
        },
      },
    },
  });
}

async function cancelWorkout(userId: number, id: number) {
  await getInProgressWorkoutById(userId, id);

  return await prisma.workoutSession.update({
    where: { id },
    data: { status: WorkoutStatus.CANCELLED },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: {
          exercise: true,
          sets: {
            orderBy: { setNumber: "asc" },
          },
        },
      },
    },
  });
}

export const workoutService = {
  startWorkoutFromRoutine,
  getActiveWorkout,
  getSingleWorkoutById,
  getWorkoutHistory,
  updateWorkoutExercise,
  addSet,
  updateSet,
  deleteSet,
  completeWorkout,
  cancelWorkout,
};
