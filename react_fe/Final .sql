CREATE TABLE "roles" (
  "id" int PRIMARY KEY,
  "name" varchar UNIQUE,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "users" (
  "id" int PRIMARY KEY,
  "role_id" int,
  "email" varchar UNIQUE,
  "phone" varchar,
  "password" varchar,
  "social_provider" varchar,
  "social_id" varchar,
  "full_name" varchar,
  "avatar_url" varchar,
  "address" text,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "password_reset_tokens" (
  "id" int PRIMARY KEY,
  "user_id" int,
  "token" varchar UNIQUE,
  "expiry_date" datetime,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "categories" (
  "id" int PRIMARY KEY,
  "name" varchar,
  "slug" varchar UNIQUE,
  "parent_id" int,
  "deleted_at" datetime,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "products" (
  "id" int PRIMARY KEY,
  "name" varchar,
  "slug" varchar UNIQUE,
  "description" text,
  "price" double,
  "category_id" int,
  "is_active" boolean,
  "deleted_at" datetime,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "product_variants" (
  "id" int PRIMARY KEY,
  "product_id" int,
  "color" varchar,
  "size" varchar,
  "stock" int,
  "deleted_at" datetime,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "product_images" (
  "id" int PRIMARY KEY,
  "product_id" int,
  "color" varchar,
  "url" varchar,
  "is_thumbnail" boolean,
  "deleted_at" datetime,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "carts" (
  "id" int PRIMARY KEY,
  "user_id" int UNIQUE,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "cart_items" (
  "id" int PRIMARY KEY,
  "cart_id" int,
  "product_id" int,
  "variant_id" int,
  "quantity" int,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "coupons" (
  "id" int PRIMARY KEY,
  "code" varchar UNIQUE,
  "discount_value" double,
  "start_date" datetime,
  "end_date" datetime,
  "usage_limit" int,
  "used_count" int,
  "deleted_at" datetime,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "orders" (
  "id" int PRIMARY KEY,
  "order_code" varchar UNIQUE,
  "user_id" int,
  "coupon_id" int,
  "full_name" varchar,
  "email" varchar,
  "phone" varchar,
  "address" text,
  "discount_percent" double,
  "discount_value" double,
  "subtotal" double,
  "final_total" double,
  "status" varchar,
  "delivered_at" datetime,
  "payment_method" varchar,
  "checkout_session_id" varchar,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "order_items" (
  "id" int PRIMARY KEY,
  "order_id" int,
  "product_id" int,
  "variant_id" int,
  "quantity" int,
  "price" double
);

CREATE TABLE "payments" (
  "id" int PRIMARY KEY,
  "order_id" int,
  "payment_order_code" varchar,
  "payment_link" varchar,
  "qr_code_url" varchar,
  "payment_status" varchar,
  "paid_at" datetime,
  "amount_vnd" double,
  "transaction_id" varchar,
  "description" text,
  "failure_reason" text,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "return_orders" (
  "id" int PRIMARY KEY,
  "return_code" varchar UNIQUE,
  "order_id" int,
  "user_id" int,
  "reason" varchar,
  "note" text,
  "status" varchar,
  "refund_amount" double,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "return_items" (
  "id" int PRIMARY KEY,
  "return_order_id" int,
  "order_item_id" int,
  "quantity" int,
  "unit_price" double,
  "status" varchar,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "blogs" (
  "id" int PRIMARY KEY,
  "title" varchar,
  "slug" varchar UNIQUE,
  "content" text,
  "thumbnail" varchar,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "chat_conversations" (
  "id" int PRIMARY KEY,
  "user_id" int,
  "assigned_employee_id" int,
  "user_name" varchar,
  "assigned_employee_name" varchar,
  "status" varchar,
  "last_message_text" text,
  "last_message_at" datetime,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "chat_messages" (
  "id" int PRIMARY KEY,
  "conversation_id" int,
  "sender_id" int,
  "sender_type" varchar,
  "sender_name" varchar,
  "content" text,
  "created_at" datetime
);

CREATE INDEX ON "users" ("role_id");

CREATE INDEX ON "users" ("email");

CREATE INDEX ON "products" ("category_id");

CREATE INDEX ON "product_variants" ("product_id");

CREATE UNIQUE INDEX ON "product_variants" ("product_id", "color", "size");

CREATE INDEX ON "product_images" ("product_id");

CREATE INDEX ON "cart_items" ("cart_id");

CREATE UNIQUE INDEX ON "cart_items" ("cart_id", "product_id", "variant_id");

CREATE INDEX ON "orders" ("user_id");

CREATE INDEX ON "order_items" ("order_id");

CREATE UNIQUE INDEX ON "order_items" ("order_id", "product_id", "variant_id");

CREATE INDEX ON "payments" ("order_id");

ALTER TABLE "users" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "password_reset_tokens" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "categories" ADD FOREIGN KEY ("parent_id") REFERENCES "categories" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "products" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "product_variants" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "product_images" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "carts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "cart_items" ADD FOREIGN KEY ("cart_id") REFERENCES "carts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "cart_items" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "cart_items" ADD FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "orders" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "orders" ADD FOREIGN KEY ("coupon_id") REFERENCES "coupons" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_items" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_items" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_items" ADD FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payments" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "return_orders" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "return_orders" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "return_items" ADD FOREIGN KEY ("return_order_id") REFERENCES "return_orders" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "return_items" ADD FOREIGN KEY ("order_item_id") REFERENCES "order_items" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "chat_conversations" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "chat_conversations" ADD FOREIGN KEY ("assigned_employee_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "chat_messages" ADD FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "chat_messages" ADD FOREIGN KEY ("sender_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
