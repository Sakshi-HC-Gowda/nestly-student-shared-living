package com.nestly.nestly_backend.repository;

import com.nestly.nestly_backend.entity.Chore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChoreRepository extends JpaRepository<Chore, Long> {

    List<Chore> findByHouseholdId(Long householdId);
}