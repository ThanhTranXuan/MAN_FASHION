package com.manfashion.springboot_be.util;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class UploadImage {
    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("folder", "trendify_uploads"));
        return uploadResult.get("secure_url").toString(); // return URL
    }

    // =====================================================
    // 🗑️ Xoá ảnh trên Cloudinary bằng URL
    // =====================================================
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return;

        try {
            // 🧩 Trích xuất public_id từ URL
            // Ví dụ: https://res.cloudinary.com/demo/image/upload/v123456/trendify_uploads/abc123.jpg
            // => public_id = trendify_uploads/abc123
            String publicId = extractPublicId(imageUrl);

            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("Deleted Cloudinary image: {}", publicId);
            } else {
                log.warn("Cannot extract Cloudinary public ID from URL: {}", imageUrl);
            }

        } catch (Exception e) {
            log.error("Failed to delete Cloudinary image: {}", imageUrl, e);
        }
    }

    // =====================================================
    // 🧠 Helper: trích xuất public_id từ secure_url
    // =====================================================
    private String extractPublicId(String imageUrl) {
        try {
            int uploadIndex = imageUrl.indexOf("/upload/");
            if (uploadIndex == -1) return null;

            // Lấy phần sau "/upload/"
            String pathPart = imageUrl.substring(uploadIndex + 8);
            // Bỏ version (vd: v123456/)
            if (pathPart.startsWith("v")) {
                int slashIndex = pathPart.indexOf("/");
                if (slashIndex != -1) {
                    pathPart = pathPart.substring(slashIndex + 1);
                }
            }

            // Bỏ phần mở rộng (.jpg, .png, ...)
            int dotIndex = pathPart.lastIndexOf(".");
            if (dotIndex != -1) {
                pathPart = pathPart.substring(0, dotIndex);
            }

            // Kết quả: trendify_uploads/abc123
            return pathPart;
        } catch (Exception e) {
            return null;
        }
    }
}
