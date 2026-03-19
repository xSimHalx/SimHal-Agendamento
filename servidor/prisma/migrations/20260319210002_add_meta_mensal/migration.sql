/*
  Warnings:

  - You are about to drop the column `msgBoasVindasAtiva` on the `empresas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "empresas" DROP COLUMN "msgBoasVindasAtiva",
ADD COLUMN     "metaMensal" INTEGER NOT NULL DEFAULT 5000;
