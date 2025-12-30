-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isrc" TEXT,
    "date" DATE,
    "durationMs" INTEGER NOT NULL,
    "albumId" TEXT,
    "discNumber" INTEGER NOT NULL,
    "trackNumber" INTEGER NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackArtist" (
    "trackId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "TrackArtist_pkey" PRIMARY KEY ("trackId","artistId")
);

-- CreateTable
CREATE TABLE "AlbumArtist" (
    "albumId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "AlbumArtist_pkey" PRIMARY KEY ("albumId","artistId")
);

-- CreateIndex
CREATE INDEX "Track_albumId_idx" ON "Track"("albumId");

-- CreateIndex
CREATE INDEX "Track_albumId_discNumber_trackNumber_idx" ON "Track"("albumId", "discNumber", "trackNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Track_albumId_discNumber_trackNumber_key" ON "Track"("albumId", "discNumber", "trackNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_name_key" ON "Artist"("name");

-- CreateIndex
CREATE INDEX "TrackArtist_trackId_order_idx" ON "TrackArtist"("trackId", "order");

-- CreateIndex
CREATE INDEX "TrackArtist_artistId_idx" ON "TrackArtist"("artistId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackArtist_trackId_order_key" ON "TrackArtist"("trackId", "order");

-- CreateIndex
CREATE INDEX "AlbumArtist_albumId_order_idx" ON "AlbumArtist"("albumId", "order");

-- CreateIndex
CREATE INDEX "AlbumArtist_artistId_idx" ON "AlbumArtist"("artistId");

-- CreateIndex
CREATE UNIQUE INDEX "AlbumArtist_albumId_order_key" ON "AlbumArtist"("albumId", "order");

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumArtist" ADD CONSTRAINT "AlbumArtist_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumArtist" ADD CONSTRAINT "AlbumArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
