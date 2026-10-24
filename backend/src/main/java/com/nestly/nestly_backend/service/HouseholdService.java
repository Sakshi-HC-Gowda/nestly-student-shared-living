package com.nestly.nestly_backend.service;

import com.nestly.nestly_backend.dto.HouseholdRequest;
import com.nestly.nestly_backend.dto.HouseholdMemberResponse;
import com.nestly.nestly_backend.dto.JoinHouseholdRequest;
import com.nestly.nestly_backend.entity.Household;
import com.nestly.nestly_backend.entity.HouseholdMember;
import com.nestly.nestly_backend.entity.User;
import com.nestly.nestly_backend.repository.HouseholdMemberRepository;
import com.nestly.nestly_backend.repository.HouseholdRepository;
import com.nestly.nestly_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.security.SecureRandom;

@Service
public class HouseholdService {

    private static final String INVITE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int INVITE_CODE_LENGTH = 6;

    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository householdMemberRepository;
    private final UserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public HouseholdService(
            HouseholdRepository householdRepository,
            HouseholdMemberRepository householdMemberRepository,
            UserRepository userRepository) {

        this.householdRepository = householdRepository;
        this.householdMemberRepository = householdMemberRepository;
        this.userRepository = userRepository;
    }

    public Household createHousehold(HouseholdRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Household household = new Household();
        household.setName(request.getName());
        household.setAccommodationType(request.getAccommodationType());
        household.setInviteCode(generateUniqueInviteCode());

        Household savedHousehold = householdRepository.save(household);

        HouseholdMember member = new HouseholdMember();
        member.setUser(user);
        member.setHousehold(savedHousehold);
        member.setRole(HouseholdMember.Role.OWNER);

        householdMemberRepository.save(member);

        return savedHousehold;
    }

    public List<Household> getMyHouseholds(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return householdMemberRepository.findByUserIdWithHousehold(user.getId())
        .stream()
        .map(HouseholdMember::getHousehold)
        .toList();
    }

    public List<HouseholdMemberResponse> getHouseholdMembers(Long householdId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!householdMemberRepository.existsByUserIdAndHouseholdId(user.getId(), householdId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a member of this household"
            );
        }

        return householdMemberRepository.findByHouseholdIdWithUser(householdId)
                .stream()
                .map(member -> new HouseholdMemberResponse(
                        member.getId(),
                        member.getUser().getId(),
                        member.getUser().getName(),
                        member.getRole(),
                        member.getJoinedAt()
                ))
                .toList();
    }

    public String getInviteCode(Long householdId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean isMember = householdMemberRepository
                .existsByUserIdAndHouseholdId(user.getId(), householdId);

        if (!isMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a member of this household"
            );
        }

        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Household not found"));

        if (household.getInviteCode() == null || household.getInviteCode().isBlank()) {
            household.setInviteCode(generateUniqueInviteCode());
            household = householdRepository.save(household);
        }

        return household.getInviteCode();
    }

    public Household joinHousehold(JoinHouseholdRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String inviteCode = normalizeInviteCode(request.getInviteCode());

        Household household = householdRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid invite code"));

        boolean alreadyMember = householdMemberRepository
                .existsByUserIdAndHouseholdId(user.getId(), household.getId());

        if (alreadyMember) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You are already a member of this household"
            );
        }

        HouseholdMember member = new HouseholdMember();
        member.setUser(user);
        member.setHousehold(household);
        member.setRole(HouseholdMember.Role.MEMBER);

        householdMemberRepository.save(member);

        return household;
    }

    private String generateUniqueInviteCode() {
        String inviteCode;
        do {
            inviteCode = generateInviteCode();
        } while (householdRepository.existsByInviteCode(inviteCode));

        return inviteCode;
    }

    private String generateInviteCode() {
        StringBuilder inviteCode = new StringBuilder(INVITE_CODE_LENGTH);

        for (int i = 0; i < INVITE_CODE_LENGTH; i++) {
            int index = secureRandom.nextInt(INVITE_CODE_CHARS.length());
            inviteCode.append(INVITE_CODE_CHARS.charAt(index));
        }

        return inviteCode.toString();
    }

    private String normalizeInviteCode(String inviteCode) {
        return inviteCode.trim().toUpperCase();
    }
}
