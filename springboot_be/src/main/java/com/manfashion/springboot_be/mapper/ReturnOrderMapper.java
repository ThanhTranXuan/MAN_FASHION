package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.Return.ReturnItemResponse;
import com.manfashion.springboot_be.DTO.Return.ReturnOrderResponse;
import com.manfashion.springboot_be.entity.ReturnItem;
import com.manfashion.springboot_be.entity.ReturnOrder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReturnOrderMapper {

    @Mapping(source = "orderItem.id", target = "orderItemId")
    ReturnItemResponse toItemResponse(ReturnItem item);

    @Mapping(source = "order.id", target = "orderId")
    @Mapping(source = "order.orderCode", target = "orderCode")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "processedBy.id", target = "processedById")
    @Mapping(source = "processedBy.fullName", target = "processedByName")
    @Mapping(target = "items", ignore = true)
    ReturnOrderResponse toResponse(ReturnOrder returnOrder);

    default ReturnOrderResponse toResponse(ReturnOrder returnOrder, List<ReturnItem> items) {
        ReturnOrderResponse response = toResponse(returnOrder);
        response.setItems(items.stream().map(this::toItemResponse).toList());
        return response;
    }
}
