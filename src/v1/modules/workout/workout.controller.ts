import { statusCodes } from "@/src/constants/statusCodes";
import sendResponse from "@/src/lib/sendResponse";
import { WorkoutStatus } from "@/generated/prisma/client";
import { NextFunction, Request, Response } from "express";
import { workoutService } from "./workout.service";

async function startWorkoutFromRoutine(req: Request, res: Response, next: NextFunction) {
  try {
    const { routineId } = req.params;
    const workout = await workoutService.startWorkoutFromRoutine(req.user.id, Number(routineId));

    return sendResponse({ res, status: true, message: "Workout started successfully", data: workout, statusCode: statusCodes.CREATED });
  } catch (err) {
    next(err);
  }
}

async function getActiveWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const workout = await workoutService.getActiveWorkout(req.user.id);

    return sendResponse({ res, status: true, message: "Active workout fetched successfully", data: workout });
  } catch (err) {
    next(err);
  }
}

async function getSingleWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const workout = await workoutService.getSingleWorkoutById(req.user.id, Number(id));

    return sendResponse({ res, status: true, message: "Workout fetched successfully", data: workout });
  } catch (err) {
    next(err);
  }
}

async function getWorkoutHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, status, startDate, endDate, orderBy, orderByField } = req.query;

    const result = await workoutService.getWorkoutHistory({
      userId: req.user.id,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as WorkoutStatus,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      orderBy: orderBy as "asc" | "desc",
      orderByField: orderByField as "date" | "createdAt" | "updatedAt" | "startedAt" | "completedAt" | "name" | "status",
    });

    return sendResponse({ res, status: true, message: "Workouts fetched successfully", data: result });
  } catch (err) {
    next(err);
  }
}

async function updateWorkoutExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const { workoutId, workoutExerciseId } = req.params;
    const workoutExercise = await workoutService.updateWorkoutExercise(req.user.id, Number(workoutId), Number(workoutExerciseId), req.body);

    return sendResponse({ res, status: true, message: "Workout exercise updated successfully", data: workoutExercise });
  } catch (err) {
    next(err);
  }
}

async function addSet(req: Request, res: Response, next: NextFunction) {
  try {
    const { workoutId, workoutExerciseId } = req.params;
    const workoutSet = await workoutService.addSet(req.user.id, Number(workoutId), Number(workoutExerciseId), req.body);

    return sendResponse({ res, status: true, message: "Set added successfully", data: workoutSet, statusCode: statusCodes.CREATED });
  } catch (err) {
    next(err);
  }
}

async function updateSet(req: Request, res: Response, next: NextFunction) {
  try {
    const { workoutId, workoutExerciseId, setId } = req.params;
    const workoutSet = await workoutService.updateSet(req.user.id, Number(workoutId), Number(workoutExerciseId), Number(setId), req.body);

    return sendResponse({ res, status: true, message: "Set updated successfully", data: workoutSet });
  } catch (err) {
    next(err);
  }
}

async function deleteSet(req: Request, res: Response, next: NextFunction) {
  try {
    const { workoutId, workoutExerciseId, setId } = req.params;
    await workoutService.deleteSet(req.user.id, Number(workoutId), Number(workoutExerciseId), Number(setId));

    return sendResponse({ res, status: true, message: "Set deleted successfully" });
  } catch (err) {
    next(err);
  }
}

async function completeWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const workout = await workoutService.completeWorkout(req.user.id, Number(id));

    return sendResponse({ res, status: true, message: "Workout completed successfully", data: workout });
  } catch (err) {
    next(err);
  }
}

async function cancelWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const workout = await workoutService.cancelWorkout(req.user.id, Number(id));

    return sendResponse({ res, status: true, message: "Workout cancelled successfully", data: workout });
  } catch (err) {
    next(err);
  }
}

export const workoutController = {
  startWorkoutFromRoutine,
  getActiveWorkout,
  getSingleWorkout,
  getWorkoutHistory,
  updateWorkoutExercise,
  addSet,
  updateSet,
  deleteSet,
  completeWorkout,
  cancelWorkout,
};
