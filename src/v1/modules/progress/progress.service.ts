import { statusCodes } from "@/src/constants/statusCodes";
import AppError from "@/src/lib/AppError";
import prisma from "@/src/lib/prisma";
import { MuscleGroup, WorkoutSetType, WorkoutStatus } from "@/generated/prisma/client";

const DEFAULT_PROGRESS_SET_TYPES = [WorkoutSetType.NORMAL, WorkoutSetType.DROP, WorkoutSetType.FAILURE];
const WORKING_SET_TYPES = new Set<WorkoutSetType>([WorkoutSetType.NORMAL, WorkoutSetType.DROP, WorkoutSetType.FAILURE]);

type DateRange = {
  startDate?: Date;
  endDate?: Date;
};

function getDateFilter(filters: DateRange) {
  const { startDate, endDate } = filters;

  if (!startDate && !endDate) return undefined;

  const normalizedEndDate = endDate ? new Date(endDate) : undefined;
  normalizedEndDate?.setHours(23, 59, 59, 999);

  return {
    ...(startDate && { gte: startDate }),
    ...(normalizedEndDate && { lte: normalizedEndDate }),
  };
}

function getSetVolume(set: { weight: number | null; reps: number | null }) {
  if (set.weight == null || set.reps == null) return 0;

  return set.weight * set.reps;
}

function getPercentage(volume: number, totalVolume: number) {
  if (!totalVolume) return 0;

  return Math.round((volume / totalVolume) * 100);
}

function parseSetTypes(setTypes?: string) {
  if (!setTypes) return DEFAULT_PROGRESS_SET_TYPES;

  return setTypes
    .split(",")
    .map((setType) => setType.trim())
    .filter(Boolean) as WorkoutSetType[];
}

async function getUserExercise(userId: number, exerciseId: number) {
  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, userId },
    select: {
      id: true,
      name: true,
      primaryMuscleGroup: true,
    },
  });

  if (!exercise) throw new AppError("Exercise not found", statusCodes.NOT_FOUND);

  return exercise;
}

async function getUserRoutine(userId: number, routineId: number) {
  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!routine) throw new AppError("Routine not found", statusCodes.NOT_FOUND);

  return routine;
}

async function getExerciseProgress(userId: number, exerciseId: number, filters: DateRange & { setTypes?: string }) {
  const exercise = await getUserExercise(userId, exerciseId);
  const includedSetTypes = parseSetTypes(filters.setTypes);
  const dateFilter = getDateFilter(filters);

  const workoutSessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      status: WorkoutStatus.COMPLETED,
      ...(dateFilter && { date: dateFilter }),
      exercises: {
        some: { exerciseId },
      },
    },
    orderBy: { date: "asc" },
    include: {
      exercises: {
        where: { exerciseId },
        orderBy: { order: "asc" },
        include: {
          sets: {
            orderBy: { setNumber: "asc" },
            select: {
              id: true,
              setNumber: true,
              weight: true,
              reps: true,
              setType: true,
            },
          },
        },
      },
    },
  });

  const chart = workoutSessions.map((workoutSession) => {
    const allSets = workoutSession.exercises.flatMap((workoutExercise) => workoutExercise.sets);
    const includedSets = allSets.filter((set) => includedSetTypes.includes(set.setType));
    const bestSet = includedSets.reduce<(typeof includedSets)[number] | null>((best, set) => {
      if (set.weight == null) return best;
      if (!best || best.weight == null || set.weight > best.weight) return set;

      return best;
    }, null);

    return {
      date: workoutSession.date,
      workoutSessionId: workoutSession.id,
      workoutName: workoutSession.name,
      workingVolume: allSets.filter((set) => WORKING_SET_TYPES.has(set.setType)).reduce((total, set) => total + getSetVolume(set), 0),
      totalVolume: allSets.reduce((total, set) => total + getSetVolume(set), 0),
      bestWeight: bestSet?.weight ?? null,
      bestSetReps: bestSet?.reps ?? null,
      totalReps: includedSets.reduce((total, set) => total + (set.reps ?? 0), 0),
      totalSets: includedSets.length,
    };
  });

  return { exercise, chart };
}

async function getExerciseSetTypeBreakdown(userId: number, exerciseId: number, filters: DateRange) {
  const exercise = await getUserExercise(userId, exerciseId);
  const dateFilter = getDateFilter(filters);

  const workoutSessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      status: WorkoutStatus.COMPLETED,
      ...(dateFilter && { date: dateFilter }),
      exercises: {
        some: { exerciseId },
      },
    },
    include: {
      exercises: {
        where: { exerciseId },
        include: {
          sets: {
            select: {
              weight: true,
              reps: true,
              setType: true,
            },
          },
        },
      },
    },
  });

  const breakdownMap = new Map<WorkoutSetType, { setType: WorkoutSetType; volume: number; setCount: number }>();

  for (const workoutSession of workoutSessions) {
    for (const workoutExercise of workoutSession.exercises) {
      for (const set of workoutExercise.sets) {
        const current = breakdownMap.get(set.setType) ?? { setType: set.setType, volume: 0, setCount: 0 };
        current.volume += getSetVolume(set);
        current.setCount += 1;
        breakdownMap.set(set.setType, current);
      }
    }
  }

  const totalVolume = [...breakdownMap.values()].reduce((total, item) => total + item.volume, 0);
  const breakdown = [...breakdownMap.values()]
    .map((item) => ({
      ...item,
      percentage: getPercentage(item.volume, totalVolume),
    }))
    .sort((a, b) => b.volume - a.volume);

  return {
    exercise: {
      id: exercise.id,
      name: exercise.name,
    },
    breakdown,
  };
}

async function getRoutineVolumeProgress(userId: number, routineId: number, filters: DateRange) {
  const routine = await getUserRoutine(userId, routineId);
  const dateFilter = getDateFilter(filters);

  const workoutSessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      routineId,
      status: WorkoutStatus.COMPLETED,
      ...(dateFilter && { date: dateFilter }),
    },
    orderBy: { date: "asc" },
    include: {
      exercises: {
        include: {
          sets: {
            select: {
              weight: true,
              reps: true,
              setType: true,
            },
          },
        },
      },
    },
  });

  const chart = workoutSessions.map((workoutSession) => {
    const sets = workoutSession.exercises.flatMap((workoutExercise) => workoutExercise.sets);

    return {
      date: workoutSession.date,
      workoutSessionId: workoutSession.id,
      workoutName: workoutSession.name,
      workingVolume: sets.filter((set) => WORKING_SET_TYPES.has(set.setType)).reduce((total, set) => total + getSetVolume(set), 0),
      totalVolume: sets.reduce((total, set) => total + getSetVolume(set), 0),
      totalSets: sets.length,
      totalReps: sets.reduce((total, set) => total + (set.reps ?? 0), 0),
      exerciseCount: workoutSession.exercises.length,
    };
  });

  return { routine, chart };
}

async function getMuscleGroupVolumeBreakdown(userId: number, filters: DateRange & { routineId?: number }) {
  if (filters.routineId) {
    await getUserRoutine(userId, filters.routineId);
  }

  const dateFilter = getDateFilter(filters);
  const workoutSessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      status: WorkoutStatus.COMPLETED,
      ...(filters.routineId && { routineId: filters.routineId }),
      ...(dateFilter && { date: dateFilter }),
    },
    include: {
      exercises: {
        include: {
          exercise: {
            select: {
              primaryMuscleGroup: true,
            },
          },
          sets: {
            select: {
              weight: true,
              reps: true,
              setType: true,
            },
          },
        },
      },
    },
  });

  const breakdownMap = new Map<MuscleGroup | "OTHER", { muscleGroup: MuscleGroup | "OTHER"; volume: number; setCount: number }>();

  for (const workoutSession of workoutSessions) {
    for (const workoutExercise of workoutSession.exercises) {
      const muscleGroup = workoutExercise.exercise.primaryMuscleGroup ?? "OTHER";

      for (const set of workoutExercise.sets) {
        if (!WORKING_SET_TYPES.has(set.setType)) continue;

        const current = breakdownMap.get(muscleGroup) ?? { muscleGroup, volume: 0, setCount: 0 };
        current.volume += getSetVolume(set);
        current.setCount += 1;
        breakdownMap.set(muscleGroup, current);
      }
    }
  }

  const totalVolume = [...breakdownMap.values()].reduce((total, item) => total + item.volume, 0);
  const breakdown = [...breakdownMap.values()]
    .map((item) => ({
      ...item,
      percentage: getPercentage(item.volume, totalVolume),
    }))
    .sort((a, b) => b.volume - a.volume);

  return { breakdown };
}

export const progressService = {
  getExerciseProgress,
  getExerciseSetTypeBreakdown,
  getRoutineVolumeProgress,
  getMuscleGroupVolumeBreakdown,
};
