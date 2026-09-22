package com.nestly.nestly_backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class GroceryRequest {

    @NotBlank(message = "Grocery name is required")
    private String name;

    @NotBlank(message = "Quantity is required")
    private String quantity;

    @DecimalMin(
            value = "0.00",
            inclusive = true,
            message = "Estimated price cannot be negative"
    )
    private BigDecimal estimatedPrice;

    @NotNull(message = "Household ID is required")
    private Long householdId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getQuantity() {
        return quantity;
    }

    public void setQuantity(String quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getEstimatedPrice() {
        return estimatedPrice;
    }

    public void setEstimatedPrice(BigDecimal estimatedPrice) {
        this.estimatedPrice = estimatedPrice;
    }

    public Long getHouseholdId() {
        return householdId;
    }

    public void setHouseholdId(Long householdId) {
        this.householdId = householdId;
    }
}