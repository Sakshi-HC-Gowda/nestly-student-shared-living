package com.nestly.nestly_backend.service;

import com.nestly.nestly_backend.dto.ExpenseRequest;
import com.nestly.nestly_backend.dto.ExpenseResponse;
import com.nestly.nestly_backend.dto.ExpenseSplitRequest;
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
import org.springframework.stereotype.Service;
import com.nestly.nestly_backend.exception.InvalidExpenseException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository householdMemberRepository;
    private final UserRepository userRepository;

    public ExpenseService(
            ExpenseRepository expenseRepository,
            ExpenseSplitRepository expenseSplitRepository,
            HouseholdRepository householdRepository,
            HouseholdMemberRepository householdMemberRepository,
            UserRepository userRepository) {

        this.expenseRepository = expenseRepository;
        this.expenseSplitRepository = expenseSplitRepository;
        this.householdRepository = householdRepository;
        this.householdMemberRepository = householdMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ExpenseResponse createExpense(
            ExpenseRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Household household = householdRepository.findById(request.getHouseholdId())
                .orElseThrow(() -> new RuntimeException("Household not found"));

        boolean isMember = householdMemberRepository
                .existsByUserIdAndHouseholdId(
                        user.getId(),
                        household.getId()
                );

        if (!isMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a member of this household"
            );
        }

        // Validate split total before creating the expense
        if (request.getSplits() != null && !request.getSplits().isEmpty()) {

            BigDecimal splitTotal = request.getSplits()
                    .stream()
                    .map(ExpenseSplitRequest::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (splitTotal.compareTo(request.getAmount()) != 0) {
                throw new InvalidExpenseException(
                        "Split amounts must equal the expense amount"
                );
            }
        }

        Expense expense = new Expense();

        expense.setHousehold(household);
        expense.setPaidBy(user);
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());

        Expense savedExpense = expenseRepository.save(expense);

        // Create expense splits
        if (request.getSplits() != null) {

            for (ExpenseSplitRequest splitRequest : request.getSplits()) {

                User splitUser = userRepository.findById(
                        splitRequest.getUserId()
                ).orElseThrow(() ->
                        new RuntimeException("Split user not found")
                );

                boolean splitUserIsMember =
                        householdMemberRepository.existsByUserIdAndHouseholdId(
                                splitUser.getId(),
                                household.getId()
                        );

                if (!splitUserIsMember) {
                    throw new ResponseStatusException(
                            HttpStatus.FORBIDDEN,
                            "Split user is not a member of this household"
                    );
                }

                ExpenseSplit split = new ExpenseSplit();

                split.setExpense(savedExpense);
                split.setUser(splitUser);
                split.setAmount(splitRequest.getAmount());

                expenseSplitRepository.save(split);
            }
        }

        return convertToResponse(savedExpense);
    }

    public List<ExpenseResponse> getHouseholdExpenses(
            Long householdId,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isMember = householdMemberRepository
                .existsByUserIdAndHouseholdId(
                        user.getId(),
                        householdId
                );

        if (!isMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a member of this household"
            );
        }

        return expenseRepository.findByHouseholdId(householdId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public List<ExpenseSplitResponse> getExpenseSplits(
            Long expenseId,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        boolean isMember =
                householdMemberRepository.existsByUserIdAndHouseholdId(
                        user.getId(),
                        expense.getHousehold().getId()
                );

        if (!isMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a member of this household"
            );
        }

        return expenseSplitRepository.findByExpenseId(expenseId)
                .stream()
                .map(split -> new ExpenseSplitResponse(
                        split.getId(),
                        split.getUser().getId(),
                        split.getUser().getName(),
                        split.getAmount()
                ))
                .toList();
    }

    private ExpenseResponse convertToResponse(Expense expense) {

        return new ExpenseResponse(
                expense.getId(),
                expense.getDescription(),
                expense.getAmount(),
                expense.getCategory(),
                expense.getHousehold().getId(),
                expense.getPaidBy().getId(),
                expense.getPaidBy().getName(),
                expense.getCreatedAt()
        );
    }
}