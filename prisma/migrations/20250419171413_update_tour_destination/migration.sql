/*
  Warnings:

  - Added the required column `destinationId` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exclusions` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullDescription` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inclusions` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itinerary` to the `Tour` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "destinationId" INTEGER NOT NULL,
ADD COLUMN     "exclusions" TEXT NOT NULL,
ADD COLUMN     "fullDescription" TEXT NOT NULL,
ADD COLUMN     "imageUrls" TEXT[],
ADD COLUMN     "inclusions" TEXT NOT NULL,
ADD COLUMN     "itinerary" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Destination" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Destination_slug_key" ON "Destination"("slug");

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
