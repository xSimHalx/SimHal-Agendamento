-- AlterTable
ALTER TABLE "empresas" ADD COLUMN     "horarioFuncionamento" JSONB;

-- CreateTable
CREATE TABLE "bloqueios_agenda" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "profissionalId" TEXT,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "recorrente" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "bloqueios_agenda_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bloqueios_agenda" ADD CONSTRAINT "bloqueios_agenda_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueios_agenda" ADD CONSTRAINT "bloqueios_agenda_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
