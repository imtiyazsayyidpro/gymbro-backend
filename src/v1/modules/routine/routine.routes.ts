import { Router } from "express";
import { validateBody, validateParams, validateQuery } from "@/src/middlewares/validate";
import { routineController } from "./routine.controller";
import {
  addRoutineExerciseSchema,
  createRoutineSchema,
  routineExerciseParamsSchema,
  routineParamsSchema,
  routineQuerySchema,
  updateRoutineExerciseSchema,
  updateRoutineSchema,
} from "./routine.validation";

const routineRouter = Router();

routineRouter.get("/", validateQuery(routineQuerySchema), routineController.getAllRoutines);
routineRouter.get("/:id", validateParams(routineParamsSchema), routineController.getSingleRoutine);
routineRouter.post("/", validateBody(createRoutineSchema), routineController.createRoutine);
routineRouter.patch("/:id", validateParams(routineParamsSchema), validateBody(updateRoutineSchema), routineController.updateRoutine);
routineRouter.delete("/:id", validateParams(routineParamsSchema), routineController.deleteRoutine);

routineRouter.post("/:id/exercises", validateParams(routineParamsSchema), validateBody(addRoutineExerciseSchema), routineController.addExerciseToRoutine);
routineRouter.patch(
  "/:routineId/exercises/:routineExerciseId",
  validateParams(routineExerciseParamsSchema),
  validateBody(updateRoutineExerciseSchema),
  routineController.updateRoutineExercise,
);
routineRouter.delete("/:routineId/exercises/:routineExerciseId", validateParams(routineExerciseParamsSchema), routineController.removeExerciseFromRoutine);

export default routineRouter;
