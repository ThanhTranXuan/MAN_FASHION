# Database Empty Columns Report

Database: menfashion
Generated: 2026-06-16 23:46:02

No ALTER TABLE or DROP COLUMN was executed.

| table_name | column_name | data_type | total_rows | null_count | empty_string_count | non_empty_count | status | code_reference_found | recommendation | reason |
|---|---|---|---:|---:|---:|---:|---|---|---|---|
| attendances | id | int | 6 | 0 | 0 | 6 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| attendances | user_id | int | 6 | 0 | 0 | 6 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| attendances | check_in_time | datetime | 6 | 0 | 0 | 6 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| attendances | check_out_time | datetime | 6 | 4 | 0 | 2 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| attendances | working_hours | decimal | 6 | 4 | 0 | 2 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| attendances | salary | decimal | 6 | 4 | 0 | 2 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| attendances | month | int | 6 | 6 | 0 | 0 | EMPTY_ALL | yes | REVIEW | Column is empty but code reference exists. |
| attendances | year | int | 6 | 6 | 0 | 0 | EMPTY_ALL | yes | REVIEW | Column is empty but code reference exists. |
| attendances | created_at | datetime | 6 | 6 | 0 | 0 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| attendances | updated_at | datetime | 6 | 6 | 0 | 0 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| blogs | id | int | 18 | 0 | 0 | 18 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| blogs | title | varchar | 18 | 0 | 0 | 18 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| blogs | slug | varchar | 18 | 0 | 0 | 18 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| blogs | content | text | 18 | 0 | 0 | 18 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| blogs | thumbnail | varchar | 18 | 0 | 0 | 18 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| blogs | created_at | datetime | 18 | 0 | 0 | 18 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| blogs | updated_at | datetime | 18 | 0 | 0 | 18 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| blogs | deleted_at | datetime | 18 | 17 | 0 | 1 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| cart_items | id | int | 0 | 0 | 0 | 0 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| cart_items | cart_id | int | 0 | 0 | 0 | 0 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| cart_items | product_id | int | 0 | 0 | 0 | 0 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| cart_items | variant_id | int | 0 | 0 | 0 | 0 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| cart_items | quantity | int | 0 | 0 | 0 | 0 | EMPTY_ALL | yes | REVIEW | Table has no rows; not enough evidence to drop. |
| cart_items | created_at | datetime | 0 | 0 | 0 | 0 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| cart_items | updated_at | datetime | 0 | 0 | 0 | 0 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| carts | id | int | 8 | 0 | 0 | 8 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| carts | user_id | int | 8 | 0 | 0 | 8 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| carts | created_at | datetime | 8 | 0 | 0 | 8 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| carts | updated_at | datetime | 8 | 0 | 0 | 8 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| categories | id | int | 30 | 0 | 0 | 30 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| categories | name | varchar | 30 | 0 | 0 | 30 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| categories | slug | varchar | 30 | 0 | 0 | 30 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| categories | parent_id | int | 30 | 7 | 0 | 23 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| categories | deleted_at | datetime | 30 | 25 | 0 | 5 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| categories | created_at | datetime | 30 | 0 | 0 | 30 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| categories | updated_at | datetime | 30 | 0 | 0 | 30 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| categories | thumbnail_url | varchar | 30 | 0 | 9 | 21 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| chat_conversations | id | int | 8 | 0 | 0 | 8 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| chat_conversations | user_id | int | 8 | 0 | 0 | 8 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| chat_conversations | assigned_employee_id | int | 8 | 8 | 0 | 0 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| chat_conversations | user_name | varchar | 8 | 8 | 0 | 0 | EMPTY_ALL | yes | REVIEW | Column is empty but code reference exists. |
| chat_conversations | assigned_employee_name | varchar | 8 | 8 | 0 | 0 | EMPTY_ALL | yes | REVIEW | Column is empty but code reference exists. |
| chat_conversations | status | varchar | 8 | 0 | 0 | 8 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| chat_conversations | last_message_text | text | 8 | 2 | 0 | 6 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| chat_conversations | last_message_at | datetime | 8 | 2 | 0 | 6 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| chat_conversations | created_at | datetime | 8 | 0 | 0 | 8 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| chat_conversations | updated_at | datetime | 8 | 0 | 0 | 8 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| chat_messages | id | int | 63 | 0 | 0 | 63 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| chat_messages | conversation_id | int | 63 | 0 | 0 | 63 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| chat_messages | sender_id | int | 63 | 0 | 0 | 63 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| chat_messages | sender_type | varchar | 63 | 0 | 0 | 63 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| chat_messages | sender_name | varchar | 63 | 63 | 0 | 0 | EMPTY_ALL | yes | REVIEW | Column is empty but code reference exists. |
| chat_messages | content | text | 63 | 0 | 0 | 63 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| chat_messages | created_at | datetime | 63 | 0 | 0 | 63 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| coupons | id | int | 4 | 0 | 0 | 4 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| coupons | code | varchar | 4 | 0 | 0 | 4 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| coupons | discount_value | double | 4 | 0 | 0 | 4 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| coupons | start_date | datetime | 4 | 0 | 0 | 4 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| coupons | end_date | datetime | 4 | 0 | 0 | 4 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| coupons | usage_limit | int | 4 | 0 | 0 | 4 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| coupons | used_count | int | 4 | 0 | 0 | 4 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| coupons | deleted_at | datetime | 4 | 4 | 0 | 0 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| coupons | created_at | datetime | 4 | 0 | 0 | 4 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| coupons | updated_at | datetime | 4 | 0 | 0 | 4 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| order_items | id | int | 22 | 0 | 0 | 22 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| order_items | order_id | int | 22 | 0 | 0 | 22 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| order_items | product_id | int | 22 | 0 | 0 | 22 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| order_items | variant_id | int | 22 | 0 | 0 | 22 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| order_items | quantity | int | 22 | 0 | 0 | 22 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| order_items | price | double | 22 | 0 | 0 | 22 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| orders | id | int | 22 | 0 | 0 | 22 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| orders | order_code | varchar | 22 | 0 | 0 | 22 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| orders | user_id | int | 22 | 0 | 0 | 22 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| orders | coupon_id | int | 22 | 14 | 0 | 8 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| orders | full_name | varchar | 22 | 0 | 0 | 22 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| orders | email | varchar | 22 | 0 | 0 | 22 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| orders | phone | varchar | 22 | 0 | 0 | 22 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| orders | address | text | 22 | 0 | 0 | 22 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| orders | discount_percent | double | 22 | 0 | 0 | 22 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| orders | discount_value | double | 22 | 0 | 0 | 22 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| orders | subtotal | double | 22 | 0 | 0 | 22 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| orders | final_total | double | 22 | 0 | 0 | 22 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| orders | status | varchar | 22 | 0 | 0 | 22 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| orders | delivered_at | datetime | 22 | 6 | 0 | 16 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| orders | payment_method | varchar | 22 | 0 | 0 | 22 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| orders | checkout_session_id | varchar | 22 | 0 | 0 | 22 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| orders | created_at | datetime | 22 | 0 | 0 | 22 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| orders | updated_at | datetime | 22 | 0 | 0 | 22 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| orders | stock_restored | bit | 22 | 0 | 0 | 22 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| password_reset_tokens | id | int | 2 | 0 | 0 | 2 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| password_reset_tokens | user_id | int | 2 | 0 | 0 | 2 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| password_reset_tokens | token | varchar | 2 | 0 | 0 | 2 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| password_reset_tokens | expiry_date | datetime | 2 | 0 | 0 | 2 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| password_reset_tokens | created_at | datetime | 2 | 2 | 0 | 0 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| password_reset_tokens | updated_at | datetime | 2 | 2 | 0 | 0 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| payments | id | int | 13 | 0 | 0 | 13 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| payments | order_id | int | 13 | 0 | 0 | 13 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| payments | payment_order_code | bigint | 13 | 2 | 0 | 11 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| payments | payment_link | varchar | 13 | 2 | 0 | 11 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| payments | qr_code_url | varchar | 13 | 2 | 0 | 11 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| payments | payment_status | varchar | 13 | 0 | 0 | 13 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| payments | paid_at | datetime | 13 | 6 | 0 | 7 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| payments | amount_vnd | double | 13 | 0 | 0 | 13 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| payments | transaction_id | varchar | 13 | 6 | 0 | 7 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| payments | description | text | 13 | 11 | 0 | 2 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| payments | failure_reason | text | 13 | 7 | 0 | 6 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| payments | created_at | datetime | 13 | 0 | 0 | 13 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| payments | updated_at | datetime | 13 | 0 | 0 | 13 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| payments | payment_method | varchar | 13 | 0 | 0 | 13 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_images | id | int | 133 | 0 | 0 | 133 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_images | product_id | int | 133 | 0 | 0 | 133 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_images | color | varchar | 133 | 32 | 0 | 101 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_images | url | varchar | 133 | 0 | 0 | 133 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_images | is_thumbnail | tinyint | 133 | 0 | 0 | 133 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_images | deleted_at | datetime | 133 | 126 | 0 | 7 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_images | created_at | datetime | 133 | 0 | 0 | 133 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_images | updated_at | datetime | 133 | 0 | 0 | 133 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_reviews | id | bigint | 8 | 0 | 0 | 8 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_reviews | product_id | int | 8 | 0 | 0 | 8 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_reviews | user_id | int | 8 | 0 | 0 | 8 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_reviews | rating | int | 8 | 0 | 0 | 8 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_reviews | title | varchar | 8 | 0 | 0 | 8 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_reviews | comment | text | 8 | 0 | 0 | 8 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_reviews | purchased_size | varchar | 8 | 0 | 0 | 8 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_reviews | purchased_color | varchar | 8 | 0 | 0 | 8 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_reviews | nickname | varchar | 8 | 0 | 0 | 8 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_reviews | gender | varchar | 8 | 0 | 0 | 8 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_reviews | location | varchar | 8 | 0 | 0 | 8 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_reviews | status | varchar | 8 | 0 | 0 | 8 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_reviews | is_verified_purchase | tinyint | 8 | 0 | 0 | 8 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_reviews | admin_reply | text | 8 | 3 | 0 | 5 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_reviews | admin_reply_at | datetime | 8 | 3 | 0 | 5 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_reviews | admin_reply_by | int | 8 | 3 | 0 | 5 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_reviews | deleted_at | datetime | 8 | 3 | 0 | 5 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_reviews | created_at | datetime | 8 | 0 | 0 | 8 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_reviews | updated_at | datetime | 8 | 0 | 0 | 8 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_variants | id | int | 469 | 0 | 0 | 469 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_variants | product_id | int | 469 | 0 | 0 | 469 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_variants | color | varchar | 469 | 0 | 0 | 469 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_variants | size | varchar | 469 | 0 | 0 | 469 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_variants | stock | int | 469 | 0 | 0 | 469 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| product_variants | deleted_at | datetime | 469 | 469 | 0 | 0 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_variants | created_at | datetime | 469 | 0 | 0 | 469 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| product_variants | updated_at | datetime | 469 | 0 | 0 | 469 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| products | id | int | 93 | 0 | 0 | 93 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| products | name | varchar | 93 | 0 | 0 | 93 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| products | slug | varchar | 93 | 0 | 0 | 93 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| products | description | text | 93 | 0 | 1 | 92 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| products | price | double | 93 | 0 | 0 | 93 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| products | category_id | int | 93 | 0 | 0 | 93 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| products | is_active | tinyint | 93 | 0 | 0 | 93 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| products | deleted_at | datetime | 93 | 82 | 0 | 11 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| products | created_at | datetime | 93 | 0 | 0 | 93 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| products | updated_at | datetime | 93 | 0 | 0 | 93 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| return_items | id | int | 4 | 0 | 0 | 4 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| return_items | return_order_id | int | 4 | 0 | 0 | 4 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| return_items | order_item_id | int | 4 | 0 | 0 | 4 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| return_items | quantity | int | 4 | 0 | 0 | 4 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| return_items | unit_price | double | 4 | 0 | 0 | 4 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| return_items | status | varchar | 4 | 0 | 0 | 4 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| return_items | created_at | datetime | 4 | 0 | 0 | 4 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| return_items | updated_at | datetime | 4 | 0 | 0 | 4 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| return_orders | id | int | 4 | 0 | 0 | 4 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| return_orders | return_code | varchar | 4 | 0 | 0 | 4 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| return_orders | order_id | int | 4 | 0 | 0 | 4 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| return_orders | user_id | int | 4 | 0 | 0 | 4 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| return_orders | reason | varchar | 4 | 0 | 0 | 4 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| return_orders | note | text | 4 | 0 | 0 | 4 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| return_orders | status | varchar | 4 | 0 | 0 | 4 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| return_orders | refund_amount | double | 4 | 0 | 0 | 4 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| return_orders | created_at | datetime | 4 | 0 | 0 | 4 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| return_orders | updated_at | datetime | 4 | 0 | 0 | 4 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| return_orders | processed_at | datetime | 4 | 2 | 0 | 2 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| return_orders | reject_reason | varchar | 4 | 2 | 0 | 2 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| return_orders | processed_by | int | 4 | 2 | 0 | 2 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| roles | id | int | 3 | 0 | 0 | 3 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| roles | name | varchar | 3 | 0 | 0 | 3 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| roles | created_at | datetime | 3 | 2 | 0 | 1 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| roles | updated_at | datetime | 3 | 2 | 0 | 1 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| users | id | int | 11 | 0 | 0 | 11 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| users | role_id | int | 11 | 0 | 0 | 11 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| users | email | varchar | 11 | 0 | 0 | 11 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| users | phone | varchar | 11 | 7 | 1 | 3 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| users | password | varchar | 11 | 0 | 0 | 11 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| users | social_provider | varchar | 11 | 8 | 0 | 3 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| users | social_id | varchar | 11 | 8 | 0 | 3 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| users | full_name | varchar | 11 | 0 | 0 | 11 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| users | avatar_url | varchar | 11 | 5 | 0 | 6 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| users | address | text | 11 | 7 | 1 | 3 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| users | created_at | datetime | 11 | 0 | 0 | 11 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| users | updated_at | datetime | 11 | 0 | 0 | 11 | SYSTEM_REQUIRED | yes | KEEP | System/security/audit/FK/payment column or code-critical convention. |
| users | hourly_rate | double | 11 | 8 | 0 | 3 | HAS_DATA | yes | KEEP | Column has meaningful data. |
| users | is_active | tinyint | 11 | 0 | 0 | 11 | HAS_DATA | yes | KEEP | Column has meaningful data. |
