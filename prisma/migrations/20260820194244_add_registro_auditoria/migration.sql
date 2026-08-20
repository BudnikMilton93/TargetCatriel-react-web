-- CreateTable
CREATE TABLE "registros_auditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "detalles" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registros_auditoria_usuarioId_idx" ON "registros_auditoria"("usuarioId");

-- CreateIndex
CREATE INDEX "registros_auditoria_createdAt_idx" ON "registros_auditoria"("createdAt");

-- AddForeignKey
ALTER TABLE "registros_auditoria" ADD CONSTRAINT "registros_auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
