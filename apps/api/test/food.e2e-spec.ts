import { Server } from "node:http";
import { INestApplication } from "@nestjs/common";
import { seedFood, seedUsdaFood } from "src/food/mock/food.seeder";
import { PrismaService } from "src/prisma/prisma.service";
import { API_PREFIX } from "src/util/constant";
import request from "supertest";
import { cleanDatabase, createTestAppWithMockedApis } from "./helper/setup";

describe("FoodController (e2e)", () => {
  const BASE_PATH_FOOD = `/${API_PREFIX}/foods`;
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestAppWithMockedApis();
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

  describe("(GET) /v1/api/foods/search?q=:query", () => {
    it("[Success case] - should return 200 with an array of results", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/search`)
        .query({ q: "apple" })
        .expect(200);

      expect(Array.isArray(body)).toBe(true);
    });

    it("[Error case] - should return 400 when query parameter is missing", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/search`)
        .expect(400);

      expect(body.statusCode).toBe(400);
    });

    it("[Error case] - should return 400 when query is only whitespace", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/search`)
        .query({ q: "   " })
        .expect(400);

      expect(body.statusCode).toBe(400);
    });
  });

  describe("(GET) /v1/api/foods/barcode/:barcode", () => {
    it("[Success case] - should return 200 with food data for a valid barcode", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/barcode/5000112126619`)
        .expect(200);

      expect(body).not.toBeNull();
      expect(body.name).toBeDefined();
      expect(body.kcalPer100g).toBeDefined();
      expect(body.source).toBe("OFF");
    });
  });

  describe("(GET) /v1/api/foods/:id", () => {
    it("[Success case] - should return 200 with full food details for a seeded food", async () => {
      const food = await seedFood(prisma, { name: "Test Food", kcalPer100g: 200 });

      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/${food.id}`)
        .expect(200);

      expect(body.id).toBe(food.id);
      expect(body.name).toBe("Test Food");
      expect(body.kcalPer100g).toBe(200);
    });

    it("[Success case] - should return 200 with micronutrient data when available", async () => {
      const food = await seedFood(prisma, { withMicronutrients: true });

      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/${food.id}`)
        .expect(200);

      expect(body.microDataComplete).toBe(true);
      expect(body.vitA).toBeDefined();
      expect(body.calcium).toBeDefined();
    });

    it("[Success case] - should return 200 for USDA source food", async () => {
      const food = await seedUsdaFood(prisma, { withMicronutrients: true });

      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/${food.id}`)
        .expect(200);

      expect(body.source).toBe("USDA");
    });

    it("[Error case] - should return 404 for non-existent ID", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/00000000-0000-0000-0000-000000000000`)
        .expect(404);

      expect(body.error).toBe("Not Found");
    });

    it("[Error case] - should return 404 for invalid UUID format", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/not_a_uuid`)
        .expect(404);

      expect(body.statusCode).toBe(404);
    });
  });
});
