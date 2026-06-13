-- CreateTable
CREATE TABLE "UserPlayHistoryAlbum" (
    "userId" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "lastPlayedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UserPlayHistoryAlbum_pkey" PRIMARY KEY ("userId","albumId")
);

-- CreateTable
CREATE TABLE "UserPlayHistoryPlaylist" (
    "userId" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "lastPlayedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UserPlayHistoryPlaylist_pkey" PRIMARY KEY ("userId","playlistId")
);

-- CreateIndex
CREATE INDEX "UserPlayHistoryAlbum_userId_lastPlayedAt_idx" ON "UserPlayHistoryAlbum"("userId", "lastPlayedAt" DESC);

-- CreateIndex
CREATE INDEX "UserPlayHistoryPlaylist_userId_lastPlayedAt_idx" ON "UserPlayHistoryPlaylist"("userId", "lastPlayedAt" DESC);

-- AddForeignKey
ALTER TABLE "UserPlayHistoryAlbum" ADD CONSTRAINT "UserPlayHistoryAlbum_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlayHistoryAlbum" ADD CONSTRAINT "UserPlayHistoryAlbum_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlayHistoryPlaylist" ADD CONSTRAINT "UserPlayHistoryPlaylist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlayHistoryPlaylist" ADD CONSTRAINT "UserPlayHistoryPlaylist_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
