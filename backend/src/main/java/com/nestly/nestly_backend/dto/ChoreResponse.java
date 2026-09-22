package com.nestly.nestly_backend.dto;

import com.nestly.nestly_backend.entity.Chore.Status;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ChoreResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDate dueDate;
    private Status status;
    private Long householdId;
    private Long assignedToUserId;
    private String assignedToName;
    private Long createdByUserId;
    private String createdByName;
    private LocalDateTime createdAt;

    public ChoreResponse(
            Long id,
            String title,
            String description,
            LocalDate dueDate,
            Status status,
            Long householdId,
            Long assignedToUserId,
            String assignedToName,
            Long createdByUserId,
            String createdByName,
            LocalDateTime createdAt) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.status = status;
        this.householdId = householdId;
        this.assignedToUserId = assignedToUserId;
        this.assignedToName = assignedToName;
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

    public String getDescription() {
        return description;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public Status getStatus() {
        return status;
    }

    public Long getHouseholdId() {
        return householdId;
    }

    public Long getAssignedToUserId() {
        return assignedToUserId;
    }

    public String getAssignedToName() {
        return assignedToName;
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