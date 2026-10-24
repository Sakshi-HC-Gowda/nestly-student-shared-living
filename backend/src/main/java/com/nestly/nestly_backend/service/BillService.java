package com.nestly.nestly_backend.service;

import com.nestly.nestly_backend.dto.BillRequest;
import com.nestly.nestly_backend.dto.BillResponse;
import com.nestly.nestly_backend.entity.Bill;
import com.nestly.nestly_backend.entity.Household;
import com.nestly.nestly_backend.entity.User;
import com.nestly.nestly_backend.repository.BillRepository;
import com.nestly.nestly_backend.repository.HouseholdMemberRepository;
import com.nestly.nestly_backend.repository.HouseholdRepository;
import com.nestly.nestly_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class BillService {

    private final BillRepository billRepository;
    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository householdMemberRepository;
    private final UserRepository userRepository;

    public BillService(
            BillRepository billRepository,
            HouseholdRepository householdRepository,
            HouseholdMemberRepository householdMemberRepository,
            UserRepository userRepository) {

        this.billRepository = billRepository;
        this.householdRepository = householdRepository;
        this.householdMemberRepository = householdMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BillResponse createBill(
            BillRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Household household = householdRepository.findById(request.getHouseholdId())
                .orElseThrow(() -> new RuntimeException("Household not found"));

        boolean isMember =
                householdMemberRepository.existsByUserIdAndHouseholdId(
                        user.getId(),
                        household.getId()
                );

        if (!isMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a member of this household"
            );
        }

        Bill bill = new Bill();

        bill.setHousehold(household);
        bill.setCreatedBy(user);
        bill.setTitle(request.getTitle());
        bill.setAmount(request.getAmount());
        bill.setDueDate(request.getDueDate());
        bill.setCategory(request.getCategory());
        bill.setStatus(Bill.Status.PENDING);

        Bill savedBill = billRepository.save(bill);

        return convertToResponse(savedBill);
    }

    public List<BillResponse> getHouseholdBills(
            Long householdId,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isMember =
                householdMemberRepository.existsByUserIdAndHouseholdId(
                        user.getId(),
                        householdId
                );

        if (!isMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a member of this household"
            );
        }

        return billRepository.findByHouseholdId(householdId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private BillResponse convertToResponse(Bill bill) {

        return new BillResponse(
                bill.getId(),
                bill.getTitle(),
                bill.getAmount(),
                bill.getDueDate(),
                bill.getCategory(),
                bill.getStatus(),
                bill.getHousehold().getId(),
                bill.getCreatedBy().getId(),
                bill.getCreatedBy().getName(),
                bill.getCreatedAt()
        );
    }
}