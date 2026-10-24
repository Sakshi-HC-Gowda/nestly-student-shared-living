package com.nestly.nestly_backend.repository;

import com.nestly.nestly_backend.entity.HouseholdMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HouseholdMemberRepository
        extends JpaRepository<HouseholdMember, Long> {

    List<HouseholdMember> findByHouseholdId(Long householdId);

    List<HouseholdMember> findByUserId(Long userId);

    boolean existsByUserIdAndHouseholdId(Long userId, Long householdId);

    @Query("""
        SELECT hm
        FROM HouseholdMember hm
        JOIN FETCH hm.user
        WHERE hm.household.id = :householdId
    """)
    List<HouseholdMember> findByHouseholdIdWithUser(
            @Param("householdId") Long householdId
    );

    @Query("""
        SELECT hm
        FROM HouseholdMember hm
        JOIN FETCH hm.household
        WHERE hm.user.id = :userId
    """)
    List<HouseholdMember> findByUserIdWithHousehold(
            @Param("userId") Long userId
    );
}