package com.manfashion.springboot_be.service.Cart;

import com.manfashion.springboot_be.DTO.Cart.CartItemRequest;
import com.manfashion.springboot_be.DTO.Cart.CartItemResponse;
import com.manfashion.springboot_be.entity.*;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.mapper.CartItemMapper;
import com.manfashion.springboot_be.repository.Cart.CartItemRepository;
import com.manfashion.springboot_be.repository.Cart.CartRepository;
import com.manfashion.springboot_be.repository.Product.ProductImageRepository;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.repository.Product.ProductVariantRepository;
import com.manfashion.springboot_be.repository.User.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepo;
    private final ProductRepository productRepo;
    private final ProductVariantRepository variantRepo;
    private final ProductImageRepository imageRepo;
    private final CartItemRepository cartItemRepo;
    private final UserRepository userRepo;
    // Inject Mapper đã làm ở bước trước
    private final CartItemMapper cartItemMapper;

    // =====================================================
    // 🧩 Helper: Lấy hoặc tạo mới giỏ hàng cho user
    // =====================================================
    private Cart getOrCreateCart(String userIdStr) {
        // Chuyển String từ Security token thành Integer theo chuẩn DB của bạn
        Integer userId = Integer.valueOf(userIdStr);

        return cartRepo.findByUserId(userId)
                .orElseGet(() -> {
                    // 1. Tìm User thật từ DB (hoặc dùng userRepo.getReferenceById(userId) cho tối ưu hiệu suất)
                    User user = userRepo.findById(userId)
                            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

                    // 2. Tạo Cart mới và gán Object User vào
                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();

                    // 3. Lưu vào Database
                    return cartRepo.save(newCart);
                });
    }

    // =====================================================
    // 🧱 Helper: Xử lý gom dữ liệu và gọi Mapper
    // =====================================================
    private CartItemResponse buildCartItemResponse(CartItem item) {
        Product product = item.getProduct(); // Lấy thẳng Object Product từ CartItem
        String thumbnailUrl = null;
        ProductVariant variant = item.getVariant(); // Lấy thẳng Object Variant từ CartItem

        if (product != null) {
            thumbnailUrl = imageRepo
                    .findFirstByProductIdAndIsThumbnailTrueAndDeletedAtIsNull(product.getId())
                    .map(ProductImage::getUrl)
                    .orElse(null);
        }

        return cartItemMapper.toResponseDTO(item, product, variant, thumbnailUrl);
    }

    @Override
    public List<CartItemResponse> getCartItems(String userIdHex) {
        Cart cart = getOrCreateCart(userIdHex);
        List<CartItem> items = cartItemRepo.findByCartIdOrderByCreatedAtDesc(cart.getId());

        return items.stream().map(this::buildCartItemResponse).toList();
    }

    @Override
    public List<CartItemResponse> addItem(String userIdStr, CartItemRequest req) {
        Cart cart = getOrCreateCart(userIdStr);
        Integer productId = Integer.valueOf(req.getProductId());
        Integer variantId = Integer.valueOf(req.getVariantId());

        // 1. Tìm Product và Variant thật trong DB
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        ProductVariant variant = variantRepo.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        List<CartItem> existing = cartItemRepo.findByCartIdOrderByCreatedAtDesc(cart.getId());

        // 2. Tìm xem trong giỏ đã có item nào trùng variant chưa (So sánh ID của Variant)
        Optional<CartItem> duplicate = existing.stream()
                .filter(ci -> ci.getVariant() != null && ci.getVariant().getId().equals(variantId))
                .findFirst();

        if (duplicate.isPresent()) {
            CartItem ci = duplicate.get();
            ci.setQuantity(ci.getQuantity() + Math.max(1, req.getQuantity()));
            cartItemRepo.save(ci);
        } else {
            // 3. Khởi tạo CartItem mới bằng CÁC OBJECT thay vì ID
            CartItem newItem = CartItem.builder()
                    .cart(cart)         // Gán object cart
                    .product(product)   // Gán object product
                    .variant(variant)   // Gán object variant
                    .quantity(Math.max(1, req.getQuantity()))
                    .build();
            cartItemRepo.save(newItem);
        }

        return cartItemRepo.findByCartIdOrderByCreatedAtDesc(cart.getId())
                .stream()
                .map(this::buildCartItemResponse)
                .toList();
    }

    @Override
    public List<CartItemResponse> updateItem(String userIdHex, String cartItemIdHex, CartItemRequest req) {
        Integer userId = Integer.parseInt(userIdHex);
        Integer itemId = Integer.parseInt(cartItemIdHex);

        Cart cart = cartRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for userId=" + userIdHex));

        CartItem item = cartItemRepo.findById(itemId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new AppException(ErrorCode.ITEM_NOT_IN_CART);
        }
        // Thay vì setVariantId, ta phải set nguyên cái Object Variant vào
        if (req.getVariantId() != null) {
            ProductVariant newVariant = variantRepo.findById(Integer.valueOf(req.getVariantId()))
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));
            item.setVariant(newVariant);
        }

        if (req.getQuantity() != null && req.getQuantity() > 0) {
            item.setQuantity(req.getQuantity());
        }

        cartItemRepo.save(item);

        return cartItemRepo.findByCartIdOrderByCreatedAtDesc(cart.getId())
                .stream()
                .map(this::buildCartItemResponse)
                .toList();
    }

    @Override
    public void removeItem(String userIdHex, String cartItemIdHex) {
        Integer userId = Integer.parseInt(userIdHex);
        Integer itemId = Integer.parseInt(cartItemIdHex);

        Cart cart = cartRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for userId=" + userIdHex));

        cartItemRepo.findById(itemId).ifPresentOrElse(
                item -> {
                    if (!item.getCart().getId().equals(cart.getId())) {
                        throw new AppException(ErrorCode.ITEM_NOT_IN_CART);
                    }
                    cartItemRepo.deleteById(itemId);
                },
                () -> {
                    throw new AppException(ErrorCode.ITEM_NOT_IN_CART);
                }
        );
    }

    @Override
    @Transactional
    public void clear(String userIdHex) {
        Cart cart = getOrCreateCart(userIdHex);
        cartItemRepo.deleteByCartId(cart.getId());
    }
}
