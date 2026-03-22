import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateFoodLogDto } from "../dto/create-food-log.dto";
import { UpdateFoodLogDto } from "../dto/update-food-log.dto";
import { ERROR_UPDATE_FOOD_LOG_FORBIDDEN } from "../util/constant";

@Injectable()
export class DiaryService {
  constructor(private readonly _prisma: PrismaService) {}

  findByDate(userId: string, date: string) {
    return this._prisma.client.diaryEntry.findMany({
      where: { userId, date: new Date(date) },
      include: { logs: { include: { food: true } } },
    });
  }

  async createFoodLog(userId: string, date: string, foodLogDto: CreateFoodLogDto) {
    const _diaryEntry = await this._prisma.client.diaryEntry.upsert({
      where: { userId_date: { userId, date: new Date(date) } },
      create: { userId, date: new Date(date) },
      update: {},
    });

    return this._prisma.client.foodLog.create({
      data: {
        diaryEntryId: _diaryEntry.id,
        ...foodLogDto,
      },
      include: { food: true },
    });
  }

  async updateFoodLog(userId: string, logId: string, foodLogDto: UpdateFoodLogDto) {
    await this._checkFoodLogOwnership(userId, logId);

    return this._prisma.client.foodLog.update({
      where: { id: logId },
      data: foodLogDto,
      include: { food: true },
    });
  }

  async deleteFoodLog(userId: string, logId: string) {
    await this._checkFoodLogOwnership(userId, logId);

    return this._prisma.client.foodLog.delete({ where: { id: logId } });
  }

  private async _checkFoodLogOwnership(userId: string, logId: string) {
    const _foodLog = await this._prisma.client.foodLog.findUniqueOrThrow({
      where: { id: logId },
      include: { diaryEntry: { select: { userId: true } } },
    });

    if (_foodLog.diaryEntry.userId !== userId) {
      throw new ForbiddenException(ERROR_UPDATE_FOOD_LOG_FORBIDDEN);
    }
  }
}
