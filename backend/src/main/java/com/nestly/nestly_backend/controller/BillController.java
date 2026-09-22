package com.nestly.nestly_backend.controller;

import com.nestly.nestly_backend.dto.BillRequest;
import com.nestly.nestly_backend.dto.BillResponse;
import com.nestly.nestly_backend.service.BillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BillResponse createBill(
            @Valid @RequestBody BillRequest request,
            Authentication authentication) {

        return billService.createBill(
                request,
                authentication.getName()
        );
    }

    @GetMapping("/household/{householdId}")
    public List<BillResponse> getHouseholdBills(
            @PathVariable Long householdId,
            Authentication authentication) {

        return billService.getHouseholdBills(
                householdId,
                authentication.getName()
        );
    }
}