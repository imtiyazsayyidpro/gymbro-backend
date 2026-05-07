import { Router } from "express";
import { validateParams, validateQuery } from "@/src/middlewares/validate";
import { progressController } from "./progress.controller";
import { dateRangeQuerySchema, exerciseProgressParamsSchema, exerciseProgressQuerySchema, muscleGroupVolumeQuerySchema, routineProgressParamsSchema } from "./progress.validation";

const progressRouter = Router();

progressRouter.get("/exercises/:exerciseId", validateParams(exerciseProgressParamsSchema), validateQuery(exerciseProgressQuerySchema), progressController.getExerciseProgress);
progressRouter.get(
  "/exercises/:exerciseId/set-type-breakdown",
  validateParams(exerciseProgressParamsSchema),
  validateQuery(dateRangeQuerySchema),
  progressController.getExerciseSetTypeBreakdown,
);
progressRouter.get("/routines/:routineId/volume", validateParams(routineProgressParamsSchema), validateQuery(dateRangeQuerySchema), progressController.getRoutineVolumeProgress);
progressRouter.get("/muscle-groups/volume-breakdown", validateQuery(muscleGroupVolumeQuerySchema), progressController.getMuscleGroupVolumeBreakdown);

export default progressRouter;
