package com.manfashion.springboot_be.service.Report;

import com.manfashion.springboot_be.DTO.Report.TopEmployeeResponse;
import lombok.RequiredArgsConstructor;
import org.openpdf.text.*;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeePayrollPdfServiceImpl implements EmployeePayrollPdfService {

    private final ReportService reportService;

    private static final String COMPANY_NAME = "TRENDIFY STORE";
    private static final String COMPANY_SUBTITLE = "(Trendify Việt Nam)";
    private static final String COMPANY_ADDRESS = "Địa chỉ: ........................................................";
    private static final String COMPANY_HOTLINE = "Hotline: ...................................";
    private static final String COMPANY_EMAIL = "Email: trendify.store.vn@gmail.com";
    private static final String COMPANY_WEBSITE = "Website: https://trendify.store.vn";

    @Override
    public byte[] generateEmployeePayrollMonthlyPdf(Integer month, Integer year) {
        int m = (month != null) ? month : LocalDate.now().getMonthValue();
        int y = (year != null) ? year : LocalDate.now().getYear();

        List<TopEmployeeResponse> employees = reportService.getTopEmployeesMonthly(m, y);
        Document document = new Document(PageSize.A4, 36, 36, 54, 36);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            addHeader(document);
            addTitle(document, m, y);
            addGeneratedAt(document);
            addSummarySection(document, employees, m, y);
            addPayrollTable(document, employees);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate employee payroll monthly PDF", e);
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

    private void addTitle(Document document, int month, int year) throws DocumentException {
        Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
        String titleText = String.format("Báo cáo chấm công và lương tháng %02d/%d", month, year);
        Paragraph title = new Paragraph(titleText, titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(10f);
        document.add(title);
    }

    private void addGeneratedAt(Document document) throws DocumentException {
        Font metaFont = new Font(Font.HELVETICA, 9, Font.ITALIC);
        String timeText = "Ngày tạo: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        Paragraph meta = new Paragraph(timeText, metaFont);
        meta.setAlignment(Element.ALIGN_RIGHT);
        meta.setSpacingAfter(10f);
        document.add(meta);
    }

    private void addSummarySection(Document document, List<TopEmployeeResponse> employees, int month, int year) throws DocumentException {
        Font headerFont = new Font(Font.HELVETICA, 11, Font.BOLD);
        Font labelFont = new Font(Font.HELVETICA, 10, Font.BOLD);
        Font valueFont = new Font(Font.HELVETICA, 10, Font.NORMAL);

        Paragraph header = new Paragraph("1. Tổng quan lương", headerFont);
        header.setSpacingAfter(5f);
        document.add(header);

        long totalEmployees = employees != null ? employees.size() : 0L;
        double totalHours = 0.0;
        double totalSalary = 0.0;

        if (employees != null) {
            for (TopEmployeeResponse e : employees) {
                if (e.getTotalHours() != null) totalHours += e.getTotalHours();
                if (e.getTotalSalary() != null) totalSalary += e.getTotalSalary();
            }
        }

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(60);
        table.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.setSpacingAfter(10f);

        addSummaryRow(table, "Tháng lương:", String.format("%02d/%d", month, year), labelFont, valueFont);
        addSummaryRow(table, "Tổng nhân viên:", String.valueOf(totalEmployees), labelFont, valueFont);
        addSummaryRow(table, "Tổng giờ:", String.format("%.2f", totalHours), labelFont, valueFont);
        addSummaryRow(table, "Tổng lương:", formatCurrency(totalSalary), labelFont, valueFont);

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

    private void addPayrollTable(Document document, List<TopEmployeeResponse> employees) throws DocumentException {
        Font sectionTitleFont = new Font(Font.HELVETICA, 11, Font.BOLD);
        Paragraph header = new Paragraph("2. Chi tiết lương nhân viên", sectionTitleFont);
        header.setSpacingBefore(5f);
        header.setSpacingAfter(5f);
        document.add(header);

        if (employees == null || employees.isEmpty()) {
            Paragraph empty = new Paragraph("Không có dữ liệu chấm công/lương trong kỳ này.", new Font(Font.HELVETICA, 10, Font.ITALIC));
            empty.setSpacingAfter(10f);
            document.add(empty);
            return;
        }

        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setSpacingBefore(5f);
        table.setSpacingAfter(10f);
        table.setWidths(new float[]{1f, 4f, 5f, 2f, 2f, 3f});

        Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD);
        Font bodyFont = new Font(Font.HELVETICA, 9, Font.NORMAL);

        addHeaderCell(table, "#", headerFont);
        addHeaderCell(table, "Họ tên", headerFont);
        addHeaderCell(table, "Email", headerFont);
        addHeaderCell(table, "Lương giờ", headerFont);
        addHeaderCell(table, "Tổng giờ", headerFont);
        addHeaderCell(table, "Tổng lương", headerFont);

        int index = 1;
        for (TopEmployeeResponse e : employees) {
            addBodyCell(table, String.valueOf(index++), bodyFont);
            addBodyCell(table, e.getFullName(), bodyFont);
            addBodyCell(table, e.getEmail(), bodyFont);
            addBodyCell(table, e.getHourlyRate() != null ? formatCurrency(e.getHourlyRate()) + "/h" : "", bodyFont);
            addBodyCell(table, e.getTotalHours() != null ? String.format("%.2f", e.getTotalHours()) : "0.00", bodyFont);
            addBodyCell(table, formatCurrency(e.getTotalSalary()), bodyFont);
        }
        document.add(table);
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(4f);
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
        cell.setPadding(4f);
        table.addCell(cell);
    }

    private String formatCurrency(Double value) {
        if (value == null) return "0 ₫";
        return String.format("%,.0f ₫", value).replace(",", ".");
    }
}
