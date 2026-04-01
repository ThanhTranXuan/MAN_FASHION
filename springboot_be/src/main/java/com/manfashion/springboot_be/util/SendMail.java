package com.manfashion.springboot_be.util;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;

@Slf4j
@Component
@RequiredArgsConstructor
public class SendMail {

    private final JavaMailSender mailSender;

    public boolean sendMail(String to, String subject, String text) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            helper.setText(text, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom(new InternetAddress("trendify.store.vn@gmail.com", "noreply@trendify.store.vn"));

            mailSender.send(message);
            log.info("✅ Email sent successfully to {}", to);
            return true;

        } catch (MessagingException | UnsupportedEncodingException | MailException e) {
            log.error("❌ Failed to send email to {}: {}", to, e.getMessage());
            return false;
        }
    }
}
