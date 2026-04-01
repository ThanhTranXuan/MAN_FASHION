package com.manfashion.springboot_be.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dltg0f2qf",
                "api_key", "974111183696555",
                "api_secret", "MaItMHBdK4Evk64_qclZPhyfLKI"
        ));
    }
}
