package com.nestly.nestly_backend.controller;

import com.nestly.nestly_backend.dto.GroceryRequest;
import com.nestly.nestly_backend.dto.GroceryResponse;
import com.nestly.nestly_backend.dto.UpdateGroceryRequest;
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

    @PutMapping("/{itemId}/toggle")
    public GroceryResponse toggleGroceryStatus(
            @PathVariable Long itemId,
            Authentication authentication) {

        return groceryService.toggleGroceryStatus(
                itemId,
                authentication.getName()
        );
    }

    @PutMapping("/{itemId}")
    public GroceryResponse updateGrocery(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateGroceryRequest request,
            Authentication authentication) {

        return groceryService.updateGrocery(
                itemId,
                request,
                authentication.getName()
        );
    }

    @DeleteMapping("/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGrocery(
            @PathVariable Long itemId,
            Authentication authentication) {

        groceryService.deleteGrocery(
                itemId,
                authentication.getName()
        );
    }
}