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
import org.springframework.stereotype.Service;

@Service
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository householdMemberRepository;
    private final UserRepository userRepository;

    public InvitationService(
            InvitationRepository invitationRepository,
            HouseholdRepository householdRepository,
            HouseholdMemberRepository householdMemberRepository,
            UserRepository userRepository) {

        this.invitationRepository = invitationRepository;
        this.householdRepository = householdRepository;
        this.householdMemberRepository = householdMemberRepository;
        this.userRepository = userRepository;
    }

    public Invitation inviteMember(
            Long householdId,
            InvitationRequest request,
            String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));

        HouseholdMember ownerMembership =
                householdMemberRepository
                        .findByUserId(owner.getId())
                        .stream()
                        .filter(member ->
                                member.getHousehold().getId().equals(householdId)
                                        && member.getRole() == HouseholdMember.Role.OWNER)
                        .findFirst()
                        .orElseThrow(() ->
                                new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Only the household owner can invite members"));

        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Household not found"));

        Invitation invitation = new Invitation();
        invitation.setHousehold(household);
        invitation.setInvitedEmail(request.getInvitedEmail());

        return invitationRepository.save(invitation);
    }
    public Invitation acceptInvitation(Long invitationId, String userEmail) {

        Invitation invitation = invitationRepository
                .findByIdAndInvitedEmail(invitationId, userEmail)
                .orElseThrow(() ->
                        new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Invitation not found"));

        if (invitation.getStatus() != Invitation.Status.PENDING) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invitation is no longer pending");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));

        Household household = invitation.getHousehold();

        boolean alreadyMember = householdMemberRepository
                .existsByUserIdAndHouseholdId(user.getId(), household.getId());

        if (!alreadyMember) {
            HouseholdMember member = new HouseholdMember();
            member.setUser(user);
            member.setHousehold(household);
            member.setRole(HouseholdMember.Role.MEMBER);

            householdMemberRepository.save(member);
        }

        invitation.setStatus(Invitation.Status.ACCEPTED);

        return invitationRepository.save(invitation);
    }
}