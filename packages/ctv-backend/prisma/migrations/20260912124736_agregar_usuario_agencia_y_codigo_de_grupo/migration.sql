-- AlterTable
ALTER TABLE "agencia" ALTER COLUMN "codigo_de_grupo" SET NOT NULL,
ALTER COLUMN "codigo_de_grupo" SET DATA TYPE CHAR(8);

-- CreateTable
CREATE TABLE "usuario_agencia" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "cuenta_id" UUID NOT NULL,
    "agencia_id" UUID NOT NULL,

    CONSTRAINT "usuario_agencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_agencia_cuenta_id_key" ON "usuario_agencia"("cuenta_id");

-- CreateIndex
CREATE UNIQUE INDEX "agencia_codigo_de_grupo_key" ON "agencia"("codigo_de_grupo");

-- AddForeignKey
ALTER TABLE "usuario_agencia" ADD CONSTRAINT "usuario_agencia_cuenta_id_fkey" FOREIGN KEY ("cuenta_id") REFERENCES "cuenta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_agencia" ADD CONSTRAINT "usuario_agencia_agencia_id_fkey" FOREIGN KEY ("agencia_id") REFERENCES "agencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

