/*
  Warnings:

  - You are about to drop the column `dataVencimento` on the `empresas` table. All the data in the column will be lost.
  - You are about to drop the column `metaMensal` on the `empresas` table. All the data in the column will be lost.
  - You are about to drop the column `planoAtual` on the `empresas` table. All the data in the column will be lost.
  - You are about to drop the column `statusAssinatura` on the `empresas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "empresas" DROP COLUMN "dataVencimento",
DROP COLUMN "metaMensal",
DROP COLUMN "planoAtual",
DROP COLUMN "statusAssinatura",
ADD COLUMN     "autoAniversario" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "autoAvaliacao" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "autoBloqueioFalta" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "autoLembrete" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cnpj" TEXT;

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'INFO',
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chamados_suporte" (
    "id" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "prioridade" TEXT NOT NULL DEFAULT 'NORMAL',
    "empresaId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chamados_suporte_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamados_suporte" ADD CONSTRAINT "chamados_suporte_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
