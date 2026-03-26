import { DiaryEntryResponse, FoodLog, FoodLogWithoutFood } from "@cooked/shared";
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard, Session } from "@thallesp/nestjs-better-auth";
import { ZodValidationPipe } from "src/zod/pipe/zod-validation.pipe";
import { dateSchema, uuidSchema } from "src/zod/schema/date.schema";
import { BetterAuthSession } from "../../type/auth.type";
import { CreateFoodLogDto, createFoodLogSchema } from "../dto/create-food-log.dto";
import { UpdateFoodLogDto, updateFoodLogSchema } from "../dto/update-food-log.dto";
import { DiaryService } from "../service/diary.service";

@Controller("diary")
@UseGuards(AuthGuard)
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  /**
   * GET /v1/api/diary/:date
   * Retourne le journal alimentaire pour une date donnée.
   */
  @Get(":date")
  async findByDate(
    @Session() session: BetterAuthSession,
    @Param("date", new ZodValidationPipe(dateSchema)) date: string,
  ): Promise<DiaryEntryResponse> {
    return this.diaryService.findByDate(session.user.id, date);
  }

  /**
   * POST /v1/api/diary/:date/log
   * Crée un nouveau journal alimentaire pour une date donnée.
   */
  @Post(":date/food-log")
  async createFoodLog(
    @Session() session: BetterAuthSession,
    @Param("date", new ZodValidationPipe(dateSchema)) date: string,
    @Body(new ZodValidationPipe(createFoodLogSchema)) foodLogDto: CreateFoodLogDto,
  ): Promise<FoodLog> {
    return this.diaryService.createFoodLog(session.user.id, date, foodLogDto);
  }

  /**
   * PATCH /v1/api/diary/:logId
   * Met à jour un journal alimentaire existant.
   */
  @Patch(":logId")
  async updateFoodLog(
    @Session() session: BetterAuthSession,
    @Param("logId") logId: string,
    @Body(new ZodValidationPipe(updateFoodLogSchema)) foodLogDto: UpdateFoodLogDto,
  ): Promise<FoodLog> {
    return this.diaryService.updateFoodLog(session.user.id, logId, foodLogDto);
  }

  /**
   * DELETE /v1/api/diary/:logId
   * Supprime un journal alimentaire existant.
   */
  @Delete(":logId")
  async deleteFoodLog(
    @Session() session: BetterAuthSession,
    @Param("logId", new ZodValidationPipe(uuidSchema)) logId: string,
  ): Promise<FoodLogWithoutFood> {
    return this.diaryService.deleteFoodLog(session.user.id, logId);
  }
}
