/*
  Warnings:

  - Added the required column `coverColorDarkMuted` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverColorDarkVibrant` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverColorLightMuted` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverColorLightVibrant` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverColorMuted` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverColorVibrant` to the `Album` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "coverColorDarkMuted" TEXT NOT NULL,
ADD COLUMN     "coverColorDarkVibrant" TEXT NOT NULL,
ADD COLUMN     "coverColorLightMuted" TEXT NOT NULL,
ADD COLUMN     "coverColorLightVibrant" TEXT NOT NULL,
ADD COLUMN     "coverColorMuted" TEXT NOT NULL,
ADD COLUMN     "coverColorVibrant" TEXT NOT NULL;
