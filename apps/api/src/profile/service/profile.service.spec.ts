import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockProfile,
  createMockProfileServices,
  createPartialMockProfile,
  MockProfileServices,
  VALID_PROFILE_DTO,
} from "../mock/profile.mock";
import { ProfileService } from "./profile.service";

const USER_ID = "test_user_1";

describe("ProfileService", () => {
  let service: ProfileService;
  let mockServices: MockProfileServices;
  let mockPrismaClient: MockProfileServices["prisma"]["client"];

  beforeEach(async () => {
    vi.clearAllMocks();

    mockServices = createMockProfileServices();
    mockPrismaClient = mockServices.prisma.client;

    const module = await Test.createTestingModule({
      providers: [ProfileService, { provide: PrismaService, useValue: mockServices.prisma }],
    }).compile();

    service = module.get(ProfileService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("findByUserId", () => {
    it("should return profile when found", async () => {
      const profile = createMockProfile();
      mockPrismaClient.profile.findUnique.mockResolvedValue(profile);

      const result = await service.findByUserId(USER_ID);

      expect(result).toEqual(profile);
      expect(mockPrismaClient.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: USER_ID },
      });
    });

    it("should return null when no profile exists", async () => {
      mockPrismaClient.profile.findUnique.mockResolvedValue(null);

      const result = await service.findByUserId(USER_ID);

      expect(result).toBeNull();
    });
  });

  describe("upsert", () => {
    describe("validation", () => {
      it("should throw BadRequestException for invalid gender", async () => {
        await expect(service.upsert(USER_ID, { gender: "INVALID" })).rejects.toThrow(
          BadRequestException,
        );
        expect(mockPrismaClient.profile.upsert).not.toHaveBeenCalled();
      });

      it("should throw BadRequestException for heightCm below minimum", async () => {
        await expect(service.upsert(USER_ID, { heightCm: 10 })).rejects.toThrow(
          BadRequestException,
        );
      });

      it("should throw BadRequestException for weightKg above maximum", async () => {
        await expect(service.upsert(USER_ID, { weightKg: 600 })).rejects.toThrow(
          BadRequestException,
        );
      });

      it("should throw BadRequestException for future birthDate", async () => {
        await expect(service.upsert(USER_ID, { birthDate: "2099-01-01" })).rejects.toThrow(
          BadRequestException,
        );
      });

      it("should accept valid partial dto", async () => {
        mockPrismaClient.profile.findUnique.mockResolvedValue(null);
        mockPrismaClient.profile.upsert.mockResolvedValue(createPartialMockProfile());

        await expect(service.upsert(USER_ID, { gender: "MALE" })).resolves.not.toThrow();
      });
    });

    describe("merge logic", () => {
      it("should merge dto with existing profile (PATCH semantics)", async () => {
        const existing = createPartialMockProfile({
          gender: "MALE",
          heightCm: 180,
          weightKg: null,
        });
        mockPrismaClient.profile.findUnique.mockResolvedValue(existing);
        mockPrismaClient.profile.upsert.mockResolvedValue(createMockProfile());

        await service.upsert(USER_ID, { weightKg: 80 });

        expect(mockPrismaClient.profile.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            update: expect.objectContaining({
              gender: "MALE",
              heightCm: 180,
              weightKg: 80,
            }),
          }),
        );
      });

      it("should override existing values with dto values", async () => {
        const existing = createMockProfile({ weightKg: 80 });
        mockPrismaClient.profile.findUnique.mockResolvedValue(existing);
        mockPrismaClient.profile.upsert.mockResolvedValue(createMockProfile({ weightKg: 75 }));

        await service.upsert(USER_ID, { weightKg: 75 });

        expect(mockPrismaClient.profile.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            update: expect.objectContaining({ weightKg: 75 }),
          }),
        );
      });

      it("should create profile when none exists", async () => {
        mockPrismaClient.profile.findUnique.mockResolvedValue(null);
        mockPrismaClient.profile.upsert.mockResolvedValue(createMockProfile());

        await service.upsert(USER_ID, VALID_PROFILE_DTO);

        expect(mockPrismaClient.profile.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { userId: USER_ID },
            create: expect.objectContaining({ userId: USER_ID }),
          }),
        );
      });
    });

    describe("TDEE calculation", () => {
      it("should calculate TDEE when all fields are present", async () => {
        mockPrismaClient.profile.findUnique.mockResolvedValue(null);
        mockPrismaClient.profile.upsert.mockResolvedValue(createMockProfile());

        await service.upsert(USER_ID, VALID_PROFILE_DTO);

        expect(mockPrismaClient.profile.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            create: expect.objectContaining({
              tdeeKcal: expect.any(Number),
              targetKcal: expect.any(Number),
              targetProteinG: expect.any(Number),
              targetCarbsG: expect.any(Number),
              targetFatG: expect.any(Number),
            }),
          }),
        );
      });

      it("should not include TDEE fields when profile is incomplete", async () => {
        mockPrismaClient.profile.findUnique.mockResolvedValue(null);
        mockPrismaClient.profile.upsert.mockResolvedValue(createPartialMockProfile());

        await service.upsert(USER_ID, { gender: "MALE", heightCm: 180 });

        const upsertCall = mockPrismaClient.profile.upsert.mock.calls[0][0];
        expect(upsertCall.create.tdeeKcal).toBeUndefined();
        expect(upsertCall.create.targetKcal).toBeUndefined();
      });

      it("should calculate TDEE when merging completes all fields", async () => {
        const existing = createPartialMockProfile({
          birthDate: new Date("1996-01-01"),
          gender: "MALE",
          heightCm: 180,
          weightKg: 80,
          activityLevel: "MODERATELY_ACTIVE",
        });
        mockPrismaClient.profile.findUnique.mockResolvedValue(existing);
        mockPrismaClient.profile.upsert.mockResolvedValue(createMockProfile());

        // Last missing field completes the profile
        await service.upsert(USER_ID, { goal: "MAINTAIN" });

        expect(mockPrismaClient.profile.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            update: expect.objectContaining({
              tdeeKcal: expect.any(Number),
              targetKcal: expect.any(Number),
            }),
          }),
        );
      });
    });

    describe("error handling", () => {
      it("should propagate database errors", async () => {
        mockPrismaClient.profile.findUnique.mockResolvedValue(null);
        mockPrismaClient.profile.upsert.mockRejectedValue(new Error("DB error"));

        await expect(service.upsert(USER_ID, VALID_PROFILE_DTO)).rejects.toThrow("DB error");
      });
    });
  });
});
