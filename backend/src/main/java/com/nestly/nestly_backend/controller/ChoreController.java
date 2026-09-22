package com.nestly.nestly_backend.controller;

import com.nestly.nestly_backend.dto.ChoreRequest;
import com.nestly.nestly_backend.dto.ChoreResponse;
import com.nestly.nestly_backend.service.ChoreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chores")
public class ChoreController {

    private final ChoreService choreService;

    public ChoreController(ChoreService choreService) {
        this.choreService = choreService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ChoreResponse createChore(
            @Valid @RequestBody ChoreRequest request,
            Authentication authentication) {

        return choreService.createChore(
                request,
                authentication.getName()
        );
    }

    @GetMapping("/household/{householdId}")
    public List<ChoreResponse> getHouseholdChores(
            @PathVariable Long householdId,
            Authentication authentication) {

        return choreService.getHouseholdChores(
                householdId,
                authentication.getName()
        );
    }
}