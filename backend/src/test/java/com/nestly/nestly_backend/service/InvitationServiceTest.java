package com.nestly.nestly_backend.service;

import com.nestly.nestly_backend.dto.InvitationRequest;
import com.nestly.nestly_backend.entity.Household;
import com.nestly.nestly_backend.entity.HouseholdMember;
import com.nestly.nestly_backend.entity.Invitation;
import com.nestly.nestly_backend.entity.User;
import com.nestly.nestly_backend.repository.HouseholdMemberRepository;
import com.nestly.nestly_backend.repository.HouseholdRepository;
import com.nestly.nestly_backend.repository.InvitationRepository;
import com.nestly.nestly_backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InvitationServiceTest {

    private final InvitationRepository invitationRepository = mock(InvitationRepository.class);
    private final HouseholdRepository householdRepository = mock(HouseholdRepository.class);
    private final HouseholdMemberRepository householdMemberRepository = mock(HouseholdMemberRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);

    private final InvitationService invitationService = new InvitationService(
            invitationRepository,
            householdRepository,
            householdMemberRepository,
            userRepository
    );

    @Test
    void inviteMemberSuccessWhenRequesterIsOwner() {
        User owner = mock(User.class);
        Household household = mock(Household.class);
        HouseholdMember ownerMembership = mock(HouseholdMember.class);
        Invitation invitation = mock(Invitation.class);

        when(owner.getId()).thenReturn(1L);
        when(household.getId()).thenReturn(10L);
        when(ownerMembership.getHousehold()).thenReturn(household);
        when(ownerMembership.getRole()).thenReturn(HouseholdMember.Role.OWNER);

        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(householdMemberRepository.findByUserId(1L)).thenReturn(List.of(ownerMembership));
        when(householdRepository.findById(10L)).thenReturn(Optional.of(household));
        when(invitationRepository.save(any(Invitation.class))).thenReturn(invitation);

        InvitationRequest request = new InvitationRequest();
        request.setInvitedEmail("newmate@example.com");

        Invitation result = invitationService.inviteMember(10L, request, "owner@example.com");

        assertEquals(invitation, result);
        verify(invitationRepository).save(any(Invitation.class));
    }

    @Test
    void inviteMemberThrowsForbiddenWhenRequesterIsNotOwner() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        HouseholdMember member = mock(HouseholdMember.class);

        when(user.getId()).thenReturn(2L);
        when(household.getId()).thenReturn(10L);
        when(member.getHousehold()).thenReturn(household);
        when(member.getRole()).thenReturn(HouseholdMember.Role.MEMBER);

        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(user));
        when(householdMemberRepository.findByUserId(2L)).thenReturn(List.of(member));

        InvitationRequest request = new InvitationRequest();
        request.setInvitedEmail("newmate@example.com");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                invitationService.inviteMember(10L, request, "member@example.com")
        );
        assertEquals(403, ex.getStatusCode().value());
    }

    @Test
    void acceptInvitationSuccess() {
        Invitation invitation = mock(Invitation.class);
        User user = mock(User.class);
        Household household = mock(Household.class);

        when(user.getId()).thenReturn(3L);
        when(household.getId()).thenReturn(10L);
        when(invitation.getStatus()).thenReturn(Invitation.Status.PENDING);
        when(invitation.getHousehold()).thenReturn(household);

        when(invitationRepository.findByIdAndInvitedEmail(50L, "invited@example.com"))
                .thenReturn(Optional.of(invitation));
        when(userRepository.findByEmail("invited@example.com")).thenReturn(Optional.of(user));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(3L, 10L)).thenReturn(false);
        when(invitationRepository.save(invitation)).thenReturn(invitation);

        Invitation result = invitationService.acceptInvitation(50L, "invited@example.com");

        assertEquals(invitation, result);
        verify(invitation).setStatus(Invitation.Status.ACCEPTED);
        verify(householdMemberRepository).save(any(HouseholdMember.class));
    }

    @Test
    void acceptInvitationThrowsBadRequestWhenAlreadyAccepted() {
        Invitation invitation = mock(Invitation.class);
        when(invitation.getStatus()).thenReturn(Invitation.Status.ACCEPTED);

        when(invitationRepository.findByIdAndInvitedEmail(50L, "invited@example.com"))
                .thenReturn(Optional.of(invitation));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                invitationService.acceptInvitation(50L, "invited@example.com")
        );
        assertEquals(400, ex.getStatusCode().value());
    }
}
