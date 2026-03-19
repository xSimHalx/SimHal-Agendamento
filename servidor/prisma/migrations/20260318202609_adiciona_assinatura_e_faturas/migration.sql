-- AlterTable
ALTER TABLE "empresas" ADD COLUMN     "dataVencimento" TIMESTAMP(3),
ADD COLUMN     "plano" TEXT NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "statusAssinatura" TEXT NOT NULL DEFAULT 'ATIVO';

-- CreateTable
CREATE TABLE "faturas" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valor" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PAGO',
    "plano" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "faturas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "faturas_codigo_key" ON "faturas"("codigo");

-- AddForeignKey
ALTER TABLE "faturas" ADD CONSTRAINT "faturas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
