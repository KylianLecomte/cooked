import { Test } from "@nestjs/testing";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { SESSION, TEST_USER_ID } from "../../auth/fixture/auth.fixture";
import { ProfileService } from "../service/profile.service";
import { ProfileController } from "./profile.controller";

const mockProfileService = {
  findByUserId: vi.fn(),
  upsert: vi.fn(),
};

describe("ProfileController", () => {
  let controller: ProfileController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [{ provide: ProfileService, useValue: mockProfileService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(ProfileController);
  });

  describe("getProfile", () => {
    it("should extract userId from session and delegate to profileService.findByUserId", async () => {
      const mockProfile = { id: "profile_1", userId: TEST_USER_ID };
      mockProfileService.findByUserId.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(SESSION);

      expect(mockProfileService.findByUserId).toHaveBeenCalledWith(TEST_USER_ID);
      expect(result).toEqual(mockProfile);
    });

    it("should return null when no profile exists", async () => {
      mockProfileService.findByUserId.mockResolvedValue(null);

      const result = await controller.getProfile(SESSION);

      expect(result).toBeNull();
    });
  });

  describe("updateProfile", () => {
    it("should extract userId from session and delegate to profileService.upsert with raw body", async () => {
      const body = { gender: "MALE", heightCm: 180 };
      const mockResult = { id: "profile_1", ...body };
      mockProfileService.upsert.mockResolvedValue(mockResult);

      const result = await controller.updateProfile(SESSION, body);

      expect(mockProfileService.upsert).toHaveBeenCalledWith(TEST_USER_ID, body);
      expect(result).toEqual(mockResult);
    });
  });
});
