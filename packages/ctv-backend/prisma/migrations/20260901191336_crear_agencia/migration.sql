-- CreateTable
CREATE TABLE "agencias" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo_de_grupo" TEXT,

    CONSTRAINT "agencias_pkey" PRIMARY KEY ("id")
);
