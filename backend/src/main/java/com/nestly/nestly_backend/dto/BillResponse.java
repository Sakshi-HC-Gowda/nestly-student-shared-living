package com.nestly.nestly_backend.dto;

import com.nestly.nestly_backend.entity.Bill.Status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BillResponse {

    private Long id;
    private String title;
    private BigDecimal amount;
    private LocalDate dueDate;
    private String category;
    private Status status;
    private Long householdId;
    private Long createdByUserId;
    private String createdByName;
    private LocalDateTime createdAt;

    public BillResponse(
            Long id,
            String title,
            BigDecimal amount,
            LocalDate dueDate,
            String category,
            Status status,
            Long householdId,
            Long createdByUserId,
            String createdByName,
            LocalDateTime createdAt) {

        this.id = id;
        this.title = title;
        this.amount = amount;
        this.dueDate = dueDate;
        this.category = category;
        this.status = status;
        this.householdId = householdId;
        this.createdByUserId = createdByUserId;
        this.createdByName = createdByName;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public String getCategory() {
        return category;
    }

    public Status getStatus() {
        return status;
    }

    public Long getHouseholdId() {
        return householdId;
    }

    public Long getCreatedByUserId() {
        return createdByUserId;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}