-- CreateTable
CREATE TABLE "paquete" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" INTEGER NOT NULL,
    "origen" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "vuelo_ida_id" INTEGER NOT NULL,
    "vuelo_vuelta_id" INTEGER NOT NULL,
    "agencia_id" UUID NOT NULL,

    CONSTRAINT "paquete_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "paquete" ADD CONSTRAINT "paquete_agencia_id_fkey" FOREIGN KEY ("agencia_id") REFERENCES "agencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
