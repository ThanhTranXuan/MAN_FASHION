package com.manfashion.springboot_be.util;

public class EmailTemplateBuilder {

    public static String build(
            String displayName,           // Tên hiển thị người nhận
            String title,                 // Tiêu đề trong body, vd: "Order Update"
            String subtitleHtml,          // Nội dung mô tả (html ngắn)
            String ctaText,               // Nút CTA, có thể null
            String ctaLink                // Link CTA, có thể null
    ) {
        // nếu không có CTA, ẩn nút
        String ctaBlock = "";
        if (ctaText != null && !ctaText.isBlank() && ctaLink != null && !ctaLink.isBlank()) {
            ctaBlock = """
                <a href="%s"
                   style="display:inline-block; padding:12px 24px; background-color:#422AFB; color:#ffffff; 
                          font-weight:bold; text-decoration:none; border-radius:6px; font-size:16px; margin-top:16px;">
                    %s
                </a>
            """.formatted(escapeHtml(ctaLink), escapeHtml(ctaText));
        }

        // template theo layout reset password bạn gửi (đã fix <tr>/<td> đúng chuẩn)
        return """
            <!DOCTYPE html>
            <html>
              <body style="font-family: Arial, sans-serif; background:#f7f7f7; padding:20px;">
                <table align="center" width="100%%" style="max-width:600px; background:#ffffff; 
                       border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
                    <td style="padding: 16px 20px;">
                      <table width="100%%" cellspacing="0" cellpadding="0" style="width:100%%; border-collapse:collapse;">
                        <tr>
                          <td align="left" style="vertical-align:middle;">
                            <img src="https://lh3.googleusercontent.com/pw/AP1GczO0BNO_CjPB49f-Bfn8NzMeo1jsFAW7ktbPPqMPKAlWv9GYlSVzVYTZyVddf9D3NOsfCx5O-s-bdwUUH6AINcnjhtQyxZ2pDihqpVJ7OB9p7M54A0Kdc9tEnDgGa5sAUN6Zn7RTi2cIV1ouVjL93NDkmA=w540-h540-s-no-gm?authuser=0"
                                 alt="Trendify" style="width:80px; height:80px;">
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td>
                      <table width="95%%" align="center" cellspacing="0" cellpadding="0" 
                             style="border-bottom:1px solid #e2e8f0;"></table>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:20px;">
                      <h2 style="color:#2d3748; margin-bottom:10px;">%s</h2>
                      <p style="color:#4a5568; font-size:15px; line-height:1.6;">
                        Hello <b>%s</b>,
                      </p>
                      <div style="color:#4a5568; font-size:15px; line-height:1.6;">
                        %s
                      </div>
                      %s
                      <p style="margin-top:24px; color:#4a5568; font-size:14px; line-height:1.6;">
                        Thank you for choosing <b>Trendify</b>.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr style="background:#f9fafb;">
                    <td align="center" style="padding:15px; font-size:12px; color:#718096;">
                      © 2025 Trendify. All rights reserved.
                    </td>
                  </tr>
                </table>
              </body>
            </html>
        """.formatted(
                escapeHtml(title),
                escapeHtml(displayName),
                subtitleHtml, // cho phép html ngắn có <br>, <b>...
                ctaBlock
        );
    }

    // Helper escape an toàn khi đưa chuỗi vào HTML attributes/text
    private static String escapeHtml(String s) {
        if (s == null) return "";
        return s
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"","&quot;")
                .replace("'", "&#x27;");
    }
}

