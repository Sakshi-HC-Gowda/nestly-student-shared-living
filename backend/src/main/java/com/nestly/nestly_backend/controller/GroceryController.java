package com.nestly.nestly_backend.controller;

import com.nestly.nestly_backend.dto.GroceryRequest;
import com.nestly.nestly_backend.dto.GroceryResponse;
import com.nestly.nestly_backend.service.GroceryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groceries")
public class GroceryController {

    private final GroceryService groceryService;

    public GroceryController(GroceryService groceryService) {
        this.groceryService = groceryService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GroceryResponse createGrocery(
            @Valid @RequestBody GroceryRequest request,
            Authentication authentication) {

        return groceryService.createGrocery(
                request,
                authentication.getName()
        );
    }

    @GetMapping("/household/{householdId}")
    public List<GroceryResponse> getHouseholdGroceries(
            @PathVariable Long householdId,
            Authentication authentication) {

        return groceryService.getHouseholdGroceries(
                householdId,
                authentication.getName()
        );
    }
}