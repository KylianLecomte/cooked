import { Server } from "node:http";
import { Meal } from "@cooked/shared";
import { INestApplication } from "@nestjs/common";
import { TEST_USER, TEST_USER_ID } from "src/auth/fixture/auth.fixture";
import { ERROR_DIARY_ENTRY_NOT_FOUND } from "src/diary/util/diary.constant";
import { mockFoodSummary } from "src/food/mock/food.mock";
import { PrismaService } from "src/prisma/prisma.service";
import { API_PREFIX } from "src/util/constant";
import request from "supertest";
import { cleanDatabase, createTestApp } from "./helper/setup";

describe("DiaryController (e2e)", () => {
  const _BASE_PATH_DIARY = `/${API_PREFIX}/diary`;
  const _DATE = "2026-03-25";
  let _app: INestApplication;
  let _prisma: PrismaService;

  beforeAll(async () => {
    _app = await createTestApp();
    _prisma = _app.get(PrismaService);
  });

  afterEach(async () => {
    if (_app) {
      await cleanDatabase(_app);
    }
  });

  afterAll(async () => {
    if (_app) {
      await _app.close();
    }
  });

  async function _seedFood() {
    return _prisma.client.food.create({
      data: { ...mockFoodSummary },
    });
  }

  async function _seedDiaryWithLog(meal = Meal.BREAKFAST, quantity = 100) {
    const food = await _seedFood();
    return await _prisma.client.diaryEntry.create({
      data: {
        userId: TEST_USER_ID,
        date: new Date(_DATE),
        foodLogs: { create: { foodId: food.id, meal, quantity } },
      },
      include: { foodLogs: true },
    });
  }

  describe("(GET) /v1/api/diary/:date", () => {
    it("[Success case] - should return diary entry with food logs for given date", async () => {
      const food = await _seedFood();
      await _prisma.client.diaryEntry.create({
        data: {
          userId: TEST_USER.id,
          date: new Date(_DATE),
          foodLogs: {
            create: [
              {
                meal: Meal.BREAKFAST,
                quantity: 150,
                foodId: food.id,
              },
              {
                meal: Meal.DINNER,
                quantity: 200,
                foodId: food.id,
              },
            ],
          },
        },
      });

      const { body } = await request(_app.getHttpServer() as Server)
        .get(`${_BASE_PATH_DIARY}/${_DATE}`)
        .expect(200);

      expect(body.id).toBeDefined();
      expect(body.date).toBe(`${_DATE}T00:00:00.000Z`);
      expect(body.foodLogs.length).toBe(2);
      expect(body.foodLogs[0].meal).toBe(Meal.BREAKFAST);
      expect(body.foodLogs[0].quantity).toBe(150);
      expect(body.foodLogs[0].food).toBeDefined();
      expect(body.foodLogs[0].food.id).toBe(food.id);
      expect(body.foodLogs[1].meal).toBe(Meal.DINNER);
      expect(body.foodLogs[1].quantity).toBe(200);
      expect(body.foodLogs[1].food).toBeDefined();
      expect(body.foodLogs[1].food.id).toBe(food.id);
      expect(body.macrosTotals).toBeDefined();
      expect(body.macrosByMeal).toBeDefined();
    });

    it("[Success case] - should return empty diary entry if no entry for date", async () => {
      const { body } = await request(_app.getHttpServer() as Server)
        .get(`${_BASE_PATH_DIARY}/${_DATE}`)
        .expect(200);

      expect(body.id).toBeNull();
      expect(body.date).toBe(`${_DATE}T00:00:00.000Z`);
      expect(body.foodLogs).toEqual([]);
    });

    it("[Error case] - should return bad request for invalid date when passed random string as date", async () => {
      const { body } = await request(_app.getHttpServer() as Server)
        .get(`${_BASE_PATH_DIARY}/invalid-date`)
        .expect(400);

      expect(body.message[0].message).toBe("Invalid date format");
    });

    it("[Error case] - should return bad request for invalid date when passed wrong format date", async () => {
      const { body } = await request(_app.getHttpServer() as Server)
        .get(`${_BASE_PATH_DIARY}/2026/03/25`)
        .expect(404);

      expect(body.error).toBe("Not Found");
      expect(body.message).toBe("Cannot GET /v1/api/diary/2026/03/25");
      expect(body.statusCode).toBe(404);
    });

    it("[Error case] - should return bad request for invalid date when passed wrong format date 2", async () => {
      const { body } = await request(_app.getHttpServer() as Server)
        .get(`${_BASE_PATH_DIARY}/25-03-2026`)
        .expect(400);
      expect(body.message[0].message).toBe("Invalid date format");
    });
  });

  describe("(POST) /v1/api/diary/:date/food-log", () => {
    it("[Success case] - should create a new diary entry", async () => {
      const food = await _seedFood();
      const payload = {
        meal: Meal.BREAKFAST,
        quantity: 150,
        foodId: food.id,
      };
      const { body } = await request(_app.getHttpServer() as Server)
        .post(`${_BASE_PATH_DIARY}/${_DATE}/food-log`)
        .send(payload)
        .expect(201);

      expect(body.id).toBeDefined();
      expect(body.foodId).toBe(payload.foodId);
      expect(body.quantity).toBe(payload.quantity);
      expect(body.meal).toBe(payload.meal);
      expect(body.food).toBeDefined();
      expect(body.food.id).toBe(payload.foodId);
      expect(body.food.name).toBeDefined();
    });

    it("[Error case] - should return bad request when call with empty object as body", async () => {
      const payload = {};
      const { body } = await request(_app.getHttpServer() as Server)
        .post(`${_BASE_PATH_DIARY}/${_DATE}/food-log`)
        .send(payload)
        .expect(400);

      expect(body.message[0].message).toBe("ID de nourriture invalide");
      expect(body.message[0].path).toBe("foodId");
      expect(body.message[1].message).toBe(
        'Invalid option: expected one of "BREAKFAST"|"LUNCH"|"DINNER"|"SNACK"',
      );
      expect(body.message[1].path).toBe("meal");
      expect(body.message[2].message).toBe("Invalid input: expected number, received undefined");
      expect(body.message[2].path).toBe("quantity");
    });

    it("[Error case] - should return bad request for invalid date when passed wrong format date", async () => {
      const food = await _seedFood();
      const payload = {
        meal: Meal.BREAKFAST,
        quantity: 150,
        foodId: food.id,
      };
      const { body } = await request(_app.getHttpServer() as Server)
        .post(`${_BASE_PATH_DIARY}/25-03-2026/food-log`)
        .send(payload)
        .expect(400);

      expect(body.message[0].message).toBe("Invalid date format");
    });
  });

  describe("PATCH /v1/api/diary/:logId", () => {
    it("[Success case] - should update the food quantity", async () => {
      const entry = await _seedDiaryWithLog();

      const initialPayload = {
        foodId: entry.foodLogs[0].foodId,
        meal: Meal.BREAKFAST,
        quantity: 100,
      };
      const payload = { quantity: 100 };

      const logId = entry.foodLogs[0].id;

      const { body } = await request(_app.getHttpServer() as Server)
        .patch(`${_BASE_PATH_DIARY}/${logId}`)
        .send(payload)
        .expect(200);

      expect(body.foodId).toBe(initialPayload.foodId);
      expect(body.meal).toBe(initialPayload.meal);
      expect(body.quantity).toBe(payload.quantity);
    });

    it("[Error case] - should return unrecognized key when pass unknown attribute in payload", async () => {
      const payload = { keyDoesNotExist: 100 };

      const entry = await _seedDiaryWithLog();
      const logId = entry.foodLogs[0].id;

      const { body } = await request(_app.getHttpServer() as Server)
        .patch(`${_BASE_PATH_DIARY}/${logId}`)
        .send(payload)
        .expect(400);

      expect(body.message[0].message).toBe('Unrecognized key: "keyDoesNotExist"');
      expect(body.error).toBe("Bad Request");
      expect(body.statusCode).toBe(400);
    });

    it("[Error case] - should return error when pass empty payload", async () => {
      const payload = {};

      const entry = await _seedDiaryWithLog();
      const logId = entry.foodLogs[0].id;

      const { body } = await request(_app.getHttpServer() as Server)
        .patch(`${_BASE_PATH_DIARY}/${logId}`)
        .send(payload)
        .expect(400);

      expect(body.message[0].message).toBe("At least one field must be provided");
      expect(body.error).toBe("Bad Request");
      expect(body.statusCode).toBe(400);
    });

    it("[Error case] - should return error when pass undefined payload", async () => {
      const entry = await _seedDiaryWithLog();
      const logId = entry.foodLogs[0].id;

      const { body } = await request(_app.getHttpServer() as Server)
        .patch(`${_BASE_PATH_DIARY}/${logId}`)
        .expect(400);

      expect(body.message[0].message).toBe("Invalid input: expected object, received undefined");
      expect(body.error).toBe("Bad Request");
      expect(body.statusCode).toBe(400);
    });
  });

  describe("DELETE /v1/api/diary/:logId", () => {
    it("[Success case] - should delete a food log", async () => {
      const entry = await _seedDiaryWithLog();
      const logId = entry.foodLogs[0].id;

      const { body } = await request(_app.getHttpServer() as Server)
        .delete(`${_BASE_PATH_DIARY}/${logId}`)
        .expect(200);

      expect(body.id).toBe(logId);
      const deleted = await _prisma.client.foodLog.findUnique({ where: { id: logId } });
      expect(deleted).toBeNull();
    });

    it("[Error case] - should return 404 when food log does not exist", async () => {
      const { body } = await request(_app.getHttpServer() as Server)
        .delete(`${_BASE_PATH_DIARY}/46f6c3b5-0fbe-4596-b34e-801c3e7b2b78`)
        .expect(404);

      expect(body.message).toBe(ERROR_DIARY_ENTRY_NOT_FOUND);
      expect(body.error).toBe("Not Found");
      expect(body.statusCode).toBe(404);
    });
  });
});
