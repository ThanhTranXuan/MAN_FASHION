package com.manfashion.springboot_be.service.Return;

import com.manfashion.springboot_be.DTO.Return.ReturnOrderRequest;
import com.manfashion.springboot_be.DTO.Return.ReturnOrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReturnOrderService {

    ReturnOrderResponse requestReturn(String userId, ReturnOrderRequest req);


    ReturnOrderResponse updateStatus(String returnCode, String status, String rejectReason, String processedById);


    Page<ReturnOrderResponse> getAll(String code, String status, Pageable pageable);


    Page<ReturnOrderResponse> getByUserId(String userId, Pageable pageable);


    boolean hasNewReturnsAfter(long sinceMillis);
}
