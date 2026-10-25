package com.nestly.nestly_backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public class UpdateGroceryRequest {

    @NotBlank(message = "Grocery name is required")
    private String name;

    private String quantity;

    @DecimalMin(
            value = "0.00",
            inclusive = true,
            message = "Estimated price cannot be negative"
    )
    private BigDecimal estimatedPrice;

    public UpdateGroceryRequest() {
    }

    public UpdateGroceryRequest(String name, String quantity, BigDecimal estimatedPrice) {
        this.name = name;
        this.quantity = quantity;
        this.estimatedPrice = estimatedPrice;
    }

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
}
