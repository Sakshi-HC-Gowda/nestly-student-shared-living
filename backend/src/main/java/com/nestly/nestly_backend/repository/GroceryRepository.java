package com.nestly.nestly_backend.repository;

import com.nestly.nestly_backend.entity.GroceryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroceryRepository extends JpaRepository<GroceryItem, Long> {

    @Query("""
        SELECT g
        FROM GroceryItem g
        JOIN FETCH g.addedBy
        JOIN FETCH g.household
        WHERE g.household.id = :householdId
        ORDER BY g.createdAt DESC
    """)
    List<GroceryItem> findByHouseholdId(@Param("householdId") Long householdId);
}