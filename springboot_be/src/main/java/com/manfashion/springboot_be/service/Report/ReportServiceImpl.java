package com.manfashion.springboot_be.service.Report;

import com.manfashion.springboot_be.DTO.Report.CustomerSummaryResponse;
import com.manfashion.springboot_be.DTO.Report.OverviewResponse;
import com.manfashion.springboot_be.DTO.Report.ProductCategorySummaryResponse;
import com.manfashion.springboot_be.DTO.Report.RevenueSummaryResponse;
import com.manfashion.springboot_be.DTO.Report.TopProductResponse;
import com.manfashion.springboot_be.DTO.Report.TrendResponse;
import com.manfashion.springboot_be.repository.Category.CategoryRepository;
import com.manfashion.springboot_be.repository.Order.OrderItemRepository;
import com.manfashion.springboot_be.repository.Order.OrderRepository;
import com.manfashion.springboot_be.repository.Product.ProductRepository;
import com.manfashion.springboot_be.repository.Return.ReturnOrderRepository;
import com.manfashion.springboot_be.repository.Role.RoleRepository;
import com.manfashion.springboot_be.repository.User.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final ReturnOrderRepository returnOrderRepo;
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final CategoryRepository categoryRepo;
    private final ProductRepository productRepo;

    @Override
    public OverviewResponse getOverview() {
        Double rev = orderRepo.sumTotalRevenueByStatus("COMPLETED");
        var empRole = roleRepo.findByName("EMPLOYEE").orElseThrow();

        return OverviewResponse.builder()
                .totalRevenue(rev != null ? rev : 0.0)
                .totalEmployees(userRepo.countByRole_IdAndDeletedAtIsNull(empRole.getId()))
                .totalCustomers(orderRepo.countDistinctUsersByStatusNot("CANCELLED"))
                .totalCategories(categoryRepo.count())
                .totalProducts(productRepo.count())
                .totalOrders(orderRepo.count())
                .build();
    }

    @Override
    public RevenueSummaryResponse getRevenueSummary() {
        LocalDate now = LocalDate.now();
        LocalDateTime curStart = now.withDayOfMonth(1).atStartOfDay();
        LocalDateTime prevStart = curStart.minusMonths(1);

        double curRev = getRev(curStart, curStart.plusMonths(1));
        double prevRev = getRev(prevStart, curStart);
        long curOrders = orderRepo.countByStatusAndCreatedAtBetween("COMPLETED", curStart, curStart.plusMonths(1));
        long prevOrders = orderRepo.countByStatusAndCreatedAtBetween("COMPLETED", prevStart, curStart);

        double growth = prevRev == 0 ? 100 : ((curRev - prevRev) / prevRev) * 100;

        return RevenueSummaryResponse.builder()
                .currentMonthRevenue(curRev)
                .previousMonthRevenue(prevRev)
                .currentMonthOrders(curOrders)
                .previousMonthOrders(prevOrders)
                .growthRate(Math.round(growth * 100.0) / 100.0)
                .build();
    }

    private double getRev(LocalDateTime start, LocalDateTime end) {
        Double s = orderRepo.sumRevenueInRange("COMPLETED", start, end);
        return s != null ? s : 0.0;
    }

    @Override
    public CustomerSummaryResponse getCustomerSummary() {
        LocalDateTime curStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime prevStart = curStart.minusMonths(1);

        long curNew = orderRepo.countNewCustomersInRange("CANCELLED", curStart, curStart.plusMonths(1));
        long prevNew = orderRepo.countNewCustomersInRange("CANCELLED", prevStart, curStart);

        return CustomerSummaryResponse.builder()
                .currentNewCustomers(curNew)
                .previousNewCustomers(prevNew)
                .growthCount(curNew - prevNew)
                .build();
    }

    @Override
    public List<TrendResponse> getRevenueTrend() {
        YearMonth firstMonth = YearMonth.now().minusMonths(5);
        LocalDateTime start = firstMonth.atDay(1).atStartOfDay();
        Map<String, Double> values = orderRepo.getRevenueTrend("COMPLETED", start).stream()
                .map(r -> new TrendResponse(((Number) r[0]).intValue(), ((Number) r[1]).intValue(), ((Number) r[2]).doubleValue()))
                .collect(Collectors.toMap(r -> r.getYear() + "-" + r.getMonth(), TrendResponse::getValue));

        List<TrendResponse> result = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            YearMonth ym = firstMonth.plusMonths(i);
            result.add(new TrendResponse(
                    ym.getYear(),
                    ym.getMonthValue(),
                    values.getOrDefault(ym.getYear() + "-" + ym.getMonthValue(), 0.0)
            ));
        }
        return result;
    }

    @Override
    public List<TrendResponse> getCustomerTrend() {
        YearMonth firstMonth = YearMonth.now().minusMonths(5);
        LocalDateTime start = firstMonth.atDay(1).atStartOfDay();
        Map<String, Double> values = orderRepo.getCustomerTrend("CANCELLED", start).stream()
                .map(r -> new TrendResponse(((Number) r[0]).intValue(), ((Number) r[1]).intValue(), ((Number) r[2]).doubleValue()))
                .collect(Collectors.toMap(r -> r.getYear() + "-" + r.getMonth(), TrendResponse::getValue));

        List<TrendResponse> result = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            YearMonth ym = firstMonth.plusMonths(i);
            result.add(new TrendResponse(
                    ym.getYear(),
                    ym.getMonthValue(),
                    values.getOrDefault(ym.getYear() + "-" + ym.getMonthValue(), 0.0)
            ));
        }
        return result;
    }

    @Override
    public List<TopProductResponse> getTopProductsMonthly() {
        LocalDateTime start = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        return orderItemRepo.findTopProducts("COMPLETED", start, start.plusMonths(1), PageRequest.of(0, 4)).stream()
                .map(r -> TopProductResponse.builder()
                        .productId(Integer.valueOf(String.valueOf(r[0]))).productName((String) r[1])
                        .thumbnailUrl((String) r[2]).sold(((Number) r[3]).longValue())
                        .revenue(((Number) r[4]).doubleValue()).build())
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductCategorySummaryResponse> getProductCategorySummary() {
        return productRepo.getProductCategorySummary().stream()
                .map(row -> ProductCategorySummaryResponse.builder()
                        .categoryId(((Number) row[0]).intValue())
                        .categoryName((String) row[1])
                        .productCount(((Number) row[2]).longValue())
                        .totalStock(((Number) row[3]).longValue())
                        .build())
                .collect(Collectors.toList());
    }
}
