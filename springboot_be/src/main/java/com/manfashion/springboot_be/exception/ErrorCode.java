package com.manfashion.springboot_be.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    // ========================
    // 0000-0999: SYSTEM ERRORS
    // ========================
    SYSTEM_ERROR(0, "error.system.general", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_REQUEST(1, "error.system.invalid-request", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(2, "error.system.unauthorized", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(3, "error.system.access-denied", HttpStatus.FORBIDDEN),
    INTERNAL_SERVER_ERROR(4, "error.system.internal-server", HttpStatus.INTERNAL_SERVER_ERROR),

    // ========================
    // 1000-1999: VALIDATION ERRORS
    // ========================
    INVALID_ENUM_VALUE(1000, "error.validation.invalid-enum", HttpStatus.BAD_REQUEST),
    INVALID_FILE_TYPE(1001, "error.validation.invalid-file-type", HttpStatus.BAD_REQUEST),
    INVALID_FILE_NAME(1002, "error.validation.invalid-file-name", HttpStatus.BAD_REQUEST),
    FILE_NOT_READABLE(1003, "error.validation.file-not-readable", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(1004, "error.validation.email.invalid", HttpStatus.BAD_REQUEST),
    PHONE_INVALID(1005, "error.validation.phone.invalid", HttpStatus.BAD_REQUEST),
    PASSWORD_TOO_SHORT(1006, "error.validation.password.too-short", HttpStatus.BAD_REQUEST),
    RECIPIENT_NAME_TOO_LONG(1007, "error.validation.recipient-name.too-long", HttpStatus.BAD_REQUEST),
    ADDRESS_TOO_LONG(1008, "error.validation.address.too-long", HttpStatus.BAD_REQUEST),
    CATEGORY_TOO_LONG(1009, "error.validation.category.name.too-long", HttpStatus.BAD_REQUEST),
    CUSTOMER_NOTE_TOO_LONG(1010, "error.validation.customer-note.too-long", HttpStatus.BAD_REQUEST),
    VOUCHER_CODE_LENGTH_INVALID(1011, "error.validation.voucher.code.length", HttpStatus.BAD_REQUEST),
    VOUCHER_CODE_FORMAT_INVALID(1012, "error.validation.voucher.code.format", HttpStatus.BAD_REQUEST),
    VOUCHER_NAME_LENGTH_EXCEEDED(1013, "error.validation.voucher.name.length", HttpStatus.BAD_REQUEST),
    CONTENT_SIZE_EXCEEDED(1014, "error.validation.review.content.size", HttpStatus.BAD_REQUEST),
    IMAGE_URL_SIZE_EXCEEDED(1015, "error.validation.image-url.size", HttpStatus.BAD_REQUEST),
    DIMENSION_TOO_LONG(1016, "error.validation.dimension.too-long", HttpStatus.BAD_REQUEST),
    BARCODE_TOO_LONG(1017, "error.validation.barcode.too-long", HttpStatus.BAD_REQUEST),

    // ========================
    // 2000-2999: AUTHENTICATION ERRORS
    // ========================
    AUTHENTICATION_REQUIRED(2000, "error.auth.required", HttpStatus.UNAUTHORIZED),
    AUTHENTICATION_FAILED(2001, "error.auth.failed", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(2002, "error.auth.token-expired", HttpStatus.UNAUTHORIZED),
    INVALID_USERNAME(2003, "error.auth.username.invalid", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(2004, "error.auth.password.invalid", HttpStatus.BAD_REQUEST),

    // ========================
    // 3000-3999: USER ERRORS
    // ========================
    USER_NOT_FOUND(3000, "error.user.not-found", HttpStatus.NOT_FOUND),
    ROLE_NOT_FOUND(3001, "error.user.role.not-found", HttpStatus.INTERNAL_SERVER_ERROR),
    EMAIL_ALREADY_EXISTS(3002, "error.user.email.exists", HttpStatus.CONFLICT),
    PHONE_ALREADY_EXISTS(3003, "error.user.phone.exists", HttpStatus.CONFLICT),
    USER_VIP_NOT_FOUND(3004, "error.user.vip.not-found", HttpStatus.NOT_FOUND),
    USER_VIP_POINTS_NOT_FOUND(3005, "error.user.vip.points.not-enough", HttpStatus.BAD_REQUEST),
    USER_NOT_ACCESS(3006, "error.user.access.denied", HttpStatus.FORBIDDEN),
    EMPLOYEE_DELETE_NOT_ALLOWED(3007, "error.employee.delete.not-allowed", HttpStatus.FORBIDDEN),
    EMPLOYEE_DELETE_HAS_RELATED_DATA(3008, "error.employee.delete.related-data", HttpStatus.CONFLICT),
    USER_INACTIVE(3009, "Tài khoản đã ngừng hoạt động.", HttpStatus.FORBIDDEN),
    RETURN_REJECT_REASON_REQUIRED(3010, "Vui lòng nhập lý do từ chối hoàn trả.", HttpStatus.BAD_REQUEST),
    GOOGLE_ACCOUNT_PASSWORD_MANAGED(3011, "Tài khoản này đang đăng nhập bằng Google. Vui lòng sử dụng Google để đăng nhập hoặc quản lý mật khẩu trong tài khoản Google.", HttpStatus.BAD_REQUEST),

    // ========================
    // 4000-4999: PRODUCT ERRORS
    // ========================
    PRODUCT_NOT_FOUND(4000, "error.product.not-found", HttpStatus.NOT_FOUND),
    PRODUCT_OUT_OF_STOCK(
            4001,
            "Sản phẩm vừa được khách hàng khác mua hoặc giữ chỗ hết. Vui lòng kiểm tra lại giỏ hàng và chọn sản phẩm khác.",
            HttpStatus.CONFLICT
    ),
    PRODUCT_NAME_ALREADY_EXISTS(4002, "error.product.name.exists", HttpStatus.CONFLICT),
    PRODUCT_SLUG_ALREADY_EXISTS(4003, "error.product.slug.exists", HttpStatus.CONFLICT),
    PRODUCT_SKU_ALREADY_EXISTS(4004, "error.product.sku.exists", HttpStatus.CONFLICT),
    PRODUCT_PRICE_INVALID(4005, "error.product.price.invalid", HttpStatus.BAD_REQUEST),
    PRODUCT_SALE_PRICE_INVALID(4006, "error.product.sale-price.invalid", HttpStatus.BAD_REQUEST),
    PRODUCT_SALE_PRICE_GREATER_THAN_PRICE(4007, "error.product.sale-price.greater-than-price", HttpStatus.BAD_REQUEST),
    PRODUCT_STOCK_INVALID(4008, "error.product.stock.invalid", HttpStatus.BAD_REQUEST),
    PRODUCT_IS_ACTIVE(4009, "error.product.inactive", HttpStatus.BAD_REQUEST),
    VARIANT_ALREADY_EXISTS(4010, "error.product.variant.exists", HttpStatus.CONFLICT),
    VARIANT_NOT_FOUND(4011, "error.product.variant.not-found", HttpStatus.NOT_FOUND),
    VARIANT_NOT_BELONG_TO_PRODUCT(4012, "error.product.variant.not-belong", HttpStatus.BAD_REQUEST),

    // ========================
    // 5000-5999: CATEGORY ERRORS
    // ========================
    CATEGORY_NOT_FOUND(5000, "error.category.not-found", HttpStatus.NOT_FOUND),
    CATEGORY_NAME_ALREADY_EXISTS(5001, "error.category.name.exists", HttpStatus.CONFLICT),
    CATEGORY_SLUG_ALREADY_EXISTS(5002, "error.category.slug.exists", HttpStatus.CONFLICT),

    // ========================
    // 6000-6999: FILE ERRORS
    // ========================
    FILE_EMPTY(6000, "error.file.empty", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE(6001, "error.file.too-large", HttpStatus.BAD_REQUEST),
    FILE_UPLOAD_FAILED(6002, "error.file.upload-failed", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_NOT_FOUND(6003, "error.file.not-found", HttpStatus.NOT_FOUND),
    FILE_DELETE_FAILED(6004, "error.file.delete-failed", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_NOT_IMAGE(6005, "error.file.not-image", HttpStatus.BAD_REQUEST),
    TOO_MANY_IMAGES(6006, "error.file.too-many-images", HttpStatus.BAD_REQUEST),

    // ========================
    // 7000-7999: ORDER ERRORS
    // ========================
    ORDER_NOT_FOUND(7000, "error.order.not-found", HttpStatus.NOT_FOUND),
    ORDER_ITEMS_EMPTY(7001, "error.order.items.empty", HttpStatus.BAD_REQUEST),
    ORDER_STATUS_FINAL(7002, "error.order.status.final", HttpStatus.BAD_REQUEST),
    INVALID_ORDER_STATUS_TRANSITION(7003, "error.order.status.invalid-transition", HttpStatus.BAD_REQUEST),
    ORDER_ALREADY_USED_VOUCHER(7004, "error.order.voucher.already-used", HttpStatus.BAD_REQUEST),
    ORDER_AMOUNT_TOO_LOW(7005, "error.order.amount.too-low", HttpStatus.BAD_REQUEST),
    ORDER_PAYMENT_REQUIRED(7006, "error.order.payment.required", HttpStatus.BAD_REQUEST),
    ORDER_USER_NOT_BELONG(7007, "error.order.user.not-belong", HttpStatus.BAD_REQUEST),
    POINT_REDEEM_LOG_NOT_FOUND(7008, "error.order.point-redeem.not-found", HttpStatus.NOT_FOUND),
    POINT_ALREADY_REFUNDED(7009, "error.order.point.already-refunded", HttpStatus.BAD_REQUEST),
    ORDER_PAID_CANNOT_CANCEL_DIRECTLY(
            7010,
            "Đơn hàng đã thanh toán qua PayOS. Không thể hủy trực tiếp, vui lòng xử lý hoàn tiền/hoàn trả.",
            HttpStatus.CONFLICT
    ),
    ORDER_CANNOT_CANCEL(
            7011,
            "Đơn hàng ở trạng thái hiện tại không thể hủy.",
            HttpStatus.BAD_REQUEST
    ),

    // ========================
    // 8000-8999: CART ERRORS
    // ========================
    CART_NOT_FOUND(8000, "error.cart.not-found", HttpStatus.NOT_FOUND),
    CART_QUANTITY_INVALID(8001, "error.cart.quantity.invalid", HttpStatus.BAD_REQUEST),
    CART_EXCEED_AVAILABLE_STOCK(8002, "error.cart.quantity.exceed-stock", HttpStatus.BAD_REQUEST),

    // ========================
    // 9000-9099: VOUCHER ERRORS
    // ========================
    VOUCHER_NOT_FOUND(9000, "error.voucher.not-found", HttpStatus.NOT_FOUND),
    VOUCHER_INVALID(9001, "error.voucher.invalid", HttpStatus.BAD_REQUEST),
    VOUCHER_CODE_ALREADY_EXISTS(9002, "error.voucher.code.exists", HttpStatus.CONFLICT),
    VOUCHER_QUANTITY_INVALID(9003, "error.voucher.quantity.invalid", HttpStatus.BAD_REQUEST),
    VOUCHER_USAGE_LIMIT_EXCEEDED(9004, "error.voucher.usage-limit.exceeded", HttpStatus.BAD_REQUEST),
    VOUCHER_TOTAL_QUANTITY_INVALID(9005, "error.voucher.total-quantity.invalid", HttpStatus.BAD_REQUEST),
    VOUCHER_USAGE_LIMIT_INVALID(9006, "error.voucher.usage-limit.invalid", HttpStatus.BAD_REQUEST),
    END_TIME_BEFORE_START_TIME(9007, "error.voucher.time.invalid", HttpStatus.BAD_REQUEST),
    DISCOUNT_VALUE_INVALID(9008, "error.voucher.discount-value.invalid", HttpStatus.BAD_REQUEST),
    DISCOUNT_PERCENTAGE_INVALID(9009, "error.voucher.discount-percentage.invalid", HttpStatus.BAD_REQUEST),

    // ========================
    // 9100-9199: ADDRESS ERRORS
    // ========================
    ADDRESS_NOT_FOUND(9100, "error.address.not-found", HttpStatus.NOT_FOUND),

    // ========================
    // 9200-9299: BANNER ERRORS
    // ========================
    BANNER_NOT_FOUND(9200, "error.banner.not-found", HttpStatus.NOT_FOUND),
    BANNER_DISPLAY_ORDER_INVALID(9201, "error.banner.display-order.invalid", HttpStatus.BAD_REQUEST),
    BANNER_TIME_INVALID(9202, "error.banner.time.invalid", HttpStatus.BAD_REQUEST),

    // ========================
    // 9300-9399: WISHLIST ERRORS
    // ========================
    WISHLIST_ITEM_NOT_FOUND(9300, "error.wishlist.not-found", HttpStatus.NOT_FOUND),
    WISHLIST_ITEM_ALREADY_EXISTS(9301, "error.wishlist.item.exists", HttpStatus.CONFLICT),

    // ========================
    // 9400-9499: REVIEW ERRORS
    // ========================
    REVIEW_NOT_FOUND(9400, "error.review.not-found", HttpStatus.NOT_FOUND),
    RATING_INVALID(9401, "error.review.rating.invalid", HttpStatus.BAD_REQUEST),
    PRODUCT_REVIEW_ALREADY_EXISTS(9402, "error.review.already-exists", HttpStatus.CONFLICT),
    PRODUCT_NOT_DELIVERED(9403, "error.review.product.not-delivered", HttpStatus.BAD_REQUEST),
    PRODUCT_NOT_IN_ORDER(9404, "error.review.product.not-in-order", HttpStatus.BAD_REQUEST),

    // ========================
    // 9500-9599: BLOG ERRORS
    // ========================
    BLOG_NOT_FOUND(9500, "error.blog.not-found", HttpStatus.NOT_FOUND),
    BLOG_SLUG_ALREADY_EXISTS(9501, "error.blog.slug.exists", HttpStatus.CONFLICT),

    // ========================
    // 9600-9699: OPTION ERRORS
    // ========================
    OPTION_NOT_FOUND(9600, "error.option.not-found", HttpStatus.NOT_FOUND),
    OPTION_NAME_ALREADY_EXISTS(9601, "error.option.name.exists", HttpStatus.CONFLICT),
    OPTION_VALUE_NOT_BELONG_TO_PRODUCT(9602, "error.option.value.not-belong", HttpStatus.BAD_REQUEST),
    OPTION_VALUE_REQUIRED(9603, "error.option.value.required", HttpStatus.BAD_REQUEST),
    DUPLICATE_OPTION_TYPE(9604, "error.option.type.duplicate", HttpStatus.BAD_REQUEST),

    // ========================
    // 9700-9799: NOTIFICATION ERRORS
    // ========================
    NOTIFICATION_NOT_FOUND(9700, "error.notification.not-found", HttpStatus.NOT_FOUND),

    // ========================
    // 9800-9899: REQUIRED FIELD ERRORS
    // ========================
    FIELD_REQUIRED(9800, "error.field.required", HttpStatus.BAD_REQUEST),
    FIELD_INVALID(9801, "error.field.invalid", HttpStatus.BAD_REQUEST),
    FIELD_NULL(9802, "error.field.null", HttpStatus.BAD_REQUEST),

    // Common required fields
    EMAIL_REQUIRED(9803, "error.field.email.required", HttpStatus.BAD_REQUEST),
    PHONE_REQUIRED(9804, "error.field.phone.required", HttpStatus.BAD_REQUEST),
    PASSWORD_REQUIRED(9805, "error.field.password.required", HttpStatus.BAD_REQUEST),
    FULLNAME_REQUIRED(9806, "error.field.fullname.required", HttpStatus.BAD_REQUEST),
    CATEGORY_NAME_REQUIRED(9807, "error.field.category.name.required", HttpStatus.BAD_REQUEST),
    CATEGORY_SLUG_REQUIRED(9808, "error.field.category.slug.required", HttpStatus.BAD_REQUEST),
    PRODUCT_NAME_REQUIRED(9809, "error.field.product.name.required", HttpStatus.BAD_REQUEST),
    CATEGORY_ID_REQUIRED(9810, "error.field.category.id.required", HttpStatus.BAD_REQUEST),
    PRODUCT_PRICE_REQUIRED(9811, "error.field.product.price.required", HttpStatus.BAD_REQUEST),
    PRODUCT_SLUG_REQUIRED(9812, "error.field.product.slug.required", HttpStatus.BAD_REQUEST),
    PRODUCT_SKU_REQUIRED(9813, "error.field.product.sku.required", HttpStatus.BAD_REQUEST),
    PRODUCT_QUANTITY_REQUIRED(9814, "error.field.product.quantity.required", HttpStatus.BAD_REQUEST),
    PRODUCT_QUANTITY_MIN(9815, "error.field.product.quantity.min", HttpStatus.BAD_REQUEST),
    RECIPIENT_NAME_REQUIRED(9816, "error.field.recipient-name.required", HttpStatus.BAD_REQUEST),
    ADDRESS_REQUIRED(9817, "error.field.address.required", HttpStatus.BAD_REQUEST),
    DISTRICT_REQUIRED(9818, "error.field.district.required", HttpStatus.BAD_REQUEST),
    CITY_REQUIRED(9819, "error.field.city.required", HttpStatus.BAD_REQUEST),
    PROVINCE_REQUIRED(9820, "error.field.province.required", HttpStatus.BAD_REQUEST),
    SHIPPING_ADDRESS_REQUIRED(9821, "error.field.shipping-address.required", HttpStatus.BAD_REQUEST),
    PRODUCT_ID_REQUIRED(9822, "error.field.product.id.required", HttpStatus.BAD_REQUEST),
    ORDER_ID_REQUIRED(9823, "error.field.order.id.required", HttpStatus.BAD_REQUEST),
    PAYMENT_METHOD_REQUIRED(9824, "error.field.payment-method.required", HttpStatus.BAD_REQUEST),
    VOUCHER_CODE_REQUIRED(9825, "error.field.voucher.code.required", HttpStatus.BAD_REQUEST),
    VOUCHER_NAME_REQUIRED(9826, "error.field.voucher.name.required", HttpStatus.BAD_REQUEST),
    DISCOUNT_TYPE_REQUIRED(9827, "error.field.discount-type.required", HttpStatus.BAD_REQUEST),
    DISCOUNT_VALUE_REQUIRED(9828, "error.field.discount-value.required", HttpStatus.BAD_REQUEST),
    MIN_ORDER_AMOUNT_REQUIRED(9829, "error.field.min-order-amount.required", HttpStatus.BAD_REQUEST),
    VOUCHER_TOTAL_QUANTITY_REQUIRED(9830, "error.field.voucher.total-quantity.required", HttpStatus.BAD_REQUEST),
    VOUCHER_START_TIME_REQUIRED(9831, "error.field.voucher.start-time.required", HttpStatus.BAD_REQUEST),
    VOUCHER_END_TIME_REQUIRED(9832, "error.field.voucher.end-time.required", HttpStatus.BAD_REQUEST),
    BANNER_TITLE_REQUIRED(9833, "error.field.banner.title.required", HttpStatus.BAD_REQUEST),
    BANNER_IMAGE_URL_REQUIRED(9834, "error.field.banner.image-url.required", HttpStatus.BAD_REQUEST),
    BANNER_POSITION_REQUIRED(9835, "error.field.banner.position.required", HttpStatus.BAD_REQUEST),
    BLOG_SLUG_REQUIRED(9836, "error.field.blog.slug.required", HttpStatus.BAD_REQUEST),
    RATING_REQUIRED(9837, "error.field.rating.required", HttpStatus.BAD_REQUEST),
    PRICE_REQUIRED(9838, "error.field.price.required", HttpStatus.BAD_REQUEST),
    STOCK_REQUIRED(9839, "error.field.stock.required", HttpStatus.BAD_REQUEST),
    IS_DEFAULT_REQUIRED(9840, "error.field.is-default.required", HttpStatus.BAD_REQUEST),
    OPTION_VALUE_ID_REQUIRED(9841, "error.field.option-value.id.required", HttpStatus.BAD_REQUEST),
    //THEEM VAO SAU NAY
    OlD_PASSWORD_REQUIRED(9842, "error.field.old.password.required", HttpStatus.BAD_REQUEST),
    NEW_PASSWORD_REQUIRED(9842, "error.field.new.password.required", HttpStatus.BAD_REQUEST),
    OLD_PASSWORD_IS_INCORECT(9843, "error.field.old.password.is.incorect", HttpStatus.BAD_REQUEST),
    INVALID_REFRESH_TOKEN(9844, "error.invalid.refresh.token", HttpStatus.BAD_REQUEST),
    INVALID_TOKEN(9845, "error.invalid.token", HttpStatus.BAD_REQUEST),
    CART_ITEM_NOT_FOUND(4042, "Cart item not found", HttpStatus.NOT_FOUND),
    ITEM_NOT_IN_CART(4003, "Item does not belong to the user's cart", HttpStatus.BAD_REQUEST),
    COUPON_ALREADY_EXISTS(4091, "Coupon code already exists", HttpStatus.CONFLICT),
    COUPON_NOT_FOUND(4043, "Coupon not found", HttpStatus.NOT_FOUND);
    private final int code; // Changed from int to String for better readability
    private final String messageKey; // Renamed from message to messageKey for i18n
    private final HttpStatusCode httpStatusCode;

    ErrorCode(int code, String messageKey, HttpStatusCode httpStatusCode) {
        this.code = code;
        this.messageKey = messageKey;
        this.httpStatusCode = httpStatusCode;
    }
}

