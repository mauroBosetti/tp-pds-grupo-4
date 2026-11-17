/*
  Warnings:

  - Added the required column `hotel_id` to the `paquete` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "paquete" ADD COLUMN     "hotel_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "paquete" ADD CONSTRAINT "paquete_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
