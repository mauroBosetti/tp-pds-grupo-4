-- CreateTable
CREATE TABLE "hotel" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "imagen" TEXT NOT NULL,

    CONSTRAINT "hotel_pkey" PRIMARY KEY ("id")
);
