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

    private final CartItemMapper cartItemMapper;




    private Cart getOrCreateCart(String userIdStr) {

        Integer userId = Integer.valueOf(userIdStr);

        return cartRepo.findByUserId(userId)
                .orElseGet(() -> {

                    User user = userRepo.findById(userId)
                            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));


                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();


                    return cartRepo.save(newCart);
                });
    }




    private CartItemResponse buildCartItemResponse(CartItem item) {
        Product product = item.getProduct();
        String thumbnailUrl = null;
        ProductVariant variant = item.getVariant();

        if (product != null) {
            thumbnailUrl = resolveCartItemImage(product, variant);
        }

        return cartItemMapper.toResponseDTO(item, product, variant, thumbnailUrl);
    }

    private String resolveCartItemImage(Product product, ProductVariant variant) {
        if (variant != null && variant.getColor() != null && !variant.getColor().isBlank()) {
            Optional<String> colorImage = imageRepo
                    .findByProductIdAndColorIgnoreCaseAndDeletedAtIsNull(product.getId(), variant.getColor())
                    .stream()
                    .map(ProductImage::getUrl)
                    .filter(url -> url != null && !url.isBlank())
                    .findFirst();

            if (colorImage.isPresent()) {
                return colorImage.get();
            }
        }

        Optional<String> thumbnail = imageRepo
                .findFirstByProductIdAndIsThumbnailTrueAndDeletedAtIsNull(product.getId())
                .map(ProductImage::getUrl)
                .filter(url -> url != null && !url.isBlank());

        if (thumbnail.isPresent()) {
            return thumbnail.get();
        }

        return imageRepo
                .findByProductIdAndDeletedAtIsNull(product.getId())
                .stream()
                .map(ProductImage::getUrl)
                .filter(url -> url != null && !url.isBlank())
                .findFirst()
                .orElse(null);
    }

    @Override
    @Transactional
    public List<CartItemResponse> getCartItems(String userIdHex) {
        Cart cart = getOrCreateCart(userIdHex);
        List<CartItem> items = purgeUnavailableItems(cart);

        return items.stream().map(this::buildCartItemResponse).toList();
    }

    @Override
    public List<CartItemResponse> addItem(String userIdStr, CartItemRequest req) {
        Cart cart = getOrCreateCart(userIdStr);
        Integer productId = Integer.valueOf(req.getProductId());
        Integer variantId = Integer.valueOf(req.getVariantId());


        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        ProductVariant variant = variantRepo.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));
        ensurePurchasable(product, variant);

        List<CartItem> existing = purgeUnavailableItems(cart);


        Optional<CartItem> duplicate = existing.stream()
                .filter(ci -> ci.getVariant() != null && ci.getVariant().getId().equals(variantId))
                .findFirst();

        if (duplicate.isPresent()) {
            CartItem ci = duplicate.get();
            ci.setQuantity(ci.getQuantity() + Math.max(1, req.getQuantity()));
            cartItemRepo.save(ci);
        } else {

            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .variant(variant)
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
        if (isUnavailable(item)) {
            cartItemRepo.delete(item);
            throw new AppException(ErrorCode.CART_ITEM_NOT_FOUND);
        }

        if (req.getVariantId() != null) {
            ProductVariant newVariant = variantRepo.findById(Integer.valueOf(req.getVariantId()))
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));
            Product product = newVariant.getProduct();
            if (product == null) {
                throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
            }
            ensurePurchasable(product, newVariant);
            item.setVariant(newVariant);
            item.setProduct(product);
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

    private List<CartItem> purgeUnavailableItems(Cart cart) {
        List<CartItem> items = cartItemRepo.findByCartIdOrderByCreatedAtDesc(cart.getId());
        List<CartItem> unavailableItems = items.stream()
                .filter(this::isUnavailable)
                .toList();
        if (!unavailableItems.isEmpty()) {
            cartItemRepo.deleteAll(unavailableItems);
            items.removeAll(unavailableItems);
        }
        return items;
    }

    private boolean isUnavailable(CartItem item) {
        Product product = item.getProduct();
        ProductVariant variant = item.getVariant();
        return product == null
                || variant == null
                || product.getDeletedAt() != null
                || Boolean.FALSE.equals(product.getIsActive())
                || variant.getDeletedAt() != null;
    }

    private void ensurePurchasable(Product product, ProductVariant variant) {
        if (product.getDeletedAt() != null || Boolean.FALSE.equals(product.getIsActive())) {
            throw new AppException(ErrorCode.PRODUCT_IS_ACTIVE);
        }
        if (variant.getDeletedAt() != null) {
            throw new AppException(ErrorCode.VARIANT_NOT_FOUND);
        }
        if (variant.getProduct() == null || !variant.getProduct().getId().equals(product.getId())) {
            throw new AppException(ErrorCode.VARIANT_NOT_BELONG_TO_PRODUCT);
        }
    }
}
