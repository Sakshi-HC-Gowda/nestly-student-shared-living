package com.nestly.nestly_backend.dto;

import jakarta.validation.constraints.NotBlank;

public class HouseholdRequest {

    @NotBlank(message = "Household name is required")
    private String name;

    @NotBlank(message = "Accommodation type is required")
    private String accommodationType;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAccommodationType() {
        return accommodationType;
    }

    public void setAccommodationType(String accommodationType) {
        this.accommodationType = accommodationType;
    }
}