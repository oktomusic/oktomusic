-- CreateTable
CREATE TABLE "HelloWorld" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,

    CONSTRAINT "HelloWorld_pkey" PRIMARY KEY ("id")
);
