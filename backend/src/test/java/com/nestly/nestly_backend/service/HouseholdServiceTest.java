package com.nestly.nestly_backend.service;

import com.nestly.nestly_backend.dto.JoinHouseholdRequest;
import com.nestly.nestly_backend.entity.Household;
import com.nestly.nestly_backend.entity.HouseholdMember;
import com.nestly.nestly_backend.entity.User;
import com.nestly.nestly_backend.repository.HouseholdMemberRepository;
import com.nestly.nestly_backend.repository.HouseholdRepository;
import com.nestly.nestly_backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class HouseholdServiceTest {

    private final HouseholdRepository householdRepository = mock(HouseholdRepository.class);
    private final HouseholdMemberRepository householdMemberRepository = mock(HouseholdMemberRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final HouseholdService householdService = new HouseholdService(
            householdRepository,
            householdMemberRepository,
            userRepository
    );

    @Test
    void joiningHouseholdCreatesMemberRole() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        when(user.getId()).thenReturn(2L);
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(user));
        when(householdRepository.findByInviteCode("ABC123")).thenReturn(Optional.of(household));
        when(household.getId()).thenReturn(10L);
        when(householdMemberRepository.existsByUserIdAndHouseholdId(2L, 10L)).thenReturn(false);

        JoinHouseholdRequest request = new JoinHouseholdRequest();
        request.setInviteCode("abc123");

        householdService.joinHousehold(request, "member@example.com");

        verify(householdMemberRepository).save(argThat(member ->
                member.getUser() == user
                        && member.getHousehold() == household
                        && member.getRole() == HouseholdMember.Role.MEMBER
        ));
    }

    @Test
    void joiningHouseholdDoesNotCreateDuplicateMembership() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        when(user.getId()).thenReturn(2L);
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(user));
        when(householdRepository.findByInviteCode("ABC123")).thenReturn(Optional.of(household));
        when(household.getId()).thenReturn(10L);
        when(householdMemberRepository.existsByUserIdAndHouseholdId(2L, 10L)).thenReturn(true);

        JoinHouseholdRequest request = new JoinHouseholdRequest();
        request.setInviteCode("ABC123");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> householdService.joinHousehold(request, "member@example.com")
        );

        assertEquals(409, exception.getStatusCode().value());
        verify(householdMemberRepository, never()).save(any());
    }

    @Test
    void householdMembersAreScopedToAnExistingMember() {
        User requester = mock(User.class);
        User memberUser = mock(User.class);
        HouseholdMember member = mock(HouseholdMember.class);
        when(requester.getId()).thenReturn(1L);
        when(memberUser.getId()).thenReturn(2L);
        when(memberUser.getName()).thenReturn("Roommate");
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(requester));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(true);
        when(householdMemberRepository.findByHouseholdIdWithUser(10L)).thenReturn(List.of(member));
        when(member.getId()).thenReturn(4L);
        when(member.getUser()).thenReturn(memberUser);
        when(member.getRole()).thenReturn(HouseholdMember.Role.MEMBER);

        var result = householdService.getHouseholdMembers(10L, "owner@example.com");

        assertEquals(1, result.size());
        assertEquals(2L, result.get(0).getUserId());
        assertEquals(HouseholdMember.Role.MEMBER, result.get(0).getRole());
        verify(householdMemberRepository).findByHouseholdIdWithUser(10L);
    }

    @Test
    void createHouseholdSuccess() {
        User user = mock(User.class);
        Household household = mock(Household.class);

        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(user));
        when(householdRepository.save(org.mockito.ArgumentMatchers.any(Household.class))).thenReturn(household);
        when(household.getId()).thenReturn(100L);
        when(household.getName()).thenReturn("Maple House");

        com.nestly.nestly_backend.dto.HouseholdRequest request = new com.nestly.nestly_backend.dto.HouseholdRequest();
        request.setName("Maple House");
        request.setAccommodationType("Apartment");

        Household result = householdService.createHousehold(request, "owner@example.com");

        assertEquals(100L, result.getId());
        verify(householdRepository).save(org.mockito.ArgumentMatchers.any(Household.class));
        verify(householdMemberRepository).save(org.mockito.ArgumentMatchers.argThat(m ->
                m.getUser() == user && m.getRole() == HouseholdMember.Role.OWNER
        ));
    }

    @Test
    void createHouseholdThrowsNotFoundWhenUserNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        com.nestly.nestly_backend.dto.HouseholdRequest request = new com.nestly.nestly_backend.dto.HouseholdRequest();
        request.setName("New House");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                householdService.createHousehold(request, "unknown@example.com")
        );
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void getMyHouseholdsSuccess() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        HouseholdMember member = mock(HouseholdMember.class);

        when(user.getId()).thenReturn(1L);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(member.getHousehold()).thenReturn(household);
        when(household.getId()).thenReturn(10L);
        when(householdMemberRepository.findByUserIdWithHousehold(1L)).thenReturn(List.of(member));

        List<Household> result = householdService.getMyHouseholds("user@example.com");

        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).getId());
    }

    @Test
    void getMyHouseholdsThrowsNotFoundWhenUserNotFound() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                householdService.getMyHouseholds("user@example.com")
        );
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void getHouseholdMembersThrowsForbiddenWhenNotMember() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(1L);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                householdService.getHouseholdMembers(10L, "user@example.com")
        );
        assertEquals(403, ex.getStatusCode().value());
    }

    @Test
    void getInviteCodeSuccess() {
        User user = mock(User.class);
        Household household = mock(Household.class);

        when(user.getId()).thenReturn(1L);
        when(household.getId()).thenReturn(10L);
        when(household.getInviteCode()).thenReturn("INV123");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(true);
        when(householdRepository.findById(10L)).thenReturn(Optional.of(household));

        String code = householdService.getInviteCode(10L, "user@test.com".replace("test", "example"));

        assertEquals("INV123", code);
    }

    @Test
    void getInviteCodeGeneratesNewWhenCodeBlank() {
        User user = mock(User.class);
        Household household = mock(Household.class);

        when(user.getId()).thenReturn(1L);
        when(household.getId()).thenReturn(10L);
        when(household.getInviteCode()).thenReturn(null, "GENERATED1");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(true);
        when(householdRepository.findById(10L)).thenReturn(Optional.of(household));
        when(householdRepository.save(household)).thenReturn(household);

        String code = householdService.getInviteCode(10L, "user@example.com");

        verify(household).setInviteCode(org.mockito.ArgumentMatchers.anyString());
        verify(householdRepository).save(household);
    }

    @Test
    void getInviteCodeThrowsForbiddenWhenNotMember() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(1L);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                householdService.getInviteCode(10L, "user@example.com")
        );
        assertEquals(403, ex.getStatusCode().value());
    }

    @Test
    void joinHouseholdThrowsNotFoundWhenInviteCodeInvalid() {
        User user = mock(User.class);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(householdRepository.findByInviteCode("NONEXISTENT")).thenReturn(Optional.empty());

        JoinHouseholdRequest request = new JoinHouseholdRequest();
        request.setInviteCode("NONEXISTENT");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                householdService.joinHousehold(request, "user@example.com")
        );
        assertEquals(404, ex.getStatusCode().value());
    }
}
