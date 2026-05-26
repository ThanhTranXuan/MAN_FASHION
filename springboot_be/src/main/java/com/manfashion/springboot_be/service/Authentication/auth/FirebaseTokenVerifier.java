package com.manfashion.springboot_be.service.Authentication.auth;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.Builder;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.PublicKey;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Component
public class FirebaseTokenVerifier {
    private static final String CERT_URL =
            "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${firebase.project-id:thanh-88098}")
    private String firebaseProjectId;

    private Map<String, String> cachedCerts;
    private Instant certsExpiredAt = Instant.EPOCH;

    public FirebaseToken verify(String idToken) {
        try {
            String kid = readKeyId(idToken);
            PublicKey publicKey = getPublicKey(kid);

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(publicKey)
                    .requireIssuer("https://securetoken.google.com/" + firebaseProjectId)
                    .requireAudience(firebaseProjectId)
                    .build()
                    .parseClaimsJws(idToken)
                    .getBody();

            String uid = claims.getSubject();
            String email = claims.get("email", String.class);
            Boolean emailVerified = claims.get("email_verified", Boolean.class);

            if (uid == null || uid.isBlank() || email == null || email.isBlank() || !Boolean.TRUE.equals(emailVerified)) {
                throw new AppException(ErrorCode.AUTHENTICATION_FAILED);
            }

            return FirebaseToken.builder()
                    .uid(uid)
                    .email(email)
                    .fullName(claims.get("name", String.class))
                    .avatarUrl(claims.get("picture", String.class))
                    .build();
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.AUTHENTICATION_FAILED);
        }
    }

    private String readKeyId(String token) throws Exception {
        String[] parts = token.split("\\.");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Invalid JWT");
        }

        String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]));
        Map<String, Object> header = objectMapper.readValue(headerJson, new TypeReference<>() {});
        Object kid = header.get("kid");
        if (kid == null) {
            throw new IllegalArgumentException("Missing kid");
        }
        return kid.toString();
    }

    private PublicKey getPublicKey(String kid) throws Exception {
        Map<String, String> certs = getCertificates();
        String cert = certs.get(kid);
        if (cert == null) {
            cachedCerts = null;
            certsExpiredAt = Instant.EPOCH;
            cert = getCertificates().get(kid);
        }
        if (cert == null) {
            throw new IllegalArgumentException("Unknown Firebase certificate");
        }

        CertificateFactory factory = CertificateFactory.getInstance("X.509");
        X509Certificate certificate = (X509Certificate) factory.generateCertificate(
                new ByteArrayInputStream(cert.getBytes())
        );
        return certificate.getPublicKey();
    }

    private Map<String, String> getCertificates() throws Exception {
        if (cachedCerts != null && Instant.now().isBefore(certsExpiredAt)) {
            return cachedCerts;
        }

        HttpRequest request = HttpRequest.newBuilder(URI.create(CERT_URL)).GET().build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new IllegalStateException("Cannot fetch Firebase certificates");
        }

        cachedCerts = objectMapper.readValue(response.body(), new TypeReference<>() {});
        certsExpiredAt = Instant.now().plusSeconds(readMaxAge(response.headers().firstValue("cache-control").orElse("")));
        return cachedCerts;
    }

    private long readMaxAge(String cacheControl) {
        for (String part : cacheControl.split(",")) {
            String trimmed = part.trim();
            if (trimmed.startsWith("max-age=")) {
                try {
                    return Long.parseLong(trimmed.substring("max-age=".length()));
                } catch (NumberFormatException ignored) {
                    return 3600;
                }
            }
        }
        return 3600;
    }

    @Data
    @Builder
    public static class FirebaseToken {
        private String uid;
        private String email;
        private String fullName;
        private String avatarUrl;
    }
}
