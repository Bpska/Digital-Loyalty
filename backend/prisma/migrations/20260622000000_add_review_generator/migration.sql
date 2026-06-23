-- CreateTable
CREATE TABLE "business_review_settings" (
    "id" TEXT NOT NULL,
    "businessType" TEXT,
    "googleReviewUrl" TEXT,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_review_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_generations" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "generatedReviews" JSONB NOT NULL,
    "selectedReview" TEXT,
    "reviewLinkClicked" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_generations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_review_settings_businessId_key" ON "business_review_settings"("businessId");

-- CreateIndex
CREATE INDEX "review_generations_userId_idx" ON "review_generations"("userId");

-- CreateIndex
CREATE INDEX "review_generations_businessId_idx" ON "review_generations"("businessId");

-- CreateIndex
CREATE INDEX "review_generations_rating_idx" ON "review_generations"("rating");

-- AddForeignKey
ALTER TABLE "business_review_settings" ADD CONSTRAINT "business_review_settings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_generations" ADD CONSTRAINT "review_generations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_generations" ADD CONSTRAINT "review_generations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
