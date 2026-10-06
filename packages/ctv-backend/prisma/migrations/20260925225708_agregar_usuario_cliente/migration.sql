-- CreateTable
CREATE TABLE "usuario_cliente" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "cuenta_id" UUID NOT NULL,

    CONSTRAINT "usuario_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_cliente_cuenta_id_key" ON "usuario_cliente"("cuenta_id");

-- AddForeignKey
ALTER TABLE "usuario_cliente" ADD CONSTRAINT "usuario_cliente_cuenta_id_fkey" FOREIGN KEY ("cuenta_id") REFERENCES "cuenta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
