# TODO: Create Review Service

## Step 1: Update Prisma Schema ✅
- Add new fields to reviews model: category, subCategory, productOrService, reviewText, photos (String[]), videos (String[])

## Step 2: Create Review-Service Directory Structure ✅
- Create Server/org/apps/review-service/ directory
- Add package.json, tsconfig files, Dockerfile similar to auth-service

## Step 3: Implement Review-Service Main Files ✅
- Create src/main.ts (Express setup with middleware, swagger, etc.)
- Create src/routes/review.router.ts (routes for POST /reviews, PUT /reviews/:id, GET /reviews)
- Create src/controllers/review_controller.ts (controller functions for CRUD operations)
- Create src/utils/ (helpers, Cloudinary integration)

## Step 4: Generate Prisma Client ✅
- Run prisma generate after schema update

## Step 5: Install Dependencies ✅
- Install packages for review-service (express, prisma, cloudinary, etc.)

## Step 6: Update Frontend API Integration ✅
- Modify src/services/api.js to use review-service endpoints
- Update components like CreateReview.jsx, ReviewCard.jsx for new fields

## Step 7: Test Review-Service ✅
- Build the service successfully
- Add review service port to api-gateway ✅
- Start the service and test endpoints
- Verify frontend displays reviews correctly
