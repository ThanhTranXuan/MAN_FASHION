package com.manfashion.springboot_be.service.Report;


import com.manfashion.springboot_be.DTO.Report.MonthlyProductSalesRow;
import com.manfashion.springboot_be.DTO.Report.MonthlyRevenueReportResponse;
import lombok.RequiredArgsConstructor;
import org.openpdf.text.*;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MonthlyRevenuePdfServiceImpl implements MonthlyRevenuePdfService {

    private final ReportService reportService;

    private static final String COMPANY_NAME = "TRENDIFY STORE";
    private static final String COMPANY_SUBTITLE = "(Trendify Viet Nam)";
    private static final String COMPANY_ADDRESS = "Address: ........................................................";
    private static final String COMPANY_HOTLINE = "Hotline: ...................................";
    private static final String COMPANY_EMAIL = "Email: trendify.store.vn@gmail.com";
    private static final String COMPANY_WEBSITE = "Website: https://trendify.store.vn";

    @Override
    public byte[] generateMonthlyRevenuePdf(Integer month, Integer year) {
        MonthlyRevenueReportResponse data = reportService.getMonthlyRevenueReport(month, year);
        Document document = new Document(PageSize.A4, 36, 36, 54, 36);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            addHeader(document);
            addTitle(document, data);
            addGeneratedAt(document);
            addRevenueSummary(document, data);
            addProductSalesDetail(document, data.getProducts());

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate monthly revenue PDF", e);
        } finally {
            document.close();
        }
        return baos.toByteArray();
    }

    private void addHeader(Document document) throws Exception {
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{1.2f, 4.8f});

        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        logoCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        Image logo = loadLogoImage();
        if (logo != null) {
            logo.scaleToFit(80, 80);
            logo.setAlignment(Image.ALIGN_LEFT);
            logoCell.addElement(logo);
        }
        headerTable.addCell(logoCell);

        Font nameFont = new Font(Font.HELVETICA, 14, Font.BOLD);
        Font subtitleFont = new Font(Font.HELVETICA, 11, Font.BOLD);
        Font normalFont = new Font(Font.HELVETICA, 9, Font.NORMAL);

        Paragraph info = new Paragraph();
        info.setAlignment(Element.ALIGN_CENTER);

        Paragraph namePara = new Paragraph(COMPANY_NAME, nameFont);
        namePara.setAlignment(Element.ALIGN_CENTER);
        info.add(namePara);

        Paragraph subtitlePara = new Paragraph(COMPANY_SUBTITLE, subtitleFont);
        subtitlePara.setAlignment(Element.ALIGN_CENTER);
        info.add(subtitlePara);

        Paragraph addressPara = new Paragraph(COMPANY_ADDRESS, normalFont);
        addressPara.setAlignment(Element.ALIGN_CENTER);
        info.add(addressPara);

        Paragraph hotlinePara = new Paragraph(COMPANY_HOTLINE, normalFont);
        hotlinePara.setAlignment(Element.ALIGN_CENTER);
        info.add(hotlinePara);

        Paragraph emailPara = new Paragraph(COMPANY_EMAIL, normalFont);
        emailPara.setAlignment(Element.ALIGN_CENTER);
        info.add(emailPara);

        Paragraph websitePara = new Paragraph(COMPANY_WEBSITE, normalFont);
        websitePara.setAlignment(Element.ALIGN_CENTER);
        info.add(websitePara);

        PdfPCell infoCell = new PdfPCell();
        infoCell.setBorder(Rectangle.NO_BORDER);
        infoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        infoCell.addElement(info);
        headerTable.addCell(infoCell);

        document.add(headerTable);
        document.add(new Paragraph(" "));
        document.add(new Paragraph(" "));
    }

    private Image loadLogoImage() {
        try {
            ClassPathResource resource = new ClassPathResource("static/logo.png");
            try (InputStream in = resource.getInputStream()) {
                byte[] bytes = in.readAllBytes();
                return Image.getInstance(bytes);
            }
        } catch (Exception e) {
            return null;
        }
    }

    private void addTitle(Document document, MonthlyRevenueReportResponse data) throws DocumentException {
        Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
        String titleText = String.format("Monthly Revenue Report %02d/%d", data.getMonth(), data.getYear());
        Paragraph title = new Paragraph(titleText, titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(10f);
        document.add(title);
    }

    private void addGeneratedAt(Document document) throws DocumentException {
        Font metaFont = new Font(Font.HELVETICA, 9, Font.ITALIC);
        String timeText = "Generated at: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        Paragraph meta = new Paragraph(timeText, metaFont);
        meta.setAlignment(Element.ALIGN_RIGHT);
        meta.setSpacingAfter(10f);
        document.add(meta);
    }

    private void addRevenueSummary(Document document, MonthlyRevenueReportResponse data) throws DocumentException {
        Font headerFont = new Font(Font.HELVETICA, 11, Font.BOLD);
        Font labelFont = new Font(Font.HELVETICA, 10, Font.BOLD);
        Font valueFont = new Font(Font.HELVETICA, 10, Font.NORMAL);

        Paragraph sectionTitle = new Paragraph("1. Revenue Summary", headerFont);
        sectionTitle.setSpacingAfter(5f);
        document.add(sectionTitle);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(60);
        table.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.setSpacingAfter(10f);

        addSummaryRow(table, "Total Revenue:", formatCurrency(data.getTotalRevenue()), labelFont, valueFont);
        addSummaryRow(table, "Total Orders:", String.valueOf(data.getTotalOrders()), labelFont, valueFont);
        addSummaryRow(table, "Distinct Customers:", String.valueOf(data.getDistinctCustomers()), labelFont, valueFont);
        addSummaryRow(table, "Average Order Value:", formatCurrency(data.getAverageOrderValue()), labelFont, valueFont);
        addSummaryRow(table, "Total Refund:", formatCurrency(data.getTotalRefund()), labelFont, valueFont);

        document.add(table);
    }

    private void addSummaryRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell c1 = new PdfPCell(new Phrase(label, labelFont));
        c1.setBorderWidth(0.5f);
        c1.setPadding(4f);
        PdfPCell c2 = new PdfPCell(new Phrase(value != null ? value : "", valueFont));
        c2.setBorderWidth(0.5f);
        c2.setPadding(4f);
        table.addCell(c1);
        table.addCell(c2);
    }

    private void addProductSalesDetail(Document document, List<MonthlyProductSalesRow> products) throws DocumentException {
        Font sectionTitleFont = new Font(Font.HELVETICA, 11, Font.BOLD);
        Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD);
        Font bodyFont = new Font(Font.HELVETICA, 9, Font.NORMAL);

        Paragraph sectionTitle = new Paragraph("2. Product Sales Detail", sectionTitleFont);
        sectionTitle.setSpacingBefore(5f);
        sectionTitle.setSpacingAfter(5f);
        document.add(sectionTitle);

        if (products == null || products.isEmpty()) {
            Paragraph empty = new Paragraph("No sales recorded for this period.", new Font(Font.HELVETICA, 10, Font.ITALIC));
            empty.setSpacingAfter(10f);
            document.add(empty);
            return;
        }

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1f, 5f, 2f, 3f});
        table.setSpacingBefore(5f);

        addHeaderCell(table, "No.", headerFont);
        addHeaderCell(table, "Product", headerFont);
        addHeaderCell(table, "Quantity", headerFont);
        addHeaderCell(table, "Revenue", headerFont);

        int index = 1;
        for (MonthlyProductSalesRow p : products) {
            addBodyCell(table, String.valueOf(index++), bodyFont);
            addBodyCell(table, p.getProductName(), bodyFont);
            addBodyCell(table, p.getTotalQuantity() != null ? String.valueOf(p.getTotalQuantity()) : "0", bodyFont);
            addBodyCell(table, formatCurrency(p.getTotalRevenue()), bodyFont);
        }
        document.add(table);
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5f);
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
        cell.setPadding(4f);
        table.addCell(cell);
    }

    private String formatCurrency(Double value) {
        if (value == null) return "$0.00";
        return String.format("$%,.2f", value);
    }
}
