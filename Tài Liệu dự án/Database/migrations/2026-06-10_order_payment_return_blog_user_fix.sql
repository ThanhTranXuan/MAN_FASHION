-- Idempotent additive migration for existing Trendify data (MySQL 8).
DELIMITER $$

DROP PROCEDURE IF EXISTS add_column_if_missing$$
CREATE PROCEDURE add_column_if_missing(
    IN table_name_value VARCHAR(64),
    IN column_name_value VARCHAR(64),
    IN column_definition_value VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = table_name_value
          AND column_name = column_name_value
    ) THEN
        SET @ddl = CONCAT(
            'ALTER TABLE `', table_name_value,
            '` ADD COLUMN `', column_name_value, '` ',
            column_definition_value
        );
        PREPARE statement_to_run FROM @ddl;
        EXECUTE statement_to_run;
        DEALLOCATE PREPARE statement_to_run;
    END IF;
END$$

CALL add_column_if_missing('users', 'is_active', 'BOOLEAN NOT NULL DEFAULT TRUE')$$
CALL add_column_if_missing('orders', 'stock_restored', 'BOOLEAN NOT NULL DEFAULT FALSE')$$
CALL add_column_if_missing('payments', 'payment_method', 'VARCHAR(30) NULL')$$
CALL add_column_if_missing('return_orders', 'reject_reason', 'VARCHAR(500) NULL')$$
CALL add_column_if_missing('return_orders', 'processed_by', 'INT NULL')$$
CALL add_column_if_missing('return_orders', 'processed_at', 'DATETIME NULL')$$
CALL add_column_if_missing('blogs', 'deleted_at', 'DATETIME NULL')$$

DROP PROCEDURE add_column_if_missing$$
DELIMITER ;

-- Existing databases may already have is_active with 0/NULL values even
-- though account deactivation was not previously implemented.
UPDATE users
SET is_active = TRUE
WHERE is_active IS NULL OR is_active = FALSE;

ALTER TABLE users
    MODIFY COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE payments p
JOIN orders o ON o.id = p.order_id
SET p.payment_method = o.payment_method
WHERE p.payment_method IS NULL;

SET @processed_by_fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'return_orders'
      AND constraint_name = 'fk_return_orders_processed_by'
);
SET @processed_by_fk_sql = IF(
    @processed_by_fk_exists = 0,
    'ALTER TABLE return_orders ADD CONSTRAINT fk_return_orders_processed_by FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL',
    'SELECT 1'
);
PREPARE statement_to_run FROM @processed_by_fk_sql;
EXECUTE statement_to_run;
DEALLOCATE PREPARE statement_to_run;

SET @order_expiration_index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'orders'
      AND index_name = 'idx_orders_payment_expiration'
);
SET @order_expiration_index_sql = IF(
    @order_expiration_index_exists = 0,
    'CREATE INDEX idx_orders_payment_expiration ON orders (status, payment_method, created_at)',
    'SELECT 1'
);
PREPARE statement_to_run FROM @order_expiration_index_sql;
EXECUTE statement_to_run;
DEALLOCATE PREPARE statement_to_run;

SET @blog_deleted_index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'blogs'
      AND index_name = 'idx_blogs_deleted_at'
);
SET @blog_deleted_index_sql = IF(
    @blog_deleted_index_exists = 0,
    'CREATE INDEX idx_blogs_deleted_at ON blogs (deleted_at)',
    'SELECT 1'
);
PREPARE statement_to_run FROM @blog_deleted_index_sql;
EXECUTE statement_to_run;
DEALLOCATE PREPARE statement_to_run;
