-- AlterTable
ALTER TABLE "servicos" ADD COLUMN     "capacidadeMaxima" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "tempoBuffer" INTEGER NOT NULL DEFAULT 0;
