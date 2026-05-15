package com.manfashion.springboot_be.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/speech")
public class SpeechController {
    
    @Value("${google.speech.api.key:}")
    private String apiKey;

    @PostMapping("/recognize")
    public ResponseEntity<?> recognize(@RequestBody Map<String, String> request) {
        if (apiKey == null || apiKey.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Chưa cấu hình nhận diện giọng nói"));
        }
        
        String base64Audio = request.get("audio");
        if (base64Audio == null || base64Audio.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không có dữ liệu âm thanh"));
        }

        // Bỏ data URI prefix nếu có (vd: "data:audio/webm;base64,")
        if (base64Audio.contains(",")) {
            base64Audio = base64Audio.substring(base64Audio.indexOf(",") + 1);
        }

        RestTemplate restTemplate = new RestTemplate();
        String url = "https://speech.googleapis.com/v1/speech:recognize?key=" + apiKey;
        
        Map<String, Object> body = new HashMap<>();
        Map<String, Object> config = new HashMap<>();
        config.put("encoding", "WEBM_OPUS");
        config.put("sampleRateHertz", 48000); // Thường thu từ trình duyệt là 48kHz
        config.put("languageCode", "vi-VN");
        
        Map<String, Object> audio = new HashMap<>();
        audio.put("content", base64Audio);
        
        body.put("config", config);
        body.put("audio", audio);
        
        try {
            Map response = restTemplate.postForObject(url, body, Map.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
