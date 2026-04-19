package com.manfashion.springboot_be.service.Return;

import com.manfashion.springboot_be.DTO.Return.ReturnOrderRequest;
import com.manfashion.springboot_be.DTO.Return.ReturnOrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReturnOrderService {
    // 🟢 USER REQUEST RETURN
    ReturnOrderResponse requestReturn(String userId, ReturnOrderRequest req);

    // 🟣 ADMIN UPDATE STATUS
    ReturnOrderResponse updateStatus(String returnCode, String status);

    // 📃 ADMIN GET ALL
    Page<ReturnOrderResponse> getAll(String code, String status, Pageable pageable);

    // 👤 USER: GET BY USER
    Page<ReturnOrderResponse> getByUserId(String userId, Pageable pageable);

    // 🔍 Check new returns after timestamp
    boolean hasNewReturnsAfter(long sinceMillis);
}
