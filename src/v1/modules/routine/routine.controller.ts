import { statusCodes } from "@/src/constants/statusCodes";
import sendResponse from "@/src/lib/sendResponse";
import { NextFunction, Request, Response } from "express";
import { routineService } from "./routine.service";

async function getAllRoutines(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, page, limit, orderBy, orderByField } = req.query;

    const result = await routineService.getAllRoutines({
      userId: req.user.id,
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      orderBy: orderBy as "asc" | "desc",
      orderByField: orderByField as "createdAt" | "updatedAt" | "name",
    });

    return sendResponse({ res, status: true, message: "Routines fetched successfully", data: result });
  } catch (err) {
    next(err);
  }
}

async function getSingleRoutine(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const routine = await routineService.getSingleRoutineById(req.user.id, Number(id));

    return sendResponse({ res, status: true, message: "Routine fetched successfully", data: routine });
  } catch (err) {
    next(err);
  }
}

async function createRoutine(req: Request, res: Response, next: NextFunction) {
  try {
    const routine = await routineService.createRoutine(req.user.id, req.body);

    return sendResponse({ res, status: true, message: "Routine created successfully", data: routine, statusCode: statusCodes.CREATED });
  } catch (err) {
    next(err);
  }
}

async function updateRoutine(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const routine = await routineService.updateRoutine(req.user.id, Number(id), req.body);

    return sendResponse({ res, status: true, message: "Routine updated successfully", data: routine });
  } catch (err) {
    next(err);
  }
}

async function deleteRoutine(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await routineService.deleteRoutine(req.user.id, Number(id));

    return sendResponse({ res, status: true, message: "Routine deleted successfully" });
  } catch (err) {
    next(err);
  }
}

async function addExerciseToRoutine(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const routineExercise = await routineService.addExerciseToRoutine(req.user.id, Number(id), req.body);

    return sendResponse({ res, status: true, message: "Exercise added to routine successfully", data: routineExercise, statusCode: statusCodes.CREATED });
  } catch (err) {
    next(err);
  }
}

async function updateRoutineExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const { routineId, routineExerciseId } = req.params;
    const routineExercise = await routineService.updateRoutineExercise(req.user.id, Number(routineId), Number(routineExerciseId), req.body);

    return sendResponse({ res, status: true, message: "Routine exercise updated successfully", data: routineExercise });
  } catch (err) {
    next(err);
  }
}

async function removeExerciseFromRoutine(req: Request, res: Response, next: NextFunction) {
  try {
    const { routineId, routineExerciseId } = req.params;
    await routineService.removeExerciseFromRoutine(req.user.id, Number(routineId), Number(routineExerciseId));

    return sendResponse({ res, status: true, message: "Exercise removed from routine successfully" });
  } catch (err) {
    next(err);
  }
}

export const routineController = {
  getAllRoutines,
  getSingleRoutine,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  addExerciseToRoutine,
  updateRoutineExercise,
  removeExerciseFromRoutine,
};
