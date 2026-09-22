package com.nestly.nestly_backend.controller;

import com.nestly.nestly_backend.dto.InvitationRequest;
import com.nestly.nestly_backend.entity.Invitation;
import com.nestly.nestly_backend.service.InvitationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/households")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @PostMapping("/{householdId}/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    public Invitation inviteMember(
            @PathVariable Long householdId,
            @Valid @RequestBody InvitationRequest request,
            Authentication authentication) {

        return invitationService.inviteMember(
                householdId,
                request,
                authentication.getName()
        );
    }
    @PutMapping("/invitations/{invitationId}/accept")
    public Invitation acceptInvitation(
            @PathVariable Long invitationId,
            Authentication authentication) {

        return invitationService.acceptInvitation(
                invitationId,
                authentication.getName()
        );
    }
}