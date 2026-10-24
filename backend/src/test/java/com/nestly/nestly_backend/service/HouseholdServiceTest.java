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
}
