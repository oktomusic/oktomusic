-- CreateEnum
CREATE TYPE "LibraryItemType" AS ENUM ('ALBUM', 'PLAYLIST');

-- CreateTable
CREATE TABLE "UserLibraryItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemType" "LibraryItemType" NOT NULL,
    "itemId" TEXT NOT NULL,
    "addedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLibraryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserItemPlayHistory" (
    "userId" TEXT NOT NULL,
    "itemType" "LibraryItemType" NOT NULL,
    "itemId" TEXT NOT NULL,
    "lastPlayedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UserItemPlayHistory_pkey" PRIMARY KEY ("userId","itemType","itemId")
);

-- Migrate existing play history into the generic item reference table.
INSERT INTO "UserItemPlayHistory" ("userId", "itemType", "itemId", "lastPlayedAt")
SELECT "userId", 'ALBUM'::"LibraryItemType", "albumId", "lastPlayedAt"
FROM "UserPlayHistoryAlbum";

INSERT INTO "UserItemPlayHistory" ("userId", "itemType", "itemId", "lastPlayedAt")
SELECT "userId", 'PLAYLIST'::"LibraryItemType", "playlistId", "lastPlayedAt"
FROM "UserPlayHistoryPlaylist";

-- CreateIndex
CREATE UNIQUE INDEX "UserLibraryItem_userId_itemType_itemId_key" ON "UserLibraryItem"("userId", "itemType", "itemId");

-- CreateIndex
CREATE INDEX "UserLibraryItem_userId_addedAt_idx" ON "UserLibraryItem"("userId", "addedAt" DESC);

-- CreateIndex
CREATE INDEX "UserLibraryItem_itemType_itemId_idx" ON "UserLibraryItem"("itemType", "itemId");

-- CreateIndex
CREATE INDEX "UserItemPlayHistory_userId_lastPlayedAt_idx" ON "UserItemPlayHistory"("userId", "lastPlayedAt" DESC);

-- CreateIndex
CREATE INDEX "UserItemPlayHistory_itemType_itemId_idx" ON "UserItemPlayHistory"("itemType", "itemId");

-- AddForeignKey
ALTER TABLE "UserLibraryItem" ADD CONSTRAINT "UserLibraryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserItemPlayHistory" ADD CONSTRAINT "UserItemPlayHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "UserPlayHistoryAlbum" DROP CONSTRAINT "UserPlayHistoryAlbum_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserPlayHistoryAlbum" DROP CONSTRAINT "UserPlayHistoryAlbum_albumId_fkey";

-- DropForeignKey
ALTER TABLE "UserPlayHistoryPlaylist" DROP CONSTRAINT "UserPlayHistoryPlaylist_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserPlayHistoryPlaylist" DROP CONSTRAINT "UserPlayHistoryPlaylist_playlistId_fkey";

-- DropTable
DROP TABLE "UserPlayHistoryAlbum";

-- DropTable
DROP TABLE "UserPlayHistoryPlaylist";
