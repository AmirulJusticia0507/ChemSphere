-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elements" (
    "id" UUID NOT NULL,
    "atomicNumber" INTEGER NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "nameId" VARCHAR(100) NOT NULL,
    "nameLatin" VARCHAR(100) NOT NULL,
    "atomicMass" DECIMAL(10,4) NOT NULL,
    "electronConfig" VARCHAR(255) NOT NULL,
    "categoryId" UUID NOT NULL,
    "period" INTEGER NOT NULL,
    "group" INTEGER NOT NULL,
    "description" TEXT,
    "uses" TEXT,
    "hazardWarning" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polyatomic_ions" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "formula" VARCHAR(50) NOT NULL,
    "charge" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polyatomic_ions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "elements_atomicNumber_key" ON "elements"("atomicNumber");

-- CreateIndex
CREATE UNIQUE INDEX "elements_symbol_key" ON "elements"("symbol");

-- AddForeignKey
ALTER TABLE "elements" ADD CONSTRAINT "elements_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
