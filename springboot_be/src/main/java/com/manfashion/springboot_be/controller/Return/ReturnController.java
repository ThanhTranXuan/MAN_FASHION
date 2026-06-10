package com.manfashion.springboot_be.controller.Return;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Return.ReturnOrderRequest;
import com.manfashion.springboot_be.DTO.Return.ReturnOrderResponse;
import com.manfashion.springboot_be.service.Return.ReturnOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
public class ReturnController {

    private final ReturnOrderService returnService;

    // Helper: Lấy ID người dùng đang đăng nhập (Xác thực xem ai đang gọi API)
    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        return (principal instanceof String) ? (String) principal : null;
    }

    // 📃 GET all return orders (ADMIN/EMPLOYEE only, with optional filters)
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<Page<ReturnOrderResponse>> getAllReturns(Pageable pageable,
                                                                @RequestParam(required = false) String code,
                                                                @RequestParam(required = false) String keyword,
                                                                @RequestParam(required = false) String search,
                                                                @RequestParam(required = false) String q,
                                                                @RequestParam(required = false) String status) {
        Page<ReturnOrderResponse> returnOrders = returnService.getAll(
                firstNonBlank(code, keyword, search, q),
                status,
                pageable
        );

        return ApiResponse.<Page<ReturnOrderResponse>>builder()
                .message("return.get_all.success")
                .data(returnOrders)
                .build();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) return value;
        }
        return null;
    }

    // 🔍 Check new returns since timestamp (ADMIN/EMPLOYEE)
    @GetMapping("/has-new")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<Boolean> hasNewReturns(@RequestParam("since") long since) {
        boolean hasNew = returnService.hasNewReturnsAfter(since);

        return ApiResponse.<Boolean>builder()
                .message("return.check_new.success")
                .data(hasNew)
                .build();
    }

    // 🔄 UPDATE return order status (ADMIN/EMPLOYEE only)
    @PatchMapping("/{orderCode}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApiResponse<ReturnOrderResponse> updateReturnStatus(@PathVariable String orderCode,
                                                               @RequestParam String status,
                                                               @RequestParam(required = false) String rejectReason) {
        String processedById = getCurrentUserId();
        ReturnOrderResponse updatedReturn =
                returnService.updateStatus(orderCode, status, rejectReason, processedById);

        return ApiResponse.<ReturnOrderResponse>builder()
                .message("return.update_status.success")
                .data(updatedReturn)
                .build();
    }

    // 🔄 REQUEST a return (USER only)
    @PostMapping
    @PreAuthorize("hasAuthority('USER')")
    @ResponseStatus(HttpStatus.CREATED) // Trả về HTTP Status 201 Created
    public ApiResponse<ReturnOrderResponse> requestReturn(@RequestBody ReturnOrderRequest req) {
        String userId = getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("Unauthorized");
        }

        ReturnOrderResponse createdReturn = returnService.requestReturn(userId, req);

        return ApiResponse.<ReturnOrderResponse>builder()
                .message("return.request.success")
                .data(createdReturn)
                .build();
    }

    // 📄 GET my return orders (USER only)
    @GetMapping("/me")
    @PreAuthorize("hasAuthority('USER')")
    public ApiResponse<Page<ReturnOrderResponse>> getMyReturns(Pageable pageable) {
        String userId = getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("Unauthorized");
        }

        Page<ReturnOrderResponse> myReturns = returnService.getByUserId(userId, pageable);

        return ApiResponse.<Page<ReturnOrderResponse>>builder()
                .message("return.get_my.success")
                .data(myReturns)
                .build();
    }
}

