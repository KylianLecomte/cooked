import { Server } from "node:http";
import { Meal } from "@cooked/shared";
import { INestApplication } from "@nestjs/common";
import { TEST_USER, TEST_USER_ID } from "src/auth/fixture/auth.fixture";
import { ERROR_DIARY_ENTRY_NOT_FOUND } from "src/diary/util/diary.constant";
import { seedFood as seedFoodInDb } from "src/food/mock/food.seeder";
import { PrismaService } from "src/prisma/prisma.service";
import { API_PREFIX } from "src/util/constant";
import request from "supertest";
import { cleanDatabase, createTestApp } from "./helper/setup";

describe("DiaryController (e2e)", () => {
  const BASE_PATH_DIARY = `/${API_PREFIX}/diary`;
  const DATE = "2026-03-25";
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    if (app) {
      await cleanDatabase(app);
    }
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  async function seedFood() {
    return seedFoodInDb(prisma);
  }

  async function seedDiaryWithLog(meal = Meal.BREAKFAST, quantity = 100) {
    const food = await seedFood();
    return await prisma.client.diaryEntry.create({
      data: {
        userId: TEST_USER_ID,
        date: new Date(DATE),
        foodLogs: { create: { foodId: food.id, meal, quantity } },
      },
      include: { foodLogs: true },
    });
  }

  describe("(GET) /v1/api/diary/:date", () => {
    it("[Success case] - should return 200 with diary entry and food logs", async () => {
      const food = await seedFood();
      await prisma.client.diaryEntry.create({
        data: {
          userId: TEST_USER.id,
          date: new Date(DATE),
          foodLogs: {
            create: [
              { meal: Meal.BREAKFAST, quantity: 150, foodId: food.id },
              { meal: Meal.DINNER, quantity: 200, foodId: food.id },
            ],
          },
        },
      });

      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_DIARY}/${DATE}`)
        .expect(200);

      expect(body.id).toBeDefined();
      expect(body.date).toBe(`${DATE}T00:00:00.000Z`);
      expect(body.foodLogs).toHaveLength(2);
      expect(body.foodLogs[0].food.id).toBe(food.id);
      expect(body.macrosTotals).toBeDefined();
      expect(body.macrosByMeal).toBeDefined();
    });

    it("[Success case] - should return 200 with empty diary when no entry exists", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_DIARY}/${DATE}`)
        .expect(200);

      expect(body.id).toBeNull();
      expect(body.date).toBe(`${DATE}T00:00:00.000Z`);
      expect(body.foodLogs).toEqual([]);
    });

    it("[Error case] - should return 400 for invalid date format", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_DIARY}/invalid-date`)
        .expect(400);

      expect(body.message[0].message).toBe("Invalid date format");
    });
  });

  describe("(POST) /v1/api/diary/:date/food-log", () => {
    it("[Success case] - should return 201 with created food log", async () => {
      const food = await seedFood();
      const payload = { meal: Meal.BREAKFAST, quantity: 150, foodId: food.id };

      const { body } = await request(app.getHttpServer() as Server)
        .post(`${BASE_PATH_DIARY}/${DATE}/food-log`)
        .send(payload)
        .expect(201);

      expect(body.id).toBeDefined();
      expect(body.foodId).toBe(payload.foodId);
      expect(body.quantity).toBe(payload.quantity);
      expect(body.meal).toBe(payload.meal);
      expect(body.food).toBeDefined();
      expect(body.food.id).toBe(payload.foodId);
    });

    it("[Error case] - should return 400 when body is empty", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .post(`${BASE_PATH_DIARY}/${DATE}/food-log`)
        .send({})
        .expect(400);

      expect(body.message[0].path).toBe("foodId");
      expect(body.message[1].path).toBe("meal");
      expect(body.message[2].path).toBe("quantity");
    });
  });

  describe("(PATCH) /v1/api/diary/:logId", () => {
    it("[Success case] - should return 200 with updated food log", async () => {
      const entry = await seedDiaryWithLog();
      const logId = entry.foodLogs[0].id;

      const { body } = await request(app.getHttpServer() as Server)
        .patch(`${BASE_PATH_DIARY}/${logId}`)
        .send({ quantity: 300 })
        .expect(200);

      expect(body.quantity).toBe(300);
      expect(body.foodId).toBe(entry.foodLogs[0].foodId);
    });

    it("[Error case] - should return 400 when payload contains unknown keys", async () => {
      const entry = await seedDiaryWithLog();
      const logId = entry.foodLogs[0].id;

      const { body } = await request(app.getHttpServer() as Server)
        .patch(`${BASE_PATH_DIARY}/${logId}`)
        .send({ keyDoesNotExist: 100 })
        .expect(400);

      expect(body.message[0].message).toBe('Unrecognized key: "keyDoesNotExist"');
      expect(body.statusCode).toBe(400);
    });

    it("[Error case] - should return 400 when payload is empty", async () => {
      const entry = await seedDiaryWithLog();
      const logId = entry.foodLogs[0].id;

      const { body } = await request(app.getHttpServer() as Server)
        .patch(`${BASE_PATH_DIARY}/${logId}`)
        .send({})
        .expect(400);

      expect(body.message[0].message).toBe("At least one field must be provided");
      expect(body.statusCode).toBe(400);
    });
  });

  describe("(DELETE) /v1/api/diary/:logId", () => {
    it("[Success case] - should return 200 and delete the food log from DB", async () => {
      const entry = await seedDiaryWithLog();
      const logId = entry.foodLogs[0].id;

      const { body } = await request(app.getHttpServer() as Server)
        .delete(`${BASE_PATH_DIARY}/${logId}`)
        .expect(200);

      expect(body.id).toBe(logId);
      const deleted = await prisma.client.foodLog.findUnique({ where: { id: logId } });
      expect(deleted).toBeNull();
    });

    it("[Error case] - should return 404 when food log does not exist", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .delete(`${BASE_PATH_DIARY}/46f6c3b5-0fbe-4596-b34e-801c3e7b2b78`)
        .expect(404);

      expect(body.message).toBe(ERROR_DIARY_ENTRY_NOT_FOUND);
      expect(body.statusCode).toBe(404);
    });
  });
});
