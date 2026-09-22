package com.nestly.nestly_backend.repository;

import com.nestly.nestly_backend.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillRepository extends JpaRepository<Bill, Long> {

    List<Bill> findByHouseholdId(Long householdId);
}