-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('XY', 'XX');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sex" "Sex";

-- CreateIndex
CREATE INDEX "User_sex_idx" ON "User"("sex");
