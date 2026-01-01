-- CreateTable
CREATE TABLE "FlacFile" (
    "id" TEXT NOT NULL,
    "relativePath" TEXT NOT NULL,
    "sampleRate" INTEGER NOT NULL,
    "bitsPerRawSample" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "bitRate" INTEGER NOT NULL,
    "trackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlacFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FlacFile_relativePath_key" ON "FlacFile"("relativePath");

-- CreateIndex
CREATE UNIQUE INDEX "FlacFile_trackId_key" ON "FlacFile"("trackId");

-- AddForeignKey
ALTER TABLE "FlacFile" ADD CONSTRAINT "FlacFile_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
