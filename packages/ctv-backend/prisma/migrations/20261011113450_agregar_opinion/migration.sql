-- CreateTable
CREATE TABLE "opinion" (
    "usuario_cliente_id" UUID NOT NULL,
    "paquete_id" UUID NOT NULL,
    "favorito" BOOLEAN NOT NULL DEFAULT false,
    "comentario" TEXT,
    "puntaje" INTEGER,

    CONSTRAINT "opinion_pkey" PRIMARY KEY ("usuario_cliente_id","paquete_id")
);

-- AddForeignKey
ALTER TABLE "opinion" ADD CONSTRAINT "opinion_usuario_cliente_id_fkey" FOREIGN KEY ("usuario_cliente_id") REFERENCES "usuario_cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opinion" ADD CONSTRAINT "opinion_paquete_id_fkey" FOREIGN KEY ("paquete_id") REFERENCES "paquete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
