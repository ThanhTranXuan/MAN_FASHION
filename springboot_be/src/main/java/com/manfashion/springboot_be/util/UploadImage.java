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
        return uploadResult.get("secure_url").toString();
    }




    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return;

        try {



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




    private String extractPublicId(String imageUrl) {
        try {
            int uploadIndex = imageUrl.indexOf("/upload/");
            if (uploadIndex == -1) return null;


            String pathPart = imageUrl.substring(uploadIndex + 8);

            if (pathPart.startsWith("v")) {
                int slashIndex = pathPart.indexOf("/");
                if (slashIndex != -1) {
                    pathPart = pathPart.substring(slashIndex + 1);
                }
            }


            int dotIndex = pathPart.lastIndexOf(".");
            if (dotIndex != -1) {
                pathPart = pathPart.substring(0, dotIndex);
            }


            return pathPart;
        } catch (Exception e) {
            return null;
        }
    }
}
