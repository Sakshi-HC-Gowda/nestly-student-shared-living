package com.nestly.nestly_backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class ExpenseSplitRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Split amount is required")
    @DecimalMin(value = "0.01", message = "Split amount must be greater than 0")
    private BigDecimal amount;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}