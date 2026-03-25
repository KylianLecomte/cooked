import { Module } from "@nestjs/common";
import { DiaryController } from "./controller/diary.controller";
import { DiaryService } from "./service/diary.service";

@Module({
  controllers: [DiaryController],
  providers: [DiaryService],
})
export class DiaryModule {}
