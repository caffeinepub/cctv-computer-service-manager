# CCTV & Computer Service Manager

## Current State
Full-stack app with Motoko backend and React frontend. Features:
- Landing page with hero, services grid, footer (KALAI INFO TECH branding)
- Customer portal: submit service requests, track by phone
- Admin dashboard: password + Internet Identity login, manage requests, WhatsApp notification
- Backend now has Review type + submitReview, getReviews, getAverageRating, getReviewByRequestId
- No product/sales section exists yet
- No product enquiry feature exists yet

## Requested Changes (Diff)

### Add
- **Products/Sales section on Landing page**: showcase CCTV cameras, DVR/NVR systems, computer products with name, image (icon-based), short description, price range
- **Product Enquiry flow**: "Enquire Now" button on each product opens a form (customer name, phone, product interest pre-filled, message). Submits as a service request with serviceType based on product category
- **Customer Reviews section on Landing page**: show average rating + recent review cards (from getAverageRating + getReviews via public queries)
- **Service ID on success screen**: After submit, show "Service ID: KIT-XXXX" prominently
- **Leave a Review**: In CustomerPortal track view, completed requests show a star-rating + comment form. Uses submitReview backend function.
- **Reviews tab in AdminDashboard**: Shows all reviews with star display, customer name, rating, comment, date

### Modify
- LandingPage: add Products section between hero and services grid; add Reviews section before footer; add "Sales Enquiry" nav button
- CustomerPortal: success screen shows KIT-{requestId} service ID; completed requests show review form
- AdminDashboard: add Reviews tab in navigation

### Remove
- Nothing removed

## Implementation Plan
1. Update useQueries.ts: add useSubmitReview, useReviews, useAverageRating, useReviewByRequestId hooks
2. LandingPage: add Products grid with enquiry modal; add Reviews section with star ratings
3. CustomerPortal: success screen service ID; review form on completed requests
4. AdminDashboard: Reviews tab showing all feedback
5. Validate and build
