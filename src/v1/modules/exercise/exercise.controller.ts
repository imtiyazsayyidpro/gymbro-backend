import { statusCodes } from "@/src/constants/statusCodes";
import sendResponse from "@/src/lib/sendResponse";
import { Equipment, ExerciseType, MuscleGroup } from "@/generated/prisma/client";
import { NextFunction, Request, Response } from "express";
import { exerciseService } from "./exercise.service";

async function getAllExercises(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, primaryMuscleGroup, equipment, exerciseType, page, limit, orderBy, orderByField } = req.query;

    const result = await exerciseService.getAllExercises({
      userId: req.user.id,
      search: search as string,
      primaryMuscleGroup: primaryMuscleGroup as MuscleGroup,
      equipment: equipment as Equipment,
      exerciseType: exerciseType as ExerciseType,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      orderBy: orderBy as "asc" | "desc",
      orderByField: orderByField as "createdAt" | "updatedAt" | "name" | "primaryMuscleGroup" | "equipment" | "exerciseType",
    });

    return sendResponse({ res, status: true, message: "Exercises fetched successfully", data: result });
  } catch (err) {
    next(err);
  }
}

async function getSingleExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const exercise = await exerciseService.getSingleExerciseById(req.user.id, Number(id));

    return sendResponse({ res, status: true, message: "Exercise fetched successfully", data: exercise });
  } catch (err) {
    next(err);
  }
}

async function createExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const exercise = await exerciseService.createExercise(req.user.id, req.body);

    return sendResponse({ res, status: true, message: "Exercise created successfully", data: exercise, statusCode: statusCodes.CREATED });
  } catch (err) {
    next(err);
  }
}

async function updateExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const exercise = await exerciseService.updateExercise(req.user.id, Number(id), req.body);

    return sendResponse({ res, status: true, message: "Exercise updated successfully", data: exercise });
  } catch (err) {
    next(err);
  }
}

async function deleteExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await exerciseService.deleteExercise(req.user.id, Number(id));

    return sendResponse({ res, status: true, message: "Exercise deleted successfully" });
  } catch (err) {
    next(err);
  }
}

export const exerciseController = {
  getAllExercises,
  getSingleExercise,
  createExercise,
  updateExercise,
  deleteExercise,
};
