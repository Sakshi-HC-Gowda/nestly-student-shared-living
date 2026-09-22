package com.nestly.nestly_backend.repository;

import com.nestly.nestly_backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByHouseholdId(Long householdId);
}