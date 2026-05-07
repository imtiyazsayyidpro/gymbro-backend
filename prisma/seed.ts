import bcrypt from "bcrypt";
import prisma from "@/src/lib/prisma";
import { Equipment, ExerciseType, MuscleGroup } from "@/generated/prisma/client";

async function main() {
  console.log("Clearing database...");

  await prisma.workoutSet.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workoutSession.deleteMany();

  await prisma.routineExercise.deleteMany();
  await prisma.routine.deleteMany();

  await prisma.exercise.deleteMany();

  await prisma.otpCode.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log("Database cleared.");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@gymbro.com",
      mobile: "9999999999",
      password: hashedPassword,
    },
  });

  const exercises = [
    {
      name: "Bench Press",
      primaryMuscleGroup: MuscleGroup.CHEST,
      muscleGroups: ["CHEST", "TRICEPS", "SHOULDERS"],
      equipment: Equipment.BARBELL,
    },
    {
      name: "Incline Dumbbell Press",
      primaryMuscleGroup: MuscleGroup.CHEST,
      muscleGroups: ["CHEST", "SHOULDERS", "TRICEPS"],
      equipment: Equipment.DUMBBELL,
    },
    {
      name: "Shoulder Press",
      primaryMuscleGroup: MuscleGroup.SHOULDERS,
      muscleGroups: ["SHOULDERS", "TRICEPS"],
      equipment: Equipment.DUMBBELL,
    },
    {
      name: "Lateral Raise",
      primaryMuscleGroup: MuscleGroup.SHOULDERS,
      muscleGroups: ["SHOULDERS"],
      equipment: Equipment.DUMBBELL,
    },
    {
      name: "Tricep Pushdown",
      primaryMuscleGroup: MuscleGroup.TRICEPS,
      muscleGroups: ["TRICEPS"],
      equipment: Equipment.CABLE,
    },
    {
      name: "Lat Pulldown",
      primaryMuscleGroup: MuscleGroup.BACK,
      muscleGroups: ["BACK", "BICEPS"],
      equipment: Equipment.CABLE,
    },
    {
      name: "Seated Cable Row",
      primaryMuscleGroup: MuscleGroup.BACK,
      muscleGroups: ["BACK", "BICEPS"],
      equipment: Equipment.CABLE,
    },
    {
      name: "Barbell Row",
      primaryMuscleGroup: MuscleGroup.BACK,
      muscleGroups: ["BACK", "BICEPS"],
      equipment: Equipment.BARBELL,
    },
    {
      name: "Bicep Curl",
      primaryMuscleGroup: MuscleGroup.BICEPS,
      muscleGroups: ["BICEPS", "FOREARMS"],
      equipment: Equipment.DUMBBELL,
    },
    {
      name: "Squat",
      primaryMuscleGroup: MuscleGroup.QUADS,
      muscleGroups: ["QUADS", "GLUTES", "HAMSTRINGS"],
      equipment: Equipment.BARBELL,
    },
    {
      name: "Leg Press",
      primaryMuscleGroup: MuscleGroup.QUADS,
      muscleGroups: ["QUADS", "GLUTES"],
      equipment: Equipment.MACHINE,
    },
    {
      name: "Leg Curl",
      primaryMuscleGroup: MuscleGroup.HAMSTRINGS,
      muscleGroups: ["HAMSTRINGS"],
      equipment: Equipment.MACHINE,
    },
    {
      name: "Calf Raise",
      primaryMuscleGroup: MuscleGroup.CALVES,
      muscleGroups: ["CALVES"],
      equipment: Equipment.MACHINE,
    },
  ];

  const createdExercises: Record<string, { id: number }> = {};

  for (const exercise of exercises) {
    const created = await prisma.exercise.create({
      data: {
        userId: user.id,
        name: exercise.name,
        primaryMuscleGroup: exercise.primaryMuscleGroup,
        muscleGroups: exercise.muscleGroups,
        equipment: exercise.equipment,
        exerciseType: ExerciseType.RESISTANCE,
      },
    });

    createdExercises[exercise.name] = created;
  }

  const pushRoutine = await prisma.routine.create({
    data: {
      userId: user.id,
      name: "Push Day",
      description: "Chest, shoulders, and triceps",
      exercises: {
        create: [
          {
            exerciseId: createdExercises["Bench Press"].id,
            order: 1,
            targetSets: 3,
            targetReps: "8-12",
            restSeconds: 120,
          },
          {
            exerciseId: createdExercises["Incline Dumbbell Press"].id,
            order: 2,
            targetSets: 3,
            targetReps: "8-12",
            restSeconds: 90,
          },
          {
            exerciseId: createdExercises["Shoulder Press"].id,
            order: 3,
            targetSets: 3,
            targetReps: "8-12",
            restSeconds: 90,
          },
          {
            exerciseId: createdExercises["Lateral Raise"].id,
            order: 4,
            targetSets: 3,
            targetReps: "12-15",
            restSeconds: 60,
          },
          {
            exerciseId: createdExercises["Tricep Pushdown"].id,
            order: 5,
            targetSets: 3,
            targetReps: "10-15",
            restSeconds: 60,
          },
        ],
      },
    },
  });

  const pullRoutine = await prisma.routine.create({
    data: {
      userId: user.id,
      name: "Pull Day",
      description: "Back and biceps",
      exercises: {
        create: [
          {
            exerciseId: createdExercises["Lat Pulldown"].id,
            order: 1,
            targetSets: 3,
            targetReps: "8-12",
            restSeconds: 90,
          },
          {
            exerciseId: createdExercises["Seated Cable Row"].id,
            order: 2,
            targetSets: 3,
            targetReps: "8-12",
            restSeconds: 90,
          },
          {
            exerciseId: createdExercises["Barbell Row"].id,
            order: 3,
            targetSets: 3,
            targetReps: "8-10",
            restSeconds: 120,
          },
          {
            exerciseId: createdExercises["Bicep Curl"].id,
            order: 4,
            targetSets: 3,
            targetReps: "10-15",
            restSeconds: 60,
          },
        ],
      },
    },
  });

  const legsRoutine = await prisma.routine.create({
    data: {
      userId: user.id,
      name: "Leg Day",
      description: "Quads, hamstrings, glutes, and calves",
      exercises: {
        create: [
          {
            exerciseId: createdExercises["Squat"].id,
            order: 1,
            targetSets: 3,
            targetReps: "6-10",
            restSeconds: 150,
          },
          {
            exerciseId: createdExercises["Leg Press"].id,
            order: 2,
            targetSets: 3,
            targetReps: "10-15",
            restSeconds: 120,
          },
          {
            exerciseId: createdExercises["Leg Curl"].id,
            order: 3,
            targetSets: 3,
            targetReps: "10-15",
            restSeconds: 90,
          },
          {
            exerciseId: createdExercises["Calf Raise"].id,
            order: 4,
            targetSets: 4,
            targetReps: "12-20",
            restSeconds: 60,
          },
        ],
      },
    },
  });

  console.log("Seed completed:", {
    userId: user.id,
    email: user.email,
    password: "password123",
    routines: [pushRoutine.name, pullRoutine.name, legsRoutine.name],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
