package com.nestly.nestly_backend.service;

import com.nestly.nestly_backend.dto.ExpenseResponse;
import com.nestly.nestly_backend.dto.ExpenseSplitResponse;
import com.nestly.nestly_backend.entity.Expense;
import com.nestly.nestly_backend.entity.ExpenseSplit;
import com.nestly.nestly_backend.entity.Household;
import com.nestly.nestly_backend.entity.User;
import com.nestly.nestly_backend.repository.ExpenseRepository;
import com.nestly.nestly_backend.repository.ExpenseSplitRepository;
import com.nestly.nestly_backend.repository.HouseholdMemberRepository;
import com.nestly.nestly_backend.repository.HouseholdRepository;
import com.nestly.nestly_backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ExpenseServiceTest {

    private final ExpenseRepository expenseRepository = mock(ExpenseRepository.class);
    private final ExpenseSplitRepository expenseSplitRepository = mock(ExpenseSplitRepository.class);
    private final HouseholdRepository householdRepository = mock(HouseholdRepository.class);
    private final HouseholdMemberRepository householdMemberRepository = mock(HouseholdMemberRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final ExpenseService expenseService = new ExpenseService(
            expenseRepository,
            expenseSplitRepository,
            householdRepository,
            householdMemberRepository,
            userRepository
    );

    @Test
    void authorizedMemberCanRetrieveHouseholdExpensesWithPayerDetails() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        Expense expense = mock(Expense.class);
        when(user.getId()).thenReturn(2L);
        when(user.getName()).thenReturn("Member");
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(user));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(2L, 3L)).thenReturn(true);
        when(expenseRepository.findByHouseholdId(3L)).thenReturn(List.of(expense));
        when(expense.getId()).thenReturn(11L);
        when(expense.getDescription()).thenReturn("Utilities");
        when(expense.getAmount()).thenReturn(new BigDecimal("25.00"));
        when(expense.getCategory()).thenReturn("Utilities");
        when(expense.getHousehold()).thenReturn(household);
        when(expense.getPaidBy()).thenReturn(user);
        when(expense.getCreatedAt()).thenReturn(LocalDateTime.now());
        when(household.getId()).thenReturn(3L);

        List<ExpenseResponse> result =
                expenseService.getHouseholdExpenses(3L, "member@example.com");

        assertEquals(1, result.size());
        assertEquals(11L, result.get(0).getId());
        assertEquals(3L, result.get(0).getHouseholdId());
        assertEquals(2L, result.get(0).getPaidByUserId());
        assertEquals("Member", result.get(0).getPaidByName());
    }

    @Test
    void nonMemberCannotRetrieveHouseholdExpenses() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(9L);
        when(userRepository.findByEmail("outsider@example.com")).thenReturn(Optional.of(user));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(9L, 3L)).thenReturn(false);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> expenseService.getHouseholdExpenses(3L, "outsider@example.com")
        );

        assertEquals(403, exception.getStatusCode().value());
    }

    @Test
    void authorizedMemberCanRetrieveExpenseSplitsWithParticipantDetails() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        Expense expense = mock(Expense.class);
        User participant = mock(User.class);
        ExpenseSplit split = mock(ExpenseSplit.class);

        when(user.getId()).thenReturn(2L);
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(user));
        when(expenseRepository.findById(11L)).thenReturn(Optional.of(expense));
        when(expense.getHousehold()).thenReturn(household);
        when(household.getId()).thenReturn(3L);
        when(householdMemberRepository.existsByUserIdAndHouseholdId(2L, 3L)).thenReturn(true);

        when(participant.getId()).thenReturn(5L);
        when(participant.getName()).thenReturn("Participant 5");
        when(split.getId()).thenReturn(101L);
        when(split.getUser()).thenReturn(participant);
        when(split.getAmount()).thenReturn(new BigDecimal("12.50"));
        when(expenseSplitRepository.findByExpenseId(11L)).thenReturn(List.of(split));

        List<ExpenseSplitResponse> result =
                expenseService.getExpenseSplits(11L, "member@example.com");

        assertEquals(1, result.size());
        assertEquals(101L, result.get(0).getId());
        assertEquals(5L, result.get(0).getUserId());
        assertEquals("Participant 5", result.get(0).getUserName());
        assertEquals(new BigDecimal("12.50"), result.get(0).getAmount());
    }

    @Test
    void nonMemberCannotRetrieveExpenseSplits() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        Expense expense = mock(Expense.class);

        when(user.getId()).thenReturn(9L);
        when(userRepository.findByEmail("outsider@example.com")).thenReturn(Optional.of(user));
        when(expenseRepository.findById(11L)).thenReturn(Optional.of(expense));
        when(expense.getHousehold()).thenReturn(household);
        when(household.getId()).thenReturn(3L);
        when(householdMemberRepository.existsByUserIdAndHouseholdId(9L, 3L)).thenReturn(false);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> expenseService.getExpenseSplits(11L, "outsider@example.com")
        );

        assertEquals(403, exception.getStatusCode().value());
    }

    @Test
    void createExpenseSuccessWithSplits() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        User splitUser = mock(User.class);
        Expense savedExpense = mock(Expense.class);

        when(user.getId()).thenReturn(2L);
        when(user.getName()).thenReturn("Member");
        when(household.getId()).thenReturn(3L);
        when(splitUser.getId()).thenReturn(5L);

        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(user));
        when(householdRepository.findById(3L)).thenReturn(Optional.of(household));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(2L, 3L)).thenReturn(true);
        when(householdMemberRepository.existsByUserIdAndHouseholdId(5L, 3L)).thenReturn(true);
        when(userRepository.findById(5L)).thenReturn(Optional.of(splitUser));

        when(savedExpense.getId()).thenReturn(20L);
        when(savedExpense.getDescription()).thenReturn("Groceries");
        when(savedExpense.getAmount()).thenReturn(new BigDecimal("50.00"));
        when(savedExpense.getCategory()).thenReturn("Food");
        when(savedExpense.getHousehold()).thenReturn(household);
        when(savedExpense.getPaidBy()).thenReturn(user);
        when(savedExpense.getCreatedAt()).thenReturn(LocalDateTime.now());
        when(expenseRepository.save(org.mockito.ArgumentMatchers.any(Expense.class))).thenReturn(savedExpense);

        com.nestly.nestly_backend.dto.ExpenseRequest request = new com.nestly.nestly_backend.dto.ExpenseRequest();
        request.setHouseholdId(3L);
        request.setDescription("Groceries");
        request.setAmount(new BigDecimal("50.00"));
        request.setCategory("Food");

        com.nestly.nestly_backend.dto.ExpenseSplitRequest split = new com.nestly.nestly_backend.dto.ExpenseSplitRequest();
        split.setUserId(5L);
        split.setAmount(new BigDecimal("50.00"));
        request.setSplits(List.of(split));

        ExpenseResponse response = expenseService.createExpense(request, "member@example.com");

        assertEquals(20L, response.getId());
        assertEquals("Groceries", response.getDescription());
        assertEquals(new BigDecimal("50.00"), response.getAmount());
        org.mockito.Mockito.verify(expenseRepository).save(org.mockito.ArgumentMatchers.any(Expense.class));
        org.mockito.Mockito.verify(expenseSplitRepository).save(org.mockito.ArgumentMatchers.any(ExpenseSplit.class));
    }

    @Test
    void createExpenseSuccessWithoutSplits() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        Expense savedExpense = mock(Expense.class);

        when(user.getId()).thenReturn(2L);
        when(user.getName()).thenReturn("Member");
        when(household.getId()).thenReturn(3L);

        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(user));
        when(householdRepository.findById(3L)).thenReturn(Optional.of(household));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(2L, 3L)).thenReturn(true);

        when(savedExpense.getId()).thenReturn(21L);
        when(savedExpense.getDescription()).thenReturn("Internet");
        when(savedExpense.getAmount()).thenReturn(new BigDecimal("40.00"));
        when(savedExpense.getCategory()).thenReturn("Utilities");
        when(savedExpense.getHousehold()).thenReturn(household);
        when(savedExpense.getPaidBy()).thenReturn(user);
        when(savedExpense.getCreatedAt()).thenReturn(LocalDateTime.now());
        when(expenseRepository.save(org.mockito.ArgumentMatchers.any(Expense.class))).thenReturn(savedExpense);

        com.nestly.nestly_backend.dto.ExpenseRequest request = new com.nestly.nestly_backend.dto.ExpenseRequest();
        request.setHouseholdId(3L);
        request.setDescription("Internet");
        request.setAmount(new BigDecimal("40.00"));
        request.setCategory("Utilities");

        ExpenseResponse response = expenseService.createExpense(request, "member@example.com");

        assertEquals(21L, response.getId());
        org.mockito.Mockito.verify(expenseSplitRepository, org.mockito.Mockito.never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void createExpenseThrowsNotFoundWhenUserNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        com.nestly.nestly_backend.dto.ExpenseRequest request = new com.nestly.nestly_backend.dto.ExpenseRequest();
        request.setHouseholdId(1L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                expenseService.createExpense(request, "unknown@example.com")
        );
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void createExpenseThrowsNotFoundWhenHouseholdNotFound() {
        User user = mock(User.class);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(householdRepository.findById(99L)).thenReturn(Optional.empty());

        com.nestly.nestly_backend.dto.ExpenseRequest request = new com.nestly.nestly_backend.dto.ExpenseRequest();
        request.setHouseholdId(99L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                expenseService.createExpense(request, "user@example.com")
        );
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void createExpenseThrowsForbiddenWhenCreatorNotMember() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        when(user.getId()).thenReturn(10L);
        when(household.getId()).thenReturn(3L);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(householdRepository.findById(3L)).thenReturn(Optional.of(household));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(10L, 3L)).thenReturn(false);

        com.nestly.nestly_backend.dto.ExpenseRequest request = new com.nestly.nestly_backend.dto.ExpenseRequest();
        request.setHouseholdId(3L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                expenseService.createExpense(request, "user@example.com")
        );
        assertEquals(403, ex.getStatusCode().value());
    }

    @Test
    void createExpenseThrowsInvalidExpenseWhenSplitTotalDoesNotMatch() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        when(user.getId()).thenReturn(2L);
        when(household.getId()).thenReturn(3L);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(householdRepository.findById(3L)).thenReturn(Optional.of(household));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(2L, 3L)).thenReturn(true);

        com.nestly.nestly_backend.dto.ExpenseRequest request = new com.nestly.nestly_backend.dto.ExpenseRequest();
        request.setHouseholdId(3L);
        request.setAmount(new BigDecimal("100.00"));

        com.nestly.nestly_backend.dto.ExpenseSplitRequest split = new com.nestly.nestly_backend.dto.ExpenseSplitRequest();
        split.setUserId(2L);
        split.setAmount(new BigDecimal("60.00"));
        request.setSplits(List.of(split));

        assertThrows(com.nestly.nestly_backend.exception.InvalidExpenseException.class, () ->
                expenseService.createExpense(request, "user@example.com")
        );
    }

    @Test
    void createExpenseThrowsForbiddenWhenSplitUserNotMember() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        User splitUser = mock(User.class);

        when(user.getId()).thenReturn(2L);
        when(household.getId()).thenReturn(3L);
        when(splitUser.getId()).thenReturn(7L);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(householdRepository.findById(3L)).thenReturn(Optional.of(household));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(2L, 3L)).thenReturn(true);
        when(userRepository.findById(7L)).thenReturn(Optional.of(splitUser));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(7L, 3L)).thenReturn(false);

        Expense savedExpense = mock(Expense.class);
        when(expenseRepository.save(org.mockito.ArgumentMatchers.any())).thenReturn(savedExpense);

        com.nestly.nestly_backend.dto.ExpenseRequest request = new com.nestly.nestly_backend.dto.ExpenseRequest();
        request.setHouseholdId(3L);
        request.setAmount(new BigDecimal("50.00"));
        com.nestly.nestly_backend.dto.ExpenseSplitRequest split = new com.nestly.nestly_backend.dto.ExpenseSplitRequest();
        split.setUserId(7L);
        split.setAmount(new BigDecimal("50.00"));
        request.setSplits(List.of(split));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                expenseService.createExpense(request, "user@example.com")
        );
        assertEquals(403, ex.getStatusCode().value());
    }

    @Test
    void getHouseholdExpensesThrowsNotFoundWhenUserNotFound() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                expenseService.getHouseholdExpenses(1L, "missing@example.com")
        );
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void getExpenseSplitsThrowsNotFoundWhenExpenseNotFound() {
        User user = mock(User.class);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(expenseRepository.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                expenseService.getExpenseSplits(999L, "user@example.com")
        );
        assertEquals(404, ex.getStatusCode().value());
    }
}
