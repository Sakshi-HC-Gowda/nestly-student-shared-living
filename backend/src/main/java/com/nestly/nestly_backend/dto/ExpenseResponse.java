package com.nestly.nestly_backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ExpenseResponse {

    private Long id;
    private String description;
    private BigDecimal amount;
    private String category;
    private Long householdId;
    private Long paidByUserId;
    private String paidByName;
    private LocalDateTime createdAt;

    public ExpenseResponse(
            Long id,
            String description,
            BigDecimal amount,
            String category,
            Long householdId,
            Long paidByUserId,
            String paidByName,
            LocalDateTime createdAt) {

        this.id = id;
        this.description = description;
        this.amount = amount;
        this.category = category;
        this.householdId = householdId;
        this.paidByUserId = paidByUserId;
        this.paidByName = paidByName;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCategory() {
        return category;
    }

    public Long getHouseholdId() {
        return householdId;
    }

    public Long getPaidByUserId() {
        return paidByUserId;
    }

    public String getPaidByName() {
        return paidByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}