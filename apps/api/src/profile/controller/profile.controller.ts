import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { AuthGuard, Session } from "@thallesp/nestjs-better-auth";
import type { User } from "../auth/auth";
import { ProfileService } from "./profile.service";

// La session injectée par Better Auth contient { session: {...}, user: User }
type BetterAuthSession = { user: User };

@Controller("api/profile")
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET /api/profile
  // Retourne le profil de l'utilisateur courant, ou null s'il n'a pas encore
  // complété son onboarding.
  @Get()
  getProfile(@Session() session: BetterAuthSession) {
    return this.profileService.findByUserId(session.user.id);
  }

  // PATCH /api/profile
  // Mise à jour partielle (upsert) du profil.
  // Déclenche le recalcul TDEE si tous les champs nécessaires sont présents.
  // Retourne le profil mis à jour avec les valeurs TDEE calculées.
  @Patch()
  updateProfile(@Session() session: BetterAuthSession, @Body() body: unknown) {
    return this.profileService.upsert(session.user.id, body);
  }
}
