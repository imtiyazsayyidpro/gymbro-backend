import sendResponse from "@/src/lib/sendResponse";
import { NextFunction, Request, Response } from "express";
import { progressService } from "./progress.service";

async function getExerciseProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const { exerciseId } = req.params;
    const { startDate, endDate, setTypes } = req.query;

    const result = await progressService.getExerciseProgress(req.user.id, Number(exerciseId), {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      setTypes: setTypes as string,
    });

    return sendResponse({ res, status: true, message: "Exercise progress fetched successfully", data: result });
  } catch (err) {
    next(err);
  }
}

async function getExerciseSetTypeBreakdown(req: Request, res: Response, next: NextFunction) {
  try {
    const { exerciseId } = req.params;
    const { startDate, endDate } = req.query;

    const result = await progressService.getExerciseSetTypeBreakdown(req.user.id, Number(exerciseId), {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    return sendResponse({ res, status: true, message: "Exercise set type breakdown fetched successfully", data: result });
  } catch (err) {
    next(err);
  }
}

async function getRoutineVolumeProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const { routineId } = req.params;
    const { startDate, endDate } = req.query;

    const result = await progressService.getRoutineVolumeProgress(req.user.id, Number(routineId), {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    return sendResponse({ res, status: true, message: "Routine volume progress fetched successfully", data: result });
  } catch (err) {
    next(err);
  }
}

async function getMuscleGroupVolumeBreakdown(req: Request, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate, routineId } = req.query;

    const result = await progressService.getMuscleGroupVolumeBreakdown(req.user.id, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      routineId: routineId ? Number(routineId) : undefined,
    });

    return sendResponse({ res, status: true, message: "Muscle group volume breakdown fetched successfully", data: result });
  } catch (err) {
    next(err);
  }
}

export const progressController = {
  getExerciseProgress,
  getExerciseSetTypeBreakdown,
  getRoutineVolumeProgress,
  getMuscleGroupVolumeBreakdown,
};
