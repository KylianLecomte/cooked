import { Module } from "@nestjs/common";
import { ProfileController } from "./controller/profile.controller";
import { ProfileService } from "./service/profile.service";

// PrismaModule est @Global() donc PrismaService est disponible sans l'importer ici.
@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
