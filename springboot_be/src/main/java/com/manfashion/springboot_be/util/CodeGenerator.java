package com.manfashion.springboot_be.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class CodeGenerator {
    private final SecureRandom rnd = new SecureRandom();
    private static final String ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public String generate() {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"));
        StringBuilder sb = new StringBuilder("ORD-").append(ts).append("-");
        for (int i = 0; i < 5; i++) {
            sb.append(ALPHANUM.charAt(rnd.nextInt(ALPHANUM.length())));
        }
        return sb.toString();
    }
}

