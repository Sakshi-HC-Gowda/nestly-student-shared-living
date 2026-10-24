package com.nestly.nestly_backend.controller;

import com.nestly.nestly_backend.dto.HouseholdRequest;
import com.nestly.nestly_backend.dto.HouseholdMemberResponse;
import com.nestly.nestly_backend.dto.InviteCodeResponse;
import com.nestly.nestly_backend.dto.JoinHouseholdRequest;
import com.nestly.nestly_backend.entity.Household;
import com.nestly.nestly_backend.service.HouseholdService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/households")
public class HouseholdController {

    private final HouseholdService householdService;

    public HouseholdController(HouseholdService householdService) {
        this.householdService = householdService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Household createHousehold(
            @Valid @RequestBody HouseholdRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        return householdService.createHousehold(request, email);
    }

    @GetMapping
    public List<Household> getMyHouseholds(Authentication authentication) {

        String email = authentication.getName();

        return householdService.getMyHouseholds(email);
    }

    @GetMapping("/{householdId}/members")
    public List<HouseholdMemberResponse> getHouseholdMembers(
            @PathVariable Long householdId,
            Authentication authentication) {

        return householdService.getHouseholdMembers(
                householdId,
                authentication.getName()
        );
    }

    @GetMapping("/{householdId}/invite-code")
    public InviteCodeResponse getInviteCode(
            @PathVariable Long householdId,
            Authentication authentication) {

        return new InviteCodeResponse(
                householdService.getInviteCode(
                        householdId,
                        authentication.getName()
                )
        );
    }

    @PostMapping("/join")
    public Household joinHousehold(
            @Valid @RequestBody JoinHouseholdRequest request,
            Authentication authentication) {

        return householdService.joinHousehold(
                request,
                authentication.getName()
        );
    }
}
