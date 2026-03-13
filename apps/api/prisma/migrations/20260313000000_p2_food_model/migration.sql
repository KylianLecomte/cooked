-- CreateEnum
CREATE TYPE "FoodSource" AS ENUM ('USDA', 'OFF', 'MANUAL');

-- CreateEnum
CREATE TYPE "FoodCategory" AS ENUM ('PROTEIN', 'STARCH', 'VEGETABLE', 'FRUIT', 'DAIRY', 'FAT_OIL', 'OTHER');

-- CreateTable
CREATE TABLE "food" (
    "id" TEXT NOT NULL,
    "source" "FoodSource" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "category" "FoodCategory" NOT NULL DEFAULT 'OTHER',
    "kcalPer100g" DOUBLE PRECISION NOT NULL,
    "proteinPer100g" DOUBLE PRECISION NOT NULL,
    "carbsPer100g" DOUBLE PRECISION NOT NULL,
    "fatPer100g" DOUBLE PRECISION NOT NULL,
    "fiberPer100g" DOUBLE PRECISION,
    "vitA" DOUBLE PRECISION,
    "vitB1" DOUBLE PRECISION,
    "vitB2" DOUBLE PRECISION,
    "vitB3" DOUBLE PRECISION,
    "vitB5" DOUBLE PRECISION,
    "vitB6" DOUBLE PRECISION,
    "vitB9" DOUBLE PRECISION,
    "vitB12" DOUBLE PRECISION,
    "vitC" DOUBLE PRECISION,
    "vitD" DOUBLE PRECISION,
    "vitE" DOUBLE PRECISION,
    "vitK" DOUBLE PRECISION,
    "calcium" DOUBLE PRECISION,
    "iron" DOUBLE PRECISION,
    "magnesium" DOUBLE PRECISION,
    "potassium" DOUBLE PRECISION,
    "zinc" DOUBLE PRECISION,
    "phosphorus" DOUBLE PRECISION,
    "selenium" DOUBLE PRECISION,
    "sodium" DOUBLE PRECISION,
    "copper" DOUBLE PRECISION,
    "manganese" DOUBLE PRECISION,
    "microDataComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "food_name_idx" ON "food"("name");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "food_source_sourceId_key" ON "food"("source", "sourceId");
