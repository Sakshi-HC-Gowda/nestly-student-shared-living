package com.nestly.nestly_backend.dto;

import com.nestly.nestly_backend.entity.HouseholdMember;

import java.time.LocalDateTime;

public class HouseholdMemberResponse {

    private final Long id;
    private final Long userId;
    private final String name;
    private final HouseholdMember.Role role;
    private final LocalDateTime joinedAt;

    public HouseholdMemberResponse(
            Long id,
            Long userId,
            String name,
            HouseholdMember.Role role,
            LocalDateTime joinedAt) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public HouseholdMember.Role getRole() {
        return role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }
}
