package com.nestly.nestly_backend.repository;

import com.nestly.nestly_backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("""
        SELECT e
        FROM Expense e
        JOIN FETCH e.paidBy
        JOIN FETCH e.household
        WHERE e.household.id = :householdId
        ORDER BY e.createdAt DESC
    """)
    List<Expense> findByHouseholdId(@Param("householdId") Long householdId);
}