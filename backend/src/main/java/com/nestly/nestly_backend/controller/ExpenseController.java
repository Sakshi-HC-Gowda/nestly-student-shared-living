package com.nestly.nestly_backend.controller;

import com.nestly.nestly_backend.dto.ExpenseRequest;
import com.nestly.nestly_backend.dto.ExpenseResponse;
import com.nestly.nestly_backend.dto.ExpenseSplitResponse;
import com.nestly.nestly_backend.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseResponse createExpense(
            @Valid @RequestBody ExpenseRequest request,
            Authentication authentication) {

        return expenseService.createExpense(
                request,
                authentication.getName()
        );
    }

    @GetMapping("/household/{householdId}")
    public List<ExpenseResponse> getHouseholdExpenses(
            @PathVariable Long householdId,
            Authentication authentication) {

        return expenseService.getHouseholdExpenses(
                householdId,
                authentication.getName()
        );
    }

    @GetMapping("/{expenseId}/splits")
    public List<ExpenseSplitResponse> getExpenseSplits(
            @PathVariable Long expenseId,
            Authentication authentication) {

        return expenseService.getExpenseSplits(
                expenseId,
                authentication.getName()
        );
    }
}