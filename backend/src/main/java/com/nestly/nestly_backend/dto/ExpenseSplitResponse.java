package com.nestly.nestly_backend.dto;

import java.math.BigDecimal;

public class ExpenseSplitResponse {

    private Long id;
    private Long userId;
    private String userName;
    private BigDecimal amount;

    public ExpenseSplitResponse(
            Long id,
            Long userId,
            String userName,
            BigDecimal amount) {

        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.amount = amount;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public BigDecimal getAmount() {
        return amount;
    }
}