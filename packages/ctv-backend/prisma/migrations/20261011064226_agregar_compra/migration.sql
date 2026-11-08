-- CreateTable
CREATE TABLE "compra" (
    "id" UUID NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_cliente_id" UUID NOT NULL,
    "paquete_id" UUID NOT NULL,

    CONSTRAINT "compra_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "compra" ADD CONSTRAINT "compra_usuario_cliente_id_fkey" FOREIGN KEY ("usuario_cliente_id") REFERENCES "usuario_cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra" ADD CONSTRAINT "compra_paquete_id_fkey" FOREIGN KEY ("paquete_id") REFERENCES "paquete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
