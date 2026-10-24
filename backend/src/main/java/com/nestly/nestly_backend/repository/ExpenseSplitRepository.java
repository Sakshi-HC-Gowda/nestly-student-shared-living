package com.nestly.nestly_backend.repository;

import com.nestly.nestly_backend.entity.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {

    @Query("""
        SELECT s
        FROM ExpenseSplit s
        JOIN FETCH s.user
        WHERE s.expense.id = :expenseId
    """)
    List<ExpenseSplit> findByExpenseId(@Param("expenseId") Long expenseId);
}