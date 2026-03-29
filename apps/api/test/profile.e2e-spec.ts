import { Server } from "node:http";
import { Gender } from "@cooked/shared";
import { INestApplication } from "@nestjs/common";
import { TEST_USER_ID } from "src/auth/fixture/auth.fixture";
import { PrismaService } from "src/prisma/prisma.service";
import { VALID_PROFILE_DTO } from "src/profile/mock/profile.mock";
import { API_PREFIX } from "src/util/constant";
import request from "supertest";
import { cleanDatabase, createTestApp } from "./helper/setup";

describe("ProfileController (e2e)", () => {
  const BASE_PATH_PROFILE = `/${API_PREFIX}/profile`;
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

  describe("(GET) /v1/api/profile", () => {
    it("[Success case] - should return 200 with no profile data when none exists", async () => {
      const response = await request(app.getHttpServer() as Server)
        .get(BASE_PATH_PROFILE)
        .expect(200);

      expect(response.text).toBe("");
    });

    it("[Success case] - should return 200 with profile data when profile exists", async () => {
      await prisma.client.profile.create({
        data: {
          userId: TEST_USER_ID,
          gender: Gender.MALE,
          heightCm: 180,
          weightKg: 80,
        },
      });

      const { body } = await request(app.getHttpServer() as Server)
        .get(BASE_PATH_PROFILE)
        .expect(200);

      expect(body.userId).toBe(TEST_USER_ID);
      expect(body.gender).toBe(Gender.MALE);
      expect(body.heightCm).toBe(180);
    });
  });

  describe("(PATCH) /v1/api/profile", () => {
    it("[Success case] - should return 200 and create profile on first update", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .patch(BASE_PATH_PROFILE)
        .send({ gender: Gender.MALE, heightCm: 180 })
        .expect(200);

      expect(body.userId).toBe(TEST_USER_ID);
      expect(body.gender).toBe(Gender.MALE);
      expect(body.heightCm).toBe(180);
    });

    it("[Success case] - should return 200 and merge with existing profile", async () => {
      // Create initial profile
      await prisma.client.profile.create({
        data: { userId: TEST_USER_ID, gender: Gender.MALE, heightCm: 180 },
      });

      // Update with additional fields
      const { body } = await request(app.getHttpServer() as Server)
        .patch(BASE_PATH_PROFILE)
        .send({ weightKg: 80 })
        .expect(200);

      expect(body.gender).toBe(Gender.MALE);
      expect(body.heightCm).toBe(180);
      expect(body.weightKg).toBe(80);
    });

    it("[Success case] - should return 200 with TDEE calculated when all fields are provided", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .patch(BASE_PATH_PROFILE)
        .send(VALID_PROFILE_DTO)
        .expect(200);

      expect(body.tdeeKcal).not.toBeNull();
      expect(body.targetKcal).not.toBeNull();
      expect(body.targetProteinG).not.toBeNull();
      expect(body.targetCarbsG).not.toBeNull();
      expect(body.targetFatG).not.toBeNull();
      expect(body.targetKcal).toBeGreaterThanOrEqual(1200);
    });

    it("[Success case] - should return 200 without TDEE when profile is incomplete", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .patch(BASE_PATH_PROFILE)
        .send({ gender: Gender.FEMALE })
        .expect(200);

      expect(body.gender).toBe(Gender.FEMALE);
      expect(body.tdeeKcal).toBeNull();
      expect(body.targetKcal).toBeNull();
    });

    it("[Error case] - should return 400 for invalid gender value", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .patch(BASE_PATH_PROFILE)
        .send({ gender: "INVALID" })
        .expect(400);

      expect(body.statusCode).toBe(400);
      expect(Array.isArray(body.message)).toBe(true);
      expect(body.message.some((e: { path: string }) => e.path === "gender")).toBe(true);
    });

    it("[Error case] - should return 400 for heightCm below minimum", async () => {
      const { body } = await request(app.getHttpServer() as Server)
        .patch(BASE_PATH_PROFILE)
        .send({ heightCm: 10 })
        .expect(400);

      expect(body.statusCode).toBe(400);
      expect(Array.isArray(body.message)).toBe(true);
      expect(body.message.some((e: { path: string }) => e.path === "heightCm")).toBe(true);
    });
  });
});
