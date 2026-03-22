import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { AuthGuard, Session } from "@thallesp/nestjs-better-auth";
import { ZodValidationPipe } from "src/zod/pipe/zod-validation.pipe";
import { BetterAuthSession } from "../../type/auth.type";
import { CreateFoodLogDto, createFoodLogSchema } from "../dto/create-food-log.dto";
import { UpdateFoodLogDto, updateFoodLogSchema } from "../dto/update-food-log.dto";
import { DiaryService } from "../service/diary.service";

@Controller("diary")
@UseGuards(AuthGuard)
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  /**
   * GET /api/diary/:date
   * Retourne le journal alimentaire pour une date donnée.
   */
  @Get(":date")
  async findByDate(@Session() session: BetterAuthSession, @Param("date") date: string) {
    return this.diaryService.findByDate(session.user.id, date);
  }

  /**
   * POST /api/diary/:date/log
   * Crée un nouveau journal alimentaire pour une date donnée.
   */
  @Post(":date/log")
  @UsePipes(new ZodValidationPipe(createFoodLogSchema))
  async createFoodLog(
    @Session() session: BetterAuthSession,
    @Param("date") date: string,
    @Body() foodLogDto: CreateFoodLogDto,
  ) {
    return this.diaryService.createFoodLog(session.user.id, date, foodLogDto);
  }

  /**
   * PATCH /api/diary/:logId
   * Met à jour un journal alimentaire existant.
   */
  @Patch(":logId")
  @UsePipes(new ZodValidationPipe(updateFoodLogSchema))
  async updateFoodLog(
    @Session() session: BetterAuthSession,
    @Param("logId") logId: string,
    @Body() foodLogDto: UpdateFoodLogDto,
  ) {
    return this.diaryService.updateFoodLog(session.user.id, logId, foodLogDto);
  }

  /**
   * DELETE /api/diary/:logId
   * Supprime un journal alimentaire existant.
   */
  @Delete(":logId")
  async deleteFoodLog(@Session() session: BetterAuthSession, @Param("logId") logId: string) {
    return this.diaryService.deleteFoodLog(session.user.id, logId);
  }
}
