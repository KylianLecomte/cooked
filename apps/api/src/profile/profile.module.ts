import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

// PrismaModule est @Global() donc PrismaService est disponible sans l'importer ici.
@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
