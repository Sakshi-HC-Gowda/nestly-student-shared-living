package com.nestly.nestly_backend.repository;

import com.nestly.nestly_backend.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BillRepository extends JpaRepository<Bill, Long> {

    @Query("""
        SELECT b
        FROM Bill b
        JOIN FETCH b.createdBy
        JOIN FETCH b.household
        WHERE b.household.id = :householdId
        ORDER BY b.dueDate ASC
    """)
    List<Bill> findByHouseholdId(@Param("householdId") Long householdId);
}