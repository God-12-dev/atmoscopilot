-- AlterTable
ALTER TABLE "FavoriteLocation" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en';
