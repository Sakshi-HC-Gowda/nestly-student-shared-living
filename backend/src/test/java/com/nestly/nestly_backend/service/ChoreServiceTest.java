package com.nestly.nestly_backend.service;

import com.nestly.nestly_backend.dto.ChoreResponse;
import com.nestly.nestly_backend.entity.Chore;
import com.nestly.nestly_backend.entity.Household;
import com.nestly.nestly_backend.entity.User;
import com.nestly.nestly_backend.repository.ChoreRepository;
import com.nestly.nestly_backend.repository.HouseholdMemberRepository;
import com.nestly.nestly_backend.repository.HouseholdRepository;
import com.nestly.nestly_backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ChoreServiceTest {

    private final ChoreRepository choreRepository = mock(ChoreRepository.class);
    private final HouseholdRepository householdRepository = mock(HouseholdRepository.class);
    private final HouseholdMemberRepository householdMemberRepository = mock(HouseholdMemberRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);

    private final ChoreService choreService = new ChoreService(
            choreRepository,
            householdRepository,
            householdMemberRepository,
            userRepository
    );

    @Test
    void completeChoreSetsStatusCompletedWhenMemberAuthorized() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        Chore chore = mock(Chore.class);

        when(user.getId()).thenReturn(10L);
        when(user.getName()).thenReturn("Test User");
        when(household.getId()).thenReturn(5L);

        when(chore.getId()).thenReturn(100L);
        when(chore.getTitle()).thenReturn("Clean kitchen");
        when(chore.getDescription()).thenReturn("Clean counters and stove");
        when(chore.getDueDate()).thenReturn(LocalDate.now());
        when(chore.getStatus()).thenReturn(Chore.Status.COMPLETED);
        when(chore.getHousehold()).thenReturn(household);
        when(chore.getAssignedTo()).thenReturn(user);
        when(chore.getCreatedBy()).thenReturn(user);
        when(chore.getCreatedAt()).thenReturn(LocalDateTime.now());

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(choreRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(chore));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(10L, 5L)).thenReturn(true);
        when(choreRepository.save(chore)).thenReturn(chore);

        ChoreResponse response = choreService.completeChore(100L, "user@test.com");

        assertEquals(Chore.Status.COMPLETED, response.getStatus());
        assertEquals("Clean kitchen", response.getTitle());
        verify(chore).setStatus(Chore.Status.COMPLETED);
        verify(choreRepository).save(chore);
    }

    @Test
    void completeChoreThrowsNotFoundWhenUserDoesNotExist() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                choreService.completeChore(100L, "unknown@test.com")
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void completeChoreThrowsNotFoundWhenChoreDoesNotExist() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(10L);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(choreRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                choreService.completeChore(999L, "user@test.com")
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void completeChoreThrowsForbiddenWhenUserNotInHousehold() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        Chore chore = mock(Chore.class);

        when(user.getId()).thenReturn(10L);
        when(household.getId()).thenReturn(5L);
        when(chore.getId()).thenReturn(100L);
        when(chore.getHousehold()).thenReturn(household);

        when(userRepository.findByEmail("intruder@test.com")).thenReturn(Optional.of(user));
        when(choreRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(chore));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(10L, 5L)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                choreService.completeChore(100L, "intruder@test.com")
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }
}
