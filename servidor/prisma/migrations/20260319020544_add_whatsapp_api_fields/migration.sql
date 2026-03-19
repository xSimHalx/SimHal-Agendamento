-- AlterTable
ALTER TABLE "empresas" ADD COLUMN     "msgBoasVindasAtiva" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "msgLembreteAtiva" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsappApiToken" TEXT,
ADD COLUMN     "whatsappApiUrl" TEXT,
ADD COLUMN     "whatsappInstanceName" TEXT;
