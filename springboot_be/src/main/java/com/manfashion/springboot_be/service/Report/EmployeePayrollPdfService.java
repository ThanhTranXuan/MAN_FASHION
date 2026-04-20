package com.manfashion.springboot_be.service.Report;

public interface EmployeePayrollPdfService {
    byte[] generateEmployeePayrollMonthlyPdf(Integer month, Integer year);
}
