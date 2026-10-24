package com.nestly.nestly_backend.dto;

public class InviteCodeResponse {

    private String inviteCode;

    public InviteCodeResponse(String inviteCode) {
        this.inviteCode = inviteCode;
    }

    public String getInviteCode() {
        return inviteCode;
    }
}
