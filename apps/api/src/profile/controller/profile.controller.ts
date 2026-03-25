import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { AuthGuard, Session, UserSession } from "@thallesp/nestjs-better-auth";
import { BetterAuthSession } from "../../type/auth.type";
import { ProfileService } from "../service/profile.service";

// La session injectée par Better Auth contient { session: {...}, user: User }

@Controller("profile")
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET /api/profile
  // Retourne le profil de l'utilisateur courant, ou null s'il n'a pas encore
  // complété son onboarding.
  @Get()
  getProfile(@Session() session: UserSession) {
    return this.profileService.findByUserId(session.user.id);
  }

  // PATCH /v1/api/profile
  // Mise à jour partielle (upsert) du profil.
  // Déclenche le recalcul TDEE si tous les champs nécessaires sont présents.
  // Retourne le profil mis à jour avec les valeurs TDEE calculées.
  @Patch()
  updateProfile(@Session() session: BetterAuthSession, @Body() body: unknown) {
    return this.profileService.upsert(session.user.id, body);
  }
}
