package com.nestly.nestly_backend.service;

import com.nestly.nestly_backend.dto.GroceryResponse;
import com.nestly.nestly_backend.dto.UpdateGroceryRequest;
import com.nestly.nestly_backend.entity.GroceryItem;
import com.nestly.nestly_backend.entity.Household;
import com.nestly.nestly_backend.entity.User;
import com.nestly.nestly_backend.repository.GroceryRepository;
import com.nestly.nestly_backend.repository.HouseholdMemberRepository;
import com.nestly.nestly_backend.repository.HouseholdRepository;
import com.nestly.nestly_backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class GroceryServiceTest {

    private final GroceryRepository groceryRepository = mock(GroceryRepository.class);
    private final HouseholdRepository householdRepository = mock(HouseholdRepository.class);
    private final HouseholdMemberRepository householdMemberRepository = mock(HouseholdMemberRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);

    private final GroceryService groceryService = new GroceryService(
            groceryRepository,
            householdRepository,
            householdMemberRepository,
            userRepository
    );

    @Test
    void deleteGroceryDeletesItemWhenMemberAuthorized() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        GroceryItem item = mock(GroceryItem.class);

        when(user.getId()).thenReturn(1L);
        when(household.getId()).thenReturn(10L);
        when(item.getId()).thenReturn(200L);
        when(item.getHousehold()).thenReturn(household);

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(groceryRepository.findById(200L)).thenReturn(Optional.of(item));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(true);

        groceryService.deleteGrocery(200L, "user@test.com");

        verify(groceryRepository).delete(item);
    }

    @Test
    void deleteGroceryThrowsForbiddenWhenNotMember() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        GroceryItem item = mock(GroceryItem.class);

        when(user.getId()).thenReturn(2L);
        when(household.getId()).thenReturn(10L);
        when(item.getId()).thenReturn(200L);
        when(item.getHousehold()).thenReturn(household);

        when(userRepository.findByEmail("stranger@test.com")).thenReturn(Optional.of(user));
        when(groceryRepository.findById(200L)).thenReturn(Optional.of(item));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(2L, 10L)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                groceryService.deleteGrocery(200L, "stranger@test.com")
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void toggleGroceryStatusFlipsPendingToPurchased() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        GroceryItem item = mock(GroceryItem.class);

        when(user.getId()).thenReturn(1L);
        when(user.getName()).thenReturn("User One");
        when(household.getId()).thenReturn(10L);
        when(item.getId()).thenReturn(200L);
        when(item.getName()).thenReturn("Whole Milk");
        when(item.getQuantity()).thenReturn("1 gallon");
        when(item.getEstimatedPrice()).thenReturn(new BigDecimal("3.50"));
        when(item.getHousehold()).thenReturn(household);
        when(item.getAddedBy()).thenReturn(user);
        when(item.getCreatedAt()).thenReturn(LocalDateTime.now());
        when(item.getStatus()).thenReturn(GroceryItem.Status.PENDING, GroceryItem.Status.PURCHASED);

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(groceryRepository.findByIdWithDetails(200L)).thenReturn(Optional.of(item));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(true);
        when(groceryRepository.save(item)).thenReturn(item);

        GroceryResponse response = groceryService.toggleGroceryStatus(200L, "user@test.com");

        assertEquals(GroceryItem.Status.PURCHASED, response.getStatus());
        verify(item).setStatus(GroceryItem.Status.PURCHASED);
        verify(groceryRepository).save(item);
    }

    @Test
    void toggleGroceryStatusFlipsPurchasedToPending() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        GroceryItem item = mock(GroceryItem.class);

        when(user.getId()).thenReturn(1L);
        when(user.getName()).thenReturn("User One");
        when(household.getId()).thenReturn(10L);
        when(item.getId()).thenReturn(200L);
        when(item.getName()).thenReturn("Whole Milk");
        when(item.getQuantity()).thenReturn("1 gallon");
        when(item.getEstimatedPrice()).thenReturn(new BigDecimal("3.50"));
        when(item.getHousehold()).thenReturn(household);
        when(item.getAddedBy()).thenReturn(user);
        when(item.getCreatedAt()).thenReturn(LocalDateTime.now());
        when(item.getStatus()).thenReturn(GroceryItem.Status.PURCHASED, GroceryItem.Status.PENDING);

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(groceryRepository.findByIdWithDetails(200L)).thenReturn(Optional.of(item));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(true);
        when(groceryRepository.save(item)).thenReturn(item);

        GroceryResponse response = groceryService.toggleGroceryStatus(200L, "user@test.com");

        assertEquals(GroceryItem.Status.PENDING, response.getStatus());
        verify(item).setStatus(GroceryItem.Status.PENDING);
        verify(groceryRepository).save(item);
    }

    @Test
    void updateGroceryModifiesFields() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        GroceryItem item = mock(GroceryItem.class);

        when(user.getId()).thenReturn(1L);
        when(user.getName()).thenReturn("User One");
        when(household.getId()).thenReturn(10L);
        when(item.getId()).thenReturn(200L);
        when(item.getName()).thenReturn("Almond Milk");
        when(item.getQuantity()).thenReturn("2 cartons");
        when(item.getEstimatedPrice()).thenReturn(new BigDecimal("7.00"));
        when(item.getStatus()).thenReturn(GroceryItem.Status.PENDING);
        when(item.getHousehold()).thenReturn(household);
        when(item.getAddedBy()).thenReturn(user);
        when(item.getCreatedAt()).thenReturn(LocalDateTime.now());

        UpdateGroceryRequest request = new UpdateGroceryRequest();
        request.setName("Almond Milk");
        request.setQuantity("2 cartons");
        request.setEstimatedPrice(new BigDecimal("7.00"));

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(groceryRepository.findByIdWithDetails(200L)).thenReturn(Optional.of(item));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(true);
        when(groceryRepository.save(item)).thenReturn(item);

        GroceryResponse response = groceryService.updateGrocery(200L, request, "user@test.com");

        assertEquals("Almond Milk", response.getName());
        assertEquals("2 cartons", response.getQuantity());
        assertEquals(new BigDecimal("7.00"), response.getEstimatedPrice());
        verify(item).setName("Almond Milk");
        verify(item).setQuantity("2 cartons");
        verify(item).setEstimatedPrice(new BigDecimal("7.00"));
        verify(groceryRepository).save(item);
    }
}
