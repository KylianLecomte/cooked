import type { ActivityLevel, Gender, Goal } from "@cooked/shared";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { zodSafeParse } from "../../zod/util/zod.util";
import type { UpdateProfileDto } from "../dto/update-profile.schema";
import { updateProfileSchema } from "../dto/update-profile.schema";
import { calculateTdee, type TdeeResult } from "../tdee.calculator";

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return await this.prisma.client.profile.findUnique({
      where: { userId },
    });
  }

  async upsert(userId: string, rawDto: unknown) {
    const dto: UpdateProfileDto = zodSafeParse(updateProfileSchema, rawDto);

    // Récupère le profil existant pour le merge (PATCH = merge, pas remplacement)
    const existing = await this.prisma.client.profile.findUnique({
      where: { userId },
    });

    // Merge : les valeurs du dto écrasent celles existantes, les autres sont conservées
    const merged = {
      birthDate: dto.birthDate ?? existing?.birthDate,
      gender: dto.gender ?? existing?.gender,
      heightCm: dto.heightCm ?? existing?.heightCm,
      weightKg: dto.weightKg ?? existing?.weightKg,
      activityLevel: dto.activityLevel ?? existing?.activityLevel,
      goal: dto.goal ?? existing?.goal,
    };

    // Recalcule le TDEE seulement si tous les champs requis sont présents
    // bmrKcal est un résultat intermédiaire non persisté en BDD
    const { bmrKcal: _, ...tdee } = this.tryCalculateTdee(merged);

    return this.prisma.client.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...merged,
        ...tdee,
      },
      update: {
        ...merged,
        ...tdee,
      },
    });
  }

  // Retourne un objet partiel Prisma (null par défaut si données incomplètes).
  // On passe null explicitement pour réinitialiser les valeurs calculées si
  // les données d'entrée deviennent incomplètes après une suppression de champ.

  private tryCalculateTdee(data: {
    birthDate?: Date | null;
    gender?: Gender | null;
    heightCm?: number | null;
    weightKg?: number | null;
    activityLevel?: ActivityLevel | null;
    goal?: Goal | null;
  }): Partial<TdeeResult> {
    const { birthDate, gender, heightCm, weightKg, activityLevel, goal } = data;

    if (!birthDate || !gender || !heightCm || !weightKg || !activityLevel || !goal) {
      return {};
    }

    return calculateTdee({ birthDate, gender, heightCm, weightKg, activityLevel, goal });
  }
}
