package com.manfashion.springboot_be.service.Report;

public interface ProductReportPdfService {
    byte[] generateProductMonthlyPdf(Integer month, Integer year);
}
