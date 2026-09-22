package com.nestly.nestly_backend.repository;

import com.nestly.nestly_backend.entity.Household;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HouseholdRepository extends JpaRepository<Household, Long> {
}
