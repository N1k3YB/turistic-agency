/*
  Warnings:

  - The primary key for the `Tour` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Tour` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'COACH';
ALTER TYPE "UserRole" ADD VALUE 'PLAYER';

-- AlterTable
ALTER TABLE "Tour" DROP CONSTRAINT "Tour_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30),
ADD CONSTRAINT "Tour_pkey" PRIMARY KEY ("id");
