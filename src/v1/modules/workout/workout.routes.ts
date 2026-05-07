import { Router } from "express";
import { validateBody, validateParams, validateQuery } from "@/src/middlewares/validate";
import { workoutController } from "./workout.controller";
import {
  addWorkoutSetSchema,
  startRoutineParamsSchema,
  updateWorkoutExerciseSchema,
  updateWorkoutSetSchema,
  workoutExerciseParamsSchema,
  workoutParamsSchema,
  workoutQuerySchema,
  workoutSetParamsSchema,
} from "./workout.validation";

const workoutRouter = Router();

workoutRouter.post("/start-routine/:routineId", validateParams(startRoutineParamsSchema), workoutController.startWorkoutFromRoutine);
workoutRouter.get("/active", workoutController.getActiveWorkout);
workoutRouter.get("/", validateQuery(workoutQuerySchema), workoutController.getWorkoutHistory);
workoutRouter.patch("/:id/complete", validateParams(workoutParamsSchema), workoutController.completeWorkout);
workoutRouter.patch("/:id/cancel", validateParams(workoutParamsSchema), workoutController.cancelWorkout);
workoutRouter.get("/:id", validateParams(workoutParamsSchema), workoutController.getSingleWorkout);
workoutRouter.patch("/:workoutId/exercises/:workoutExerciseId", validateParams(workoutExerciseParamsSchema), validateBody(updateWorkoutExerciseSchema), workoutController.updateWorkoutExercise);
workoutRouter.post("/:workoutId/exercises/:workoutExerciseId/sets", validateParams(workoutExerciseParamsSchema), validateBody(addWorkoutSetSchema), workoutController.addSet);
workoutRouter.patch("/:workoutId/exercises/:workoutExerciseId/sets/:setId", validateParams(workoutSetParamsSchema), validateBody(updateWorkoutSetSchema), workoutController.updateSet);
workoutRouter.delete("/:workoutId/exercises/:workoutExerciseId/sets/:setId", validateParams(workoutSetParamsSchema), workoutController.deleteSet);

export default workoutRouter;
