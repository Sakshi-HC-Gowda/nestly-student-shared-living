package com.nestly.nestly_backend.repository;

import com.nestly.nestly_backend.entity.HouseholdMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HouseholdMemberRepository
        extends JpaRepository<HouseholdMember, Long> {

    List<HouseholdMember> findByHouseholdId(Long householdId);

    List<HouseholdMember> findByUserId(Long userId);

    boolean existsByUserIdAndHouseholdId(Long userId, Long householdId);
}
