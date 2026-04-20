package com.manfashion.springboot_be.service.Report;

public interface MonthlyRevenuePdfService {
    byte[] generateMonthlyRevenuePdf(Integer month, Integer year);
}
