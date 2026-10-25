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

    @Test
    void createChoreSuccess() {
        User creator = mock(User.class);
        User assignee = mock(User.class);
        Household household = mock(Household.class);
        Chore savedChore = mock(Chore.class);

        when(creator.getId()).thenReturn(10L);
        when(creator.getName()).thenReturn("Creator");
        when(assignee.getId()).thenReturn(20L);
        when(assignee.getName()).thenReturn("Assignee");
        when(household.getId()).thenReturn(5L);

        when(userRepository.findByEmail("creator@test.com")).thenReturn(Optional.of(creator));
        when(householdRepository.findById(5L)).thenReturn(Optional.of(household));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(10L, 5L)).thenReturn(true);
        when(userRepository.findById(20L)).thenReturn(Optional.of(assignee));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(20L, 5L)).thenReturn(true);

        when(savedChore.getId()).thenReturn(50L);
        when(savedChore.getTitle()).thenReturn("Take out trash");
        when(savedChore.getDescription()).thenReturn("Bins to curb");
        when(savedChore.getDueDate()).thenReturn(LocalDate.now());
        when(savedChore.getStatus()).thenReturn(Chore.Status.PENDING);
        when(savedChore.getHousehold()).thenReturn(household);
        when(savedChore.getAssignedTo()).thenReturn(assignee);
        when(savedChore.getCreatedBy()).thenReturn(creator);
        when(savedChore.getCreatedAt()).thenReturn(LocalDateTime.now());
        when(choreRepository.save(org.mockito.ArgumentMatchers.any(Chore.class))).thenReturn(savedChore);

        com.nestly.nestly_backend.dto.ChoreRequest request = new com.nestly.nestly_backend.dto.ChoreRequest();
        request.setHouseholdId(5L);
        request.setAssignedToUserId(20L);
        request.setTitle("Take out trash");
        request.setDescription("Bins to curb");
        request.setDueDate(LocalDate.now());

        ChoreResponse response = choreService.createChore(request, "creator@test.com");

        assertEquals(50L, response.getId());
        assertEquals("Take out trash", response.getTitle());
        assertEquals(Chore.Status.PENDING, response.getStatus());
        verify(choreRepository).save(org.mockito.ArgumentMatchers.any(Chore.class));
    }

    @Test
    void createChoreThrowsNotFoundWhenCreatorNotFound() {
        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        com.nestly.nestly_backend.dto.ChoreRequest request = new com.nestly.nestly_backend.dto.ChoreRequest();
        request.setHouseholdId(1L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                choreService.createChore(request, "missing@test.com")
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void createChoreThrowsNotFoundWhenHouseholdNotFound() {
        User creator = mock(User.class);
        when(userRepository.findByEmail("creator@test.com")).thenReturn(Optional.of(creator));
        when(householdRepository.findById(99L)).thenReturn(Optional.empty());

        com.nestly.nestly_backend.dto.ChoreRequest request = new com.nestly.nestly_backend.dto.ChoreRequest();
        request.setHouseholdId(99L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                choreService.createChore(request, "creator@test.com")
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void createChoreThrowsForbiddenWhenCreatorNotMember() {
        User creator = mock(User.class);
        Household household = mock(Household.class);
        when(creator.getId()).thenReturn(10L);
        when(household.getId()).thenReturn(5L);

        when(userRepository.findByEmail("creator@test.com")).thenReturn(Optional.of(creator));
        when(householdRepository.findById(5L)).thenReturn(Optional.of(household));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(10L, 5L)).thenReturn(false);

        com.nestly.nestly_backend.dto.ChoreRequest request = new com.nestly.nestly_backend.dto.ChoreRequest();
        request.setHouseholdId(5L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                choreService.createChore(request, "creator@test.com")
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void createChoreThrowsNotFoundWhenAssignedUserNotFound() {
        User creator = mock(User.class);
        Household household = mock(Household.class);
        when(creator.getId()).thenReturn(10L);
        when(household.getId()).thenReturn(5L);

        when(userRepository.findByEmail("creator@test.com")).thenReturn(Optional.of(creator));
        when(householdRepository.findById(5L)).thenReturn(Optional.of(household));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(10L, 5L)).thenReturn(true);
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        com.nestly.nestly_backend.dto.ChoreRequest request = new com.nestly.nestly_backend.dto.ChoreRequest();
        request.setHouseholdId(5L);
        request.setAssignedToUserId(999L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                choreService.createChore(request, "creator@test.com")
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void createChoreThrowsForbiddenWhenAssignedUserNotMember() {
        User creator = mock(User.class);
        User assignee = mock(User.class);
        Household household = mock(Household.class);

        when(creator.getId()).thenReturn(10L);
        when(assignee.getId()).thenReturn(20L);
        when(household.getId()).thenReturn(5L);

        when(userRepository.findByEmail("creator@test.com")).thenReturn(Optional.of(creator));
        when(householdRepository.findById(5L)).thenReturn(Optional.of(household));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(10L, 5L)).thenReturn(true);
        when(userRepository.findById(20L)).thenReturn(Optional.of(assignee));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(20L, 5L)).thenReturn(false);

        com.nestly.nestly_backend.dto.ChoreRequest request = new com.nestly.nestly_backend.dto.ChoreRequest();
        request.setHouseholdId(5L);
        request.setAssignedToUserId(20L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                choreService.createChore(request, "creator@test.com")
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void getHouseholdChoresSuccess() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        Chore chore = mock(Chore.class);

        when(user.getId()).thenReturn(10L);
        when(user.getName()).thenReturn("User");
        when(household.getId()).thenReturn(5L);

        when(chore.getId()).thenReturn(100L);
        when(chore.getTitle()).thenReturn("Dishes");
        when(chore.getDescription()).thenReturn("Wash dishes");
        when(chore.getDueDate()).thenReturn(LocalDate.now());
        when(chore.getStatus()).thenReturn(Chore.Status.PENDING);
        when(chore.getHousehold()).thenReturn(household);
        when(chore.getAssignedTo()).thenReturn(user);
        when(chore.getCreatedBy()).thenReturn(user);
        when(chore.getCreatedAt()).thenReturn(LocalDateTime.now());

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(10L, 5L)).thenReturn(true);
        when(choreRepository.findByHouseholdId(5L)).thenReturn(java.util.List.of(chore));

        java.util.List<ChoreResponse> result = choreService.getHouseholdChores(5L, "user@test.com");

        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getId());
        assertEquals("Dishes", result.get(0).getTitle());
    }

    @Test
    void getHouseholdChoresThrowsForbiddenWhenNotMember() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(10L);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(10L, 5L)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                choreService.getHouseholdChores(5L, "user@test.com")
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }
}
