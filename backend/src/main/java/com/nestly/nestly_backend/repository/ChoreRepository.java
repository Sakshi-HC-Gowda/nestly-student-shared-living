package com.nestly.nestly_backend.repository;

import com.nestly.nestly_backend.entity.Chore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChoreRepository extends JpaRepository<Chore, Long> {

    @Query("""
        SELECT c
        FROM Chore c
        JOIN FETCH c.assignedTo
        JOIN FETCH c.createdBy
        JOIN FETCH c.household
        WHERE c.household.id = :householdId
        ORDER BY c.dueDate ASC
    """)
    List<Chore> findByHouseholdId(@Param("householdId") Long householdId);

    @Query("""
        SELECT c
        FROM Chore c
        JOIN FETCH c.assignedTo
        JOIN FETCH c.createdBy
        JOIN FETCH c.household
        WHERE c.id = :id
    """)
    Optional<Chore> findByIdWithDetails(@Param("id") Long id);
}