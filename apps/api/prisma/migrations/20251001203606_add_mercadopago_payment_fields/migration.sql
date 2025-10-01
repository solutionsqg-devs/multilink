/*
  Warnings:

  - A unique constraint covering the columns `[mercado_pago_customer_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "mercado_pago_customer_id" TEXT,
ADD COLUMN     "payment_provider" TEXT,
ADD COLUMN     "subscription_id" TEXT,
ADD COLUMN     "subscription_status" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_mercado_pago_customer_id_key" ON "users"("mercado_pago_customer_id");
