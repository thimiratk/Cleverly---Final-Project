# TODO: Exceptional Categories Implementation

## Overview
Implement exceptional categories system where users can create custom categories/subcategories that are saved as exceptional fields in reviews, and admins can later convert them to standard categories.

## Frontend ✅ COMPLETED
- [x] Remove `createCategory` and `createSubCategory` imports from CreateReview.jsx
- [x] Remove direct category creation functions 
- [x] Update UI to only show "Save as Custom" option
- [x] Improve exceptional category indicator messaging
- [x] Connect to domain service for fetching standard categories/subcategories
- [x] Save custom entries as `exceptionalCategory` and `exceptionalSubCategory` fields

## Backend Implementation

### 1. Database Schema ✅ COMPLETED
- [x] Add `exceptionalCategory` field to Review model (String, optional)
- [x] Add `exceptionalSubCategory` field to Review model (String, optional) 
- [x] Add `isExceptional` field to Review model (Boolean, default: false)

### 2. Review Service Enhancements

#### 2.1 Review Controller Updates ✅ COMPLETED
- [x] Update `createReview` to handle exceptional categories
- [x] Set `isExceptional: true` when exceptional categories are provided
- [x] Add `getExceptionalReviews` endpoint for admin dashboard

#### 2.2 New Endpoints Needed
- [x] `GET /reviews/exceptional` - Get all reviews with exceptional categories
- [x] `POST /reviews/:id/convert-category` - Convert exceptional category to standard
- [x] `POST /reviews/:id/convert-subcategory` - Convert exceptional subcategory to standard

### 3. Admin Dashboard Backend

#### 3.1 Admin API Enhancements ✅ COMPLETED
- [x] Add exceptional reviews endpoints to admin API service
- [x] Update admin dashboard API calls

#### 3.2 Category Management for Admins
- [ ] **PENDING**: `POST /admin/categories/from-exceptional` - Create standard category from exceptional
  ```typescript
  // Input: { reviewId: string, categoryName: string }
  // Output: { category: Category, updatedReview: Review }
  ```

- [ ] **PENDING**: `POST /admin/subcategories/from-exceptional` - Create standard subcategory from exceptional
  ```typescript
  // Input: { reviewId: string, subcategoryName: string, categoryId: string }
  // Output: { subcategory: SubCategory, updatedReview: Review }
  ```

- [ ] **PENDING**: Update review when converting exceptional to standard:
  ```typescript
  // When converting exceptional category:
  // 1. Create new standard category
  // 2. Update review: set categoryId, clear exceptionalCategory, set isExceptional: false
  
  // When converting exceptional subcategory:
  // 1. Create new standard subcategory 
  // 2. Update review: set subCategoryId, clear exceptionalSubCategory
  ```

### 4. Admin Dashboard Frontend

#### 4.1 Exceptional Reviews Management Page
- [ ] **PENDING**: Create `ExceptionalReviews.jsx` component
  - [ ] List all reviews with exceptional categories
  - [ ] Show exceptional category/subcategory names
  - [ ] Add "Convert to Standard" buttons
  - [ ] Bulk operations for multiple conversions

#### 4.2 Review Management Enhancements
- [ ] **PENDING**: Add exceptional category indicators in review lists
- [ ] **PENDING**: Add filter for exceptional reviews
- [ ] **PENDING**: Add conversion actions in review detail view

#### 4.3 Category Management Integration
- [ ] **PENDING**: Update domain management to show "Created from exceptional" flag
- [ ] **PENDING**: Add statistics for exceptional → standard conversions

### 5. Domain Service Integration

#### 5.1 Category Creation from Exceptional ✅ PARTIALLY COMPLETED
- [x] Domain service has standard CRUD operations
- [ ] **PENDING**: Add metadata to track categories created from exceptional reviews
- [ ] **PENDING**: Add endpoint to get conversion history

### 6. API Gateway Updates

#### 6.1 Route Configuration ✅ COMPLETED
- [x] Exceptional review routes properly configured
- [x] Admin conversion routes added

### 7. Testing & Validation

#### 7.1 Backend Testing
- [ ] **PENDING**: Unit tests for exceptional category handling
- [ ] **PENDING**: Integration tests for conversion workflow
- [ ] **PENDING**: API endpoint tests

#### 7.2 Frontend Testing  
- [ ] **PENDING**: Test exceptional category creation flow
- [ ] **PENDING**: Test admin conversion workflow
- [ ] **PENDING**: Test edge cases (duplicate categories, etc.)

### 8. Data Migration & Cleanup

#### 8.1 Existing Data
- [ ] **PENDING**: Script to identify potential exceptional categories in existing reviews
- [ ] **PENDING**: Migration script if needed for existing data

### 9. Documentation

#### 9.1 API Documentation
- [ ] **PENDING**: Document exceptional category endpoints
- [ ] **PENDING**: Document conversion workflow
- [ ] **PENDING**: Add examples for admin operations

#### 9.2 User Documentation
- [ ] **PENDING**: Update user guide for custom category creation
- [ ] **PENDING**: Admin guide for managing exceptional categories

## Priority Implementation Order

### Phase 1: Core Backend (HIGH PRIORITY)
1. ✅ Database schema updates (COMPLETED)
2. ✅ Review service exceptional handling (COMPLETED) 
3. [ ] Admin conversion endpoints
4. [ ] Testing backend conversion flow

### Phase 2: Admin Interface (MEDIUM PRIORITY)
1. [ ] Exceptional reviews management page
2. [ ] Conversion UI components
3. [ ] Integration with existing admin dashboard

### Phase 3: Enhancements (LOW PRIORITY)
1. [ ] Analytics and reporting
2. [ ] Bulk conversion operations
3. [ ] Category suggestion algorithms

## Notes
- ✅ Frontend already handles exceptional categories correctly
- ✅ Database schema supports exceptional categories
- ✅ Review service can create reviews with exceptional categories
- 🔄 Main remaining work: Admin conversion workflow and UI
- 🔄 Admin dashboard needs exceptional reviews management interface

## Current Status
- **Frontend**: ✅ Complete - Users can create exceptional categories
- **Backend Core**: ✅ 80% Complete - Reviews save exceptional categories
- **Admin Backend**: 🔄 50% Complete - Need conversion endpoints
- **Admin Frontend**: ❌ 0% Complete - Need exceptional reviews management UI

## Next Steps
1. Implement admin conversion endpoints in review service
2. Create exceptional reviews management page in admin dashboard
3. Test end-to-end conversion workflow
4. Add proper error handling and validation