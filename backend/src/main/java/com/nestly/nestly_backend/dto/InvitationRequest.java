package com.nestly.nestly_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class InvitationRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    private String invitedEmail;

    public String getInvitedEmail() {
        return invitedEmail;
    }

    public void setInvitedEmail(String invitedEmail) {
        this.invitedEmail = invitedEmail;
    }
}