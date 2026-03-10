/*
  Warnings:

  - You are about to drop the column `isPublic` on the `Playlist` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PlaylistVisibility" AS ENUM ('PUBLIC', 'UNLISTED', 'PRIVATE');

-- AlterTable
ALTER TABLE "Playlist" DROP COLUMN "isPublic",
ADD COLUMN     "visibility" "PlaylistVisibility" NOT NULL DEFAULT 'PRIVATE';
