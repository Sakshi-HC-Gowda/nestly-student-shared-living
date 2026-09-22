package com.nestly.nestly_backend.repository;

import com.nestly.nestly_backend.entity.GroceryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroceryRepository extends JpaRepository<GroceryItem, Long> {

    List<GroceryItem> findByHouseholdId(Long householdId);
}