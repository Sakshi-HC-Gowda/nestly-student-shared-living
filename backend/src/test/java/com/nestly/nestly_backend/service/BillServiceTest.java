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
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BillServiceTest {

    private final BillRepository billRepository = mock(BillRepository.class);
    private final HouseholdRepository householdRepository = mock(HouseholdRepository.class);
    private final HouseholdMemberRepository householdMemberRepository = mock(HouseholdMemberRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);

    private final BillService billService = new BillService(
            billRepository,
            householdRepository,
            householdMemberRepository,
            userRepository
    );

    @Test
    void createBillSuccess() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        Bill savedBill = mock(Bill.class);

        when(user.getId()).thenReturn(1L);
        when(user.getName()).thenReturn("User");
        when(household.getId()).thenReturn(10L);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(householdRepository.findById(10L)).thenReturn(Optional.of(household));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(true);

        when(savedBill.getId()).thenReturn(5L);
        when(savedBill.getTitle()).thenReturn("Electricity");
        when(savedBill.getAmount()).thenReturn(new BigDecimal("120.00"));
        when(savedBill.getDueDate()).thenReturn(LocalDate.now().plusDays(10));
        when(savedBill.getCategory()).thenReturn("Utilities");
        when(savedBill.getStatus()).thenReturn(Bill.Status.PENDING);
        when(savedBill.getHousehold()).thenReturn(household);
        when(savedBill.getCreatedBy()).thenReturn(user);
        when(savedBill.getCreatedAt()).thenReturn(LocalDateTime.now());
        when(billRepository.save(any(Bill.class))).thenReturn(savedBill);

        BillRequest request = new BillRequest();
        request.setHouseholdId(10L);
        request.setTitle("Electricity");
        request.setAmount(new BigDecimal("120.00"));
        request.setDueDate(LocalDate.now().plusDays(10));
        request.setCategory("Utilities");

        BillResponse response = billService.createBill(request, "user@example.com");

        assertEquals(5L, response.getId());
        assertEquals("Electricity", response.getTitle());
        assertEquals(new BigDecimal("120.00"), response.getAmount());
        verify(billRepository).save(any(Bill.class));
    }

    @Test
    void createBillThrowsNotFoundWhenUserNotFound() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.empty());

        BillRequest request = new BillRequest();
        request.setHouseholdId(10L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                billService.createBill(request, "user@example.com")
        );
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void createBillThrowsNotFoundWhenHouseholdNotFound() {
        User user = mock(User.class);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(householdRepository.findById(99L)).thenReturn(Optional.empty());

        BillRequest request = new BillRequest();
        request.setHouseholdId(99L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                billService.createBill(request, "user@example.com")
        );
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void createBillThrowsForbiddenWhenNotMember() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        when(user.getId()).thenReturn(1L);
        when(household.getId()).thenReturn(10L);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(householdRepository.findById(10L)).thenReturn(Optional.of(household));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(false);

        BillRequest request = new BillRequest();
        request.setHouseholdId(10L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                billService.createBill(request, "user@example.com")
        );
        assertEquals(403, ex.getStatusCode().value());
    }

    @Test
    void getHouseholdBillsSuccess() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        Bill bill = mock(Bill.class);

        when(user.getId()).thenReturn(1L);
        when(user.getName()).thenReturn("User");
        when(household.getId()).thenReturn(10L);

        when(bill.getId()).thenReturn(5L);
        when(bill.getTitle()).thenReturn("Wifi");
        when(bill.getAmount()).thenReturn(new BigDecimal("50.00"));
        when(bill.getDueDate()).thenReturn(LocalDate.now());
        when(bill.getCategory()).thenReturn("Internet");
        when(bill.getStatus()).thenReturn(Bill.Status.PENDING);
        when(bill.getHousehold()).thenReturn(household);
        when(bill.getCreatedBy()).thenReturn(user);
        when(bill.getCreatedAt()).thenReturn(LocalDateTime.now());

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(true);
        when(billRepository.findByHouseholdId(10L)).thenReturn(List.of(bill));

        List<BillResponse> result = billService.getHouseholdBills(10L, "user@example.com");

        assertEquals(1, result.size());
        assertEquals("Wifi", result.get(0).getTitle());
    }

    @Test
    void getHouseholdBillsThrowsForbiddenWhenNotMember() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(1L);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                billService.getHouseholdBills(10L, "user@example.com")
        );
        assertEquals(403, ex.getStatusCode().value());
    }
}
