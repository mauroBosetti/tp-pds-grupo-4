-- CreateTable
CREATE TABLE "cuenta" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "hash_clave" TEXT NOT NULL,

    CONSTRAINT "cuenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_administrador" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "cuenta_id" UUID NOT NULL,

    CONSTRAINT "usuario_administrador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cuenta_email_key" ON "cuenta"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_administrador_cuenta_id_key" ON "usuario_administrador"("cuenta_id");

-- AddForeignKey
ALTER TABLE "usuario_administrador" ADD CONSTRAINT "usuario_administrador_cuenta_id_fkey" FOREIGN KEY ("cuenta_id") REFERENCES "cuenta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
