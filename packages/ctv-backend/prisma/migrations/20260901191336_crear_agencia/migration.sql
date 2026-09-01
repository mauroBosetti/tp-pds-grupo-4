-- CreateTable
CREATE TABLE "agencia" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo_de_grupo" TEXT,

    CONSTRAINT "agencia_pkey" PRIMARY KEY ("id")
);
