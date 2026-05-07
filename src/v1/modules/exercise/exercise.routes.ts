import { Router } from "express";
import { validateBody, validateParams, validateQuery } from "@/src/middlewares/validate";
import { exerciseController } from "./exercise.controller";
import { createExerciseSchema, exerciseParamsSchema, exerciseQuerySchema, updateExerciseSchema } from "./exercise.validation";

const exerciseRouter = Router();

exerciseRouter.get("/", validateQuery(exerciseQuerySchema), exerciseController.getAllExercises);
exerciseRouter.get("/:id", validateParams(exerciseParamsSchema), exerciseController.getSingleExercise);
exerciseRouter.post("/", validateBody(createExerciseSchema), exerciseController.createExercise);
exerciseRouter.put("/:id", validateParams(exerciseParamsSchema), validateBody(updateExerciseSchema), exerciseController.updateExercise);
exerciseRouter.delete("/:id", validateParams(exerciseParamsSchema), exerciseController.deleteExercise);

export default exerciseRouter;
