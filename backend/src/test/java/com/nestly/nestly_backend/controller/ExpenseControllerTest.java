package com.nestly.nestly_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nestly.nestly_backend.dto.ExpenseRequest;
import com.nestly.nestly_backend.dto.ExpenseResponse;
import com.nestly.nestly_backend.dto.ExpenseSplitRequest;
import com.nestly.nestly_backend.dto.ExpenseSplitResponse;
import com.nestly.nestly_backend.exception.GlobalExceptionHandler;
import com.nestly.nestly_backend.exception.InvalidExpenseException;
import com.nestly.nestly_backend.service.ExpenseService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ExpenseControllerTest {

    private final ExpenseService expenseService = mock(ExpenseService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new ExpenseController(expenseService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    private final UsernamePasswordAuthenticationToken auth =
            new UsernamePasswordAuthenticationToken("user@example.com", "pass");

    @Test
    void createExpenseShouldReturn201() throws Exception {
        ExpenseRequest request = new ExpenseRequest();
        request.setHouseholdId(1L);
        request.setDescription("Groceries");
        request.setAmount(new BigDecimal("45.50"));
        request.setCategory("Food");

        ExpenseResponse response = new ExpenseResponse(
                10L,
                "Groceries",
                new BigDecimal("45.50"),
                "Food",
                1L,
                2L,
                "User",
                LocalDateTime.now()
        );

        when(expenseService.createExpense(any(ExpenseRequest.class), eq("user@example.com")))
                .thenReturn(response);

        mockMvc.perform(post("/api/expenses")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.description").value("Groceries"))
                .andExpect(jsonPath("$.amount").value(45.50));
    }

    @Test
    void createExpenseWithNegativeAmountShouldReturn400() throws Exception {
        ExpenseRequest request = new ExpenseRequest();
        request.setHouseholdId(1L);
        request.setDescription("Invalid");
        request.setAmount(new BigDecimal("-10.00"));
        request.setCategory("Food");

        mockMvc.perform(post("/api/expenses")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void createExpenseWithSplitMismatchShouldReturn400() throws Exception {
        ExpenseRequest request = new ExpenseRequest();
        request.setHouseholdId(1L);
        request.setDescription("Dinner");
        request.setAmount(new BigDecimal("50.00"));
        request.setCategory("Food");

        ExpenseSplitRequest split = new ExpenseSplitRequest();
        split.setUserId(2L);
        split.setAmount(new BigDecimal("30.00"));
        request.setSplits(List.of(split));

        when(expenseService.createExpense(any(ExpenseRequest.class), eq("user@example.com")))
                .thenThrow(new InvalidExpenseException("Split amounts must equal the expense amount"));

        mockMvc.perform(post("/api/expenses")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Split amounts must equal the expense amount"));
    }

    @Test
    void getHouseholdExpensesShouldReturn200() throws Exception {
        ExpenseResponse response = new ExpenseResponse(
                10L,
                "Wifi",
                new BigDecimal("60.00"),
                "Utilities",
                1L,
                2L,
                "User",
                LocalDateTime.now()
        );

        when(expenseService.getHouseholdExpenses(1L, "user@example.com"))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/expenses/household/1")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].description").value("Wifi"));
    }

    @Test
    void getHouseholdExpensesWhenNotMemberShouldReturn403() throws Exception {
        when(expenseService.getHouseholdExpenses(99L, "user@example.com"))
                .thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this household"));

        mockMvc.perform(get("/api/expenses/household/99")
                        .principal(auth))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("You are not a member of this household"));
    }

    @Test
    void getExpenseSplitsShouldReturn200() throws Exception {
        ExpenseSplitResponse split = new ExpenseSplitResponse(1L, 2L, "User 2", new BigDecimal("30.00"));

        when(expenseService.getExpenseSplits(10L, "user@example.com"))
                .thenReturn(List.of(split));

        mockMvc.perform(get("/api/expenses/10/splits")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].userName").value("User 2"));
    }
}
