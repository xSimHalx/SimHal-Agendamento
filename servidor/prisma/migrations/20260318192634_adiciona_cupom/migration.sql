/*
  Warnings:

  - You are about to alter the column `preco` on the `adicionais` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `valorTotal` on the `agendamentos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `preco` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `valor` on the `transacoes` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "adicionais" ALTER COLUMN "preco" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "agendamentos" ALTER COLUMN "valorTotal" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "empresas" ADD COLUMN     "metaMensal" INTEGER NOT NULL DEFAULT 5000;

-- AlterTable
ALTER TABLE "servicos" ALTER COLUMN "preco" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "transacoes" ALTER COLUMN "valor" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "cupons" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "desconto" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'PERCENTUAL',
    "validade" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "usos" INTEGER NOT NULL DEFAULT 0,
    "empresaId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cupons_codigo_key" ON "cupons"("codigo");

-- AddForeignKey
ALTER TABLE "cupons" ADD CONSTRAINT "cupons_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
