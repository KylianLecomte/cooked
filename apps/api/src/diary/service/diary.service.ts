import {
  createEmptySummary,
  DiaryEntryResponse,
  FoodLog,
  FoodLogWithoutFood,
} from "@cooked/shared";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateFoodLog } from "../dto/create-food-log.dto";
import { UpdateFoodLog } from "../dto/update-food-log.dto";
import { ERROR_DIARY_ENTRY_NOT_FOUND, ERROR_FOOD_LOG_NOT_OWNED } from "../util/diary.constant";

@Injectable()
export class DiaryService {
  constructor(private readonly prisma: PrismaService) {}

  async findByDate(userId: string, date: string): Promise<DiaryEntryResponse> {
    const diaryEntry = await this.prisma.client.diaryEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
      include: { foodLogs: { include: { food: true } } },
    });

    if (!diaryEntry) {
      return {
        id: null,
        date: new Date(date),
        foodLogs: [],
        ...createEmptySummary(),
      };
    }

    const summary = diaryEntry.foodLogs.reduce(
      (acc, log) => {
        const logKcal = Math.round(log.food.kcalPer100g * (log.quantity / 100));
        const logProtein = Math.round(log.food.proteinPer100g * (log.quantity / 100));
        const logCarbs = Math.round(log.food.carbsPer100g * (log.quantity / 100));
        const logFat = Math.round(log.food.fatPer100g * (log.quantity / 100));

        acc.macrosTotals.calories += logKcal;
        acc.macrosTotals.protein += logProtein;
        acc.macrosTotals.carbs += logCarbs;
        acc.macrosTotals.fat += logFat;

        acc.macrosByMeal[log.meal].calories += logKcal;
        acc.macrosByMeal[log.meal].protein += logProtein;
        acc.macrosByMeal[log.meal].carbs += logCarbs;
        acc.macrosByMeal[log.meal].fat += logFat;

        return acc;
      },
      { ...createEmptySummary() },
    );

    return { ...diaryEntry, ...summary };
  }

  async createFoodLog(userId: string, date: string, foodLogDto: CreateFoodLog): Promise<FoodLog> {
    const diaryEntry = await this.prisma.client.diaryEntry.upsert({
      where: { userId_date: { userId, date: new Date(date) } },
      create: { userId, date: new Date(date) },
      update: {},
    });

    return this.prisma.client.foodLog.create({
      data: {
        diaryEntryId: diaryEntry.id,
        ...foodLogDto,
      },
      include: { food: true },
    });
  }

  async updateFoodLog(userId: string, logId: string, foodLogDto: UpdateFoodLog): Promise<FoodLog> {
    await this.checkFoodLogOwnership(userId, logId);

    return this.prisma.client.foodLog.update({
      where: { id: logId },
      data: foodLogDto,
      include: { food: true },
    });
  }

  async deleteFoodLog(userId: string, logId: string): Promise<FoodLogWithoutFood> {
    await this.checkFoodLogOwnership(userId, logId);

    return this.prisma.client.foodLog.delete({ where: { id: logId } });
  }

  private async checkFoodLogOwnership(userId: string, logId: string) {
    const foodLog = await this.prisma.client.foodLog.findUnique({
      where: { id: logId },
      include: { diaryEntry: { select: { userId: true } } },
    });

    if (!foodLog) {
      throw new NotFoundException(ERROR_DIARY_ENTRY_NOT_FOUND);
    }
    if (foodLog.diaryEntry.userId !== userId) {
      throw new ForbiddenException(ERROR_FOOD_LOG_NOT_OWNED);
    }
  }
}
