-- AlterTable
ALTER TABLE "agendamentos" ADD COLUMN     "respostasExtras" JSONB;

-- CreateTable
CREATE TABLE "campos_formulario" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'TEXT',
    "opcoes" JSONB,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "campos_formulario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "campos_formulario" ADD CONSTRAINT "campos_formulario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
