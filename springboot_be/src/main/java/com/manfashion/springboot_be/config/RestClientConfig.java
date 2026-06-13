package com.manfashion.springboot_be.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient restClient(
            @Value("${gemini.connect-timeout-seconds:10}") long connectTimeoutSeconds,
            @Value("${gemini.request-timeout-seconds:60}") long requestTimeoutSeconds) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(connectTimeoutSeconds))
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(requestTimeoutSeconds));

        return RestClient.builder()
                .requestFactory(requestFactory)
                .build();
    }
}
