# Trendify Home Chatbot Stats DB Cleanup Report

Generated: 2026-06-16

## 1. Homepage outfit APIs

Added public APIs:

- `GET /api/home/outfits/daily`
- `GET /api/home/outfits/relax`
- `GET /api/home/outfits/after-work`

Backend files:

- `springboot_be/src/main/java/com/manfashion/springboot_be/controller/Home/HomeController.java`
- `springboot_be/src/main/java/com/manfashion/springboot_be/service/Home/HomeOutfitService.java`
- `springboot_be/src/main/java/com/manfashion/springboot_be/DTO/Home/HomeOutfitSectionResponse.java`
- `springboot_be/src/main/java/com/manfashion/springboot_be/DTO/Home/HomeProductResponse.java`

Logic:

- Daily uses shirt/polo/long pants/tailored pants/linen/sneaker/light neutral keywords and excludes underwear-like matches.
- Relax uses t-shirt/shorts/relaxed/cotton/airism/neutral keywords and excludes underwear/formal blazer-style matches.
- After-work uses jacket/shirt/dark pants/accessory/bag/hat/sneaker/dark neutral keywords and excludes underwear-like matches.
- Products come from active, in-stock DB candidates with real images and prices. Rating summaries are read from approved product reviews.
- If DB data is sparse, the service returns only scored category/name/description/variant matches, not random all-products output.

Frontend files:

- `react_fe/src/services/HomeService.js`
- `react_fe/src/constants/ApiUrl.js`
- `react_fe/src/views/user/home/components/FashionShowcaseSection.jsx`

Frontend behavior:

- The three lookbook sections call the three APIs in parallel.
- The homepage does not render product previews inside these lookbook blocks.
- Clicking a lookbook image/text block uses the API-provided `productQuery` as `/user/product?q=...`, so the all-products page loads filtered matching products.

## 2. Removed salary UI from admin/dashboard

Frontend salary/hourly UI was removed from:

- `react_fe/src/views/admin/employees/components/Columns.js`
- `react_fe/src/views/admin/employees/components/Form.js`
- `react_fe/src/views/admin/employees/components/Detail.js`
- `react_fe/src/views/user/profile/components/ProfileTab.js`

Result:

- No `salary`, `wage`, `hourly`, `payroll`, `hourlyRate`, `lương`, or `tiền công` references remain in `react_fe`.
- Backend salary/attendance fields remain because they are existing entity/DTO/service fields and removing them would risk DB/API breakage.

## 3. Chatbot

Backend files:

- `springboot_be/src/main/java/com/manfashion/springboot_be/service/Chat/GeminiChatService.java`
- `springboot_be/src/main/java/com/manfashion/springboot_be/controller/Chat/BotController.java`
- `springboot_be/src/main/java/com/manfashion/springboot_be/DTO/Chat/BotChatResponse.java`
- `springboot_be/src/main/java/com/manfashion/springboot_be/DTO/Chat/BotCategorySuggestion.java`
- `springboot_be/src/main/java/com/manfashion/springboot_be/DTO/Chat/BotOrderSummary.java`
- `springboot_be/src/main/java/com/manfashion/springboot_be/DTO/Chat/BotOutfitRecommendation.java`

Supported structured response types:

- `PRODUCT_LIST`
- `CATEGORY_LIST`
- `OUTFIT_RECOMMENDATION`
- `ORDER_LIST`
- `RETURN_ORDER_LIST`
- `STATS_SUMMARY`
- `OUT_OF_SCOPE`

Intent/data rules:

- Category overview questions such as broad "ao/quan/phu kien co nhung loai nao" return child categories from DB.
- Specific product questions still rank active in-stock DB products by category/color/keywords.
- Outfit requests build a set from DB products: top, bottom, optional shoes, optional accessory.
- Recent orders use the current authenticated user ID and do not ask for an order code.
- Return/hoan tra requests use return orders for the current authenticated user.
- Admin/employee stats still use `AdminChatbotStatsService`; regular users are blocked.
- Out-of-scope questions return the shopping-assistant boundary message and do not query products/stats.
- Gemini remains only an optional formatter for product answers after DB products are selected.

Frontend files:

- `react_fe/src/components/chat/ChatWidget.js`

Frontend behavior:

- Product cards render compact image/name/category/price/detail button.
- Category cards render category image/name/detail button.
- Outfit cards render each role in the set.
- Order cards render order/return code, localized status label, total/refund and created date.
- Chat auto-scroll behavior remains in place.

## 4. MySQL empty columns

Database connected:

- `jdbc:mysql://localhost:3306/menfashion`
- User: `root`

Checked:

- Tables: 20
- Columns: 193
- DROP COLUMN executed: NO

Report files:

- `Database_Empty_Columns_Report.md`
- `suggested_drop_columns_review_only.sql`

Review columns:

- `attendances.month`
- `attendances.year`
- `cart_items.quantity`
- `chat_conversations.user_name`
- `chat_conversations.assigned_employee_name`
- `chat_messages.sender_name`

All review columns had code references or insufficient table data, so no concrete drop statement was recommended. `suggested_drop_columns_review_only.sql` contains only a review-only header.

## 5. Promotional blog banner

File:

- `react_fe/src/views/user/home/components/PromotionalBlogBanner.jsx`

Change:

- The banner now uses the linked blog's real `title`.
- Description uses `excerpt`, `summary`, or stripped `content` from the blog data, with a Trendify-only fallback.
- CTA still links to `/user/blog/detail/{blog.slug}`.

## 6. Build/test

Backend:

- Command: `mvn test`
- Result: PASS
- Tests: 17 run, 0 failures, 0 errors

Frontend:

- Command: `npm run build`
- Result: PASS with warnings
- Remaining warnings are unrelated existing items:
  - `src/views/user/product/WriteReview.jsx`: `user` assigned but never used
  - CRA bundle size and Browserslist stale data warnings

## 7. Manual verification checklist

Not run in browser in this pass. Build/test and code-level verification completed for:

- Homepage sections call the three new APIs.
- Homepage lookbook links use section-specific query strings.
- Promotional banner links to the real blog detail and displays real blog title/content.
- React frontend has no salary/hourly/payroll UI references.
- Chatbot response supports product/category/outfit/order/return/stats/out-of-scope structures.
- MySQL report was generated from live DB data without running any schema mutation.
