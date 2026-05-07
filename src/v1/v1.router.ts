import { Router } from "express";
import { authenticate } from "@/src/middlewares/authenticate";
import authRouter from "@/src/v1/modules/auth/auth.routes";
import exerciseRouter from "@/src/v1/modules/exercise/exercise.routes";
import progressRouter from "@/src/v1/modules/progress/progress.routes";
import routineRouter from "@/src/v1/modules/routine/routine.routes";
import workoutRouter from "@/src/v1/modules/workout/workout.routes";

const v1Router = Router();

v1Router.use("/auth", authRouter);

v1Router.use(authenticate);

v1Router.use("/exercises", exerciseRouter);
v1Router.use("/routines", routineRouter);
v1Router.use("/workouts", workoutRouter);
v1Router.use("/progress", progressRouter);

export default v1Router;
