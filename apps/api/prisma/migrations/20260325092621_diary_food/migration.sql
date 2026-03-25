-- CreateEnum
CREATE TYPE "Meal" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateTable
CREATE TABLE "diary_entry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "diary_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_log" (
    "id" TEXT NOT NULL,
    "diaryEntryId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "meal" "Meal" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "food_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "diary_entry_userId_idx" ON "diary_entry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "diary_entry_userId_date_key" ON "diary_entry"("userId", "date");

-- CreateIndex
CREATE INDEX "food_log_diaryEntryId_idx" ON "food_log"("diaryEntryId");

-- CreateIndex
CREATE INDEX "food_log_foodId_idx" ON "food_log"("foodId");

-- AddForeignKey
ALTER TABLE "diary_entry" ADD CONSTRAINT "diary_entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_log" ADD CONSTRAINT "food_log_diaryEntryId_fkey" FOREIGN KEY ("diaryEntryId") REFERENCES "diary_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_log" ADD CONSTRAINT "food_log_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
