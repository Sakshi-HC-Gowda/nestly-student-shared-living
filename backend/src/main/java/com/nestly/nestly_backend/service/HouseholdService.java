package com.nestly.nestly_backend.service;

import com.nestly.nestly_backend.dto.HouseholdRequest;
import com.nestly.nestly_backend.entity.Household;
import com.nestly.nestly_backend.entity.HouseholdMember;
import com.nestly.nestly_backend.entity.User;
import com.nestly.nestly_backend.repository.HouseholdMemberRepository;
import com.nestly.nestly_backend.repository.HouseholdRepository;
import com.nestly.nestly_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HouseholdService {

    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository householdMemberRepository;
    private final UserRepository userRepository;

    public HouseholdService(
            HouseholdRepository householdRepository,
            HouseholdMemberRepository householdMemberRepository,
            UserRepository userRepository) {

        this.householdRepository = householdRepository;
        this.householdMemberRepository = householdMemberRepository;
        this.userRepository = userRepository;
    }

    public Household createHousehold(HouseholdRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Household household = new Household();
        household.setName(request.getName());
        household.setAccommodationType(request.getAccommodationType());

        Household savedHousehold = householdRepository.save(household);

        HouseholdMember member = new HouseholdMember();
        member.setUser(user);
        member.setHousehold(savedHousehold);
        member.setRole(HouseholdMember.Role.OWNER);

        householdMemberRepository.save(member);

        return savedHousehold;
    }

    public List<Household> getMyHouseholds(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return householdMemberRepository.findByUserId(user.getId())
                .stream()
                .map(HouseholdMember::getHousehold)
                .toList();
    }
}