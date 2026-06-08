# Trendify Chat Notification Review Update Report

## 1. Chatbot AI guest

- Da doc va kiem tra: `BotController`, `DifyBotService`, `SecurityConfig`, `ChatWidget`, `ChatContext`, `ChatService`.
- Endpoint AI bot dang public: `POST /api/v1/bot/chat/{conversationId}` thong qua `SecurityConfig` (`/api/v1/bot/**`).
- Frontend da cho guest mo widget va gui tin trong tab `Tro ly`; tab `Cua hang` van chan guest va hien thong bao dang nhap.
- Chat admin/employee van can login vi luong nay dung `/api/chat/**` va WebSocket `/app/chat/send` voi JWT/principal.
- Guest hoi don hang, hoan tra, tai khoan/ho so ca nhan se duoc bot yeu cau dang nhap. User da login van gui JWT neu co va bot dung context user nhu cu.

## 2. User profile dot

- Event trigger dot: `ORDER_STATUS_UPDATED` gui den `/topic/users/{userId}/notifications`.
- Dot nam tren avatar/profile menu trong `NavbarLinks`, dong thoi tab lich su mua hang trong profile co dot neu chua xem.
- Da bo icon thong bao rieng tren header user; chi con dot o avatar/profile dung yeu cau.
- Dot bien mat khi user click profile hoac vao tab lich su mua hang; trang thai co luu theo key `profileOrderUpdate:{userId}` de tach user.

## 3. Admin sidebar realtime dot

- Cac event da xu ly:
  - `NEW_ORDER`
  - `NEW_RETURN`
  - `NEW_REVIEW`
  - `NEW_SUPPORT_MESSAGE`
  - `ORDER_STATUS_UPDATED` cho admin order dot
- Mapping sidebar:
  - `NEW_ORDER`/`ORDER_STATUS_UPDATED` -> Quan Ly Don Hang
  - `NEW_RETURN` -> Quan Ly Hoan Tra
  - `NEW_REVIEW` -> Quan Ly Danh Gia
  - `NEW_SUPPORT_MESSAGE` -> Ho Tro Chat
- Dot clear khi admin click menu tuong ung; trang review admin cung clear khi mo truc tiep.
- Backend co them kenh chung `/topic/admin/notifications`, dong thoi giu cac topic cu de khong pha logic hien co.

## 4. Order history review

- DB da kiem tra trong `Tài Liệu dự án/Database/Final .sql` va co doi chieu `Database.mwb`.
- `product_reviews` hien co: `id`, `product_id`, `user_id`, `rating`, `title`, `comment`, `purchased_size`, `purchased_color`, `nickname`, `gender`, `location`, `created_at`, `updated_at`; khong co `order_id` hoac `order_item_id`.
- `order_items` co `id`, `order_id`, `product_id`, `variant_id`, `quantity`, `price`.
- Khong them cot DB. Trang thai reviewed duoc suy ra tu `product_reviews` theo `user_id + product_id`.
- Rui ro con lai: neu user mua lai cung mot san pham nhieu lan, schema hien tai khong phan biet tung `order_item_id`. Nang cap tot hon la them `order_item_id` nullable va unique theo user/order item.
- API lich su don hang `GET /api/orders/me` tra them `reviewed` va `reviewId` trong tung `OrderItemResponse`.
- Backend review create da chan user chua mua/chua delivered-completed va chan review trung theo `user_id + product_id`.
- FE lich su mua hang hien:
  - `Danh gia san pham` neu don `COMPLETED/DELIVERED` va item chua reviewed.
  - `Da danh gia` neu item da reviewed.
  - Nut review di toi route san co `/user/product/{productId}/reviews/new` kem query `orderCode`, `orderItemId`, `size`, `color`.

## 5. Test case da chay

- `npm run build` trong `react_fe`: pass.
- `mvn -q -DskipTests compile` trong `springboot_be`: pass sau khi cho phep Maven truy cap network de tai parent/dependency.
- Maven wrapper `mvnw.cmd` cua repo bi loi truoc khi vao Maven: `Cannot start maven from wrapper`; da dung Maven he thong de verify compile.

## 6. Diem co the nang cap

- Notification center day du thay vi dot boolean.
- Unread count theo tung muc thay vi boolean.
- Luu notification vao DB de khong phu thuoc localStorage.
- Them `order_item_id` nullable vao `product_reviews` de review chuan theo tung lan mua/order item.
