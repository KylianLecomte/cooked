import { Server } from "node:http";
import { INestApplication } from "@nestjs/common";
import { mockFoodSummary } from "src/food/mock/food.mock";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";
import { cleanDatabase, createTestApp } from "./helper/setup";

describe("DiaryController (e2e)", () => {
  let _app: INestApplication;
  let _prisma: PrismaService;

  beforeEach(async () => {
    _app = await createTestApp();
    _prisma = _app.get(PrismaService);
  });

  afterAll(async () => {
    if (_app) {
      await cleanDatabase(_app);
      await _app.close();
    }
  });

  afterEach(async () => {
    if (_app) {
      await cleanDatabase(_app);
    }
  });

  async function _seedFood() {
    return _prisma.client.food.create({
      data: { ...mockFoodSummary },
    });
  }

  // Cas d'erreur : date invalide
  // Cas de succès : retourne le diary entry pour une date donnée ave plusieurs logs
  // Cas de succès : retourne un diary entry vide si pas d'entrée pour la date
  describe("(GET) /v1/api/diary/:date", () => {
    it("[Success case] - should return empty diary entry if no entry for date", async () => {
      const { body } = await request(_app.getHttpServer() as Server)
        .get("/v1/api/diary/2026-03-25")
        .expect(200);

      expect(body.id).toBeNull();
      expect(body.date).toBe("2026-03-25T00:00:00.000Z");
      expect(body.foodLogs).toEqual([]);
    });

    it("[Error case] - should return bad request for invalid date when passed random string as date", async () => {
      const { body } = await request(_app.getHttpServer() as Server)
        .get("/v1/api/diary/invalid-date")
        .expect(400);

      expect(body.message[0].message).toBe("Invalid date format");
    });

    it("[Error case] - should return bad request for invalid date when passed wrong format date", async () => {
      const { body } = await request(_app.getHttpServer() as Server)
        .get("/v1/api/diary/2026/03/25")
        .expect(404);

      expect(body.error).toBe("Not Found");
      expect(body.message).toBe("Cannot GET /v1/api/diary/2026/03/25");
      expect(body.statusCode).toBe(404);
    });

    it("[Error case] - should return bad request for invalid date when passed wrong format date 2", async () => {
      const { body } = await request(_app.getHttpServer() as Server)
        .get("/v1/api/diary/25-03-2026")
        .expect(400);
      expect(body.message[0].message).toBe("Invalid date format");
    });
  });
});
