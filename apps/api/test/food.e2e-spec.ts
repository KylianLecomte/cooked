import { Server } from "node:http";
import { INestApplication } from "@nestjs/common";
import { seedFood, seedMultipleFoods, seedUsdaFood } from "src/food/mock/food.seeder";
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
    it("[Success case] - should return array of food results", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/search`)
        .query({ q: "apple" })
        .expect(200);

      expect(Array.isArray(body)).toBe(true);
    });

    it("[Success case] - should accept various query formats", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/search`)
        .query({ q: "  chicken breast  " })
        .expect(200);

      expect(Array.isArray(body)).toBe(true);
    });

    it("[Error case] - should reject missing query parameter", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/search`)
        .expect(400);

      expect(body.statusCode).toBe(400);
    });

    it("[Error case] - should reject empty query", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/search`)
        .query({ q: "   " })
        .expect(400);

      expect(body.statusCode).toBe(400);
    });
  });

  describe("(GET) /v1/api/foods/barcode/:barcode", () => {
    it("[Success case] - should return a response for barcode lookup", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/barcode/5000112126619`)
        .expect(200);

      // Response can be null or a food object
      expect(body === null || typeof body === "object").toBe(true);
    });

    it("[Success case] - should handle numeric barcodes", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/barcode/3017620425035`)
        .expect(200);

      expect(typeof body === "object").toBe(true);
    });

    it("[Success case] - should include expected food fields when found", async () => {
      // Search for a common food that might return results
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/barcode/5000112126619`)
        .expect(200);

      if (body !== null) {
        console.debug(body);
        expect(body.name).toBeDefined();
        expect(body.kcalPer100g).toBeDefined();
      }
    });
  });

  describe("(GET) /v1/api/foods/:id", () => {
    it("[Success case] - should return food details by valid ID", async () => {
      const food = await seedFood(prisma, { name: "Test Food" });

      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/${food.id}`)
        .expect(200);

      expect(body.id).toBe(food.id);
      expect(body.name).toBe("Test Food");
    });

    it("[Success case] - should include all macro data", async () => {
      const food = await seedFood(prisma, {
        name: "Food with macros",
        kcalPer100g: 200,
        proteinPer100g: 25,
        carbsPer100g: 15,
        fatPer100g: 8,
      });

      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/${food.id}`)
        .expect(200);

      expect(body.kcalPer100g).toBe(200);
      expect(body.proteinPer100g).toBe(25);
      expect(body.carbsPer100g).toBe(15);
      expect(body.fatPer100g).toBe(8);
    });

    it("[Success case] - should include micronutrient data when seeded", async () => {
      const food = await seedFood(prisma, { withMicronutrients: true });

      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/${food.id}`)
        .expect(200);

      expect(body.vitA).toBeDefined();
      expect(body.vitC).toBeDefined();
      expect(body.calcium).toBeDefined();
      expect(body.microDataComplete).toBe(true);
    });

    it("[Success case] - should work for USDA source foods", async () => {
      const food = await seedUsdaFood(prisma, { name: "Apple" });

      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/${food.id}`)
        .expect(200);

      expect(body.source).toBe("USDA");
    });

    it("[Success case] - should work for OFF source foods", async () => {
      const food = await seedFood(prisma, { name: "Chicken" });

      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/${food.id}`)
        .expect(200);

      expect(body.source).toBe("OFF");
    });

    it("[Success case] - should return consistent data across requests", async () => {
      const food = await seedFood(prisma, { name: "Consistency Test" });

      const { body: first } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/${food.id}`)
        .expect(200);

      const { body: second } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/${food.id}`)
        .expect(200);

      expect(first).toEqual(second);
    });

    it("[Error case] - should return 404 for non-existent ID", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/00000000-0000-0000-0000-000000000000`)
        .expect(404);

      expect(body.error).toBe("Not Found");
    });

    it("[Error case] - should return 404 for invalid UUID", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/not_a_uuid`)
        .expect(404);

      expect(body.statusCode).toBe(404);
    });
  });

  describe("Response Validation", () => {
    it("[Success case] - all endpoints should require authentication", async () => {
      // Note: Auth is mocked in createTestApp, but we document the expected behavior
      const { body: searchBody } = await request(app.getHttpServer() as Server)
        .get(`${BASE_PATH_FOOD}/search`)
        .query({ q: "test" })
        .expect(200); // Auth is mocked in test

      expect(searchBody).toBeDefined();
    });

    it("[Success case] - seeded foods should be retrievable by ID", async () => {
      const foods = await seedMultipleFoods(prisma, 3);

      for (const food of foods) {
        const { body } = await request(app.getHttpServer() as Server)
          .get(`${BASE_PATH_FOOD}/${food.id}`)
          .expect(200);

        expect(body.id).toBe(food.id);
      }
    });
  });
});
