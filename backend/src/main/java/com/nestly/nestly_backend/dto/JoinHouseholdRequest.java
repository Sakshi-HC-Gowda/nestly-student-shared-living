package com.nestly.nestly_backend.dto;

import jakarta.validation.constraints.NotBlank;

public class JoinHouseholdRequest {

    @NotBlank(message = "Invite code is required")
    private String inviteCode;

    public String getInviteCode() {
        return inviteCode;
    }

    public void setInviteCode(String inviteCode) {
        this.inviteCode = inviteCode;
    }
}
