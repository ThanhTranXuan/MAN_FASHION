package com.manfashion.springboot_be.service.Product;

import com.manfashion.springboot_be.DTO.Product.ProductImageResponse;
import com.manfashion.springboot_be.entity.Product;
import com.manfashion.springboot_be.entity.ProductImage;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.mapper.ProductMapper;
import com.manfashion.springboot_be.repository.Product.ProductImageRepository;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.util.UploadImage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService{
    private final ProductImageRepository imageRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final UploadImage uploadImage;

    @Override
    public List<ProductImageResponse> uploadImages(String productId, String color, List<MultipartFile> files) {
        Integer productIdstr = Integer.parseInt(productId);
        Product product = productRepository.findById(productIdstr)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // 1. Lấy ảnh cũ (theo màu hoặc không màu)
        List<ProductImage> oldImages;
        if (color != null && !color.isBlank()) {
            oldImages = imageRepository.findByProductIdAndColor(productIdstr, color.toLowerCase());
        } else {
            oldImages = imageRepository.findByProductIdAndColorIsNull(productIdstr);
        }

        // 2. Xóa ảnh cũ trên Cloudinary và trong Database
        for (ProductImage img : oldImages) {
            try {
                uploadImage.deleteImage(img.getUrl()); // Lưu ý đổi tên hàm cho khớp với util của bạn
            } catch (Exception ignored) {
                // Ignore lỗi xóa cloud để không làm gián đoạn luồng
            }
        }
        if (!oldImages.isEmpty()) {
            imageRepository.deleteAll(oldImages);
        }

        // 3. Nếu không có file mới gửi lên -> Chỉ là hành động xóa
        if (files == null || files.isEmpty()) {
            return Collections.emptyList();
        }

        // 4. Upload ảnh mới và lưu Database
        List<ProductImage> newImages = new ArrayList<>();
        for (int i = 0; i < files.size(); i++) {
            String url = "";

            // THÊM TRY-CATCH VÀO ĐÂY
            try {
                url = uploadImage.uploadImage(files.get(i)); // Gọi Cloudinary
            } catch (IOException e) {
                // Bắt lỗi và ném ra Exception của hệ thống
                // Bạn có thể thêm mã UPLOAD_IMAGE_FAILED vào enum ErrorCode của bạn
                throw new RuntimeException("Lỗi trong quá trình upload ảnh lên Cloud: " + e.getMessage());
                // Hoặc chuẩn nhất là: throw new AppException(ErrorCode.UPLOAD_IMAGE_FAILED);
            } // Gọi Cloudinary

            ProductImage img = new ProductImage();
            img.setProduct(product);
            img.setUrl(url);
            img.setColor((color != null && !color.isBlank()) ? color.toLowerCase() : null);
            img.setIsThumbnail(color == null && i == 0); // Ảnh đầu tiên không màu là thumbnail

            newImages.add(img);
        }

        return imageRepository.saveAll(newImages)
                .stream().map(productMapper::toImageResponseDTO).toList();
    }
}

