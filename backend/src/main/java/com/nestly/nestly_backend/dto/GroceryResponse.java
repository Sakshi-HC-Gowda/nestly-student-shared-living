package com.nestly.nestly_backend.dto;

import com.nestly.nestly_backend.entity.GroceryItem.Status;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class GroceryResponse {

    private Long id;
    private String name;
    private String quantity;
    private BigDecimal estimatedPrice;
    private Status status;
    private Long householdId;
    private Long addedByUserId;
    private String addedByName;
    private LocalDateTime createdAt;

    public GroceryResponse(
            Long id,
            String name,
            String quantity,
            BigDecimal estimatedPrice,
            Status status,
            Long householdId,
            Long addedByUserId,
            String addedByName,
            LocalDateTime createdAt) {

        this.id = id;
        this.name = name;
        this.quantity = quantity;
        this.estimatedPrice = estimatedPrice;
        this.status = status;
        this.householdId = householdId;
        this.addedByUserId = addedByUserId;
        this.addedByName = addedByName;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getQuantity() {
        return quantity;
    }

    public BigDecimal getEstimatedPrice() {
        return estimatedPrice;
    }

    public Status getStatus() {
        return status;
    }

    public Long getHouseholdId() {
        return householdId;
    }

    public Long getAddedByUserId() {
        return addedByUserId;
    }

    public String getAddedByName() {
        return addedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}