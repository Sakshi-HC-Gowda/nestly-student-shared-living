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

    @Test
    void createGrocerySuccess() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        GroceryItem item = mock(GroceryItem.class);

        when(user.getId()).thenReturn(1L);
        when(user.getName()).thenReturn("User One");
        when(household.getId()).thenReturn(10L);

        when(item.getId()).thenReturn(205L);
        when(item.getName()).thenReturn("Oatmeal");
        when(item.getQuantity()).thenReturn("1 pack");
        when(item.getEstimatedPrice()).thenReturn(new BigDecimal("4.00"));
        when(item.getStatus()).thenReturn(GroceryItem.Status.PENDING);
        when(item.getHousehold()).thenReturn(household);
        when(item.getAddedBy()).thenReturn(user);
        when(item.getCreatedAt()).thenReturn(LocalDateTime.now());

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(householdRepository.findById(10L)).thenReturn(Optional.of(household));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(true);
        when(groceryRepository.save(org.mockito.ArgumentMatchers.any(GroceryItem.class))).thenReturn(item);

        com.nestly.nestly_backend.dto.GroceryRequest request = new com.nestly.nestly_backend.dto.GroceryRequest();
        request.setHouseholdId(10L);
        request.setName("Oatmeal");
        request.setQuantity("1 pack");
        request.setEstimatedPrice(new BigDecimal("4.00"));

        GroceryResponse response = groceryService.createGrocery(request, "user@test.com");

        assertEquals(205L, response.getId());
        assertEquals("Oatmeal", response.getName());
        assertEquals(GroceryItem.Status.PENDING, response.getStatus());
        verify(groceryRepository).save(org.mockito.ArgumentMatchers.any(GroceryItem.class));
    }

    @Test
    void createGroceryThrowsNotFoundWhenUserNotFound() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        com.nestly.nestly_backend.dto.GroceryRequest request = new com.nestly.nestly_backend.dto.GroceryRequest();
        request.setHouseholdId(10L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                groceryService.createGrocery(request, "unknown@test.com")
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void createGroceryThrowsNotFoundWhenHouseholdNotFound() {
        User user = mock(User.class);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(householdRepository.findById(99L)).thenReturn(Optional.empty());

        com.nestly.nestly_backend.dto.GroceryRequest request = new com.nestly.nestly_backend.dto.GroceryRequest();
        request.setHouseholdId(99L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                groceryService.createGrocery(request, "user@test.com")
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void createGroceryThrowsForbiddenWhenNotMember() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        when(user.getId()).thenReturn(1L);
        when(household.getId()).thenReturn(10L);

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(householdRepository.findById(10L)).thenReturn(Optional.of(household));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(false);

        com.nestly.nestly_backend.dto.GroceryRequest request = new com.nestly.nestly_backend.dto.GroceryRequest();
        request.setHouseholdId(10L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                groceryService.createGrocery(request, "user@test.com")
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void getHouseholdGroceriesSuccess() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        GroceryItem item = mock(GroceryItem.class);

        when(user.getId()).thenReturn(1L);
        when(user.getName()).thenReturn("User One");
        when(household.getId()).thenReturn(10L);

        when(item.getId()).thenReturn(200L);
        when(item.getName()).thenReturn("Bread");
        when(item.getQuantity()).thenReturn("1 loaf");
        when(item.getStatus()).thenReturn(GroceryItem.Status.PENDING);
        when(item.getHousehold()).thenReturn(household);
        when(item.getAddedBy()).thenReturn(user);
        when(item.getCreatedAt()).thenReturn(LocalDateTime.now());

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(true);
        when(groceryRepository.findByHouseholdId(10L)).thenReturn(java.util.List.of(item));

        java.util.List<GroceryResponse> result = groceryService.getHouseholdGroceries(10L, "user@test.com");

        assertEquals(1, result.size());
        assertEquals("Bread", result.get(0).getName());
    }

    @Test
    void getHouseholdGroceriesThrowsForbiddenWhenNotMember() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(1L);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                groceryService.getHouseholdGroceries(10L, "user@test.com")
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void deleteGroceryThrowsNotFoundWhenItemMissing() {
        User user = mock(User.class);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(groceryRepository.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                groceryService.deleteGrocery(999L, "user@test.com")
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void toggleGroceryStatusThrowsNotFoundWhenItemMissing() {
        User user = mock(User.class);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(groceryRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                groceryService.toggleGroceryStatus(999L, "user@test.com")
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void toggleGroceryStatusThrowsForbiddenWhenNotMember() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        GroceryItem item = mock(GroceryItem.class);

        when(user.getId()).thenReturn(1L);
        when(household.getId()).thenReturn(10L);
        when(item.getHousehold()).thenReturn(household);

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(groceryRepository.findByIdWithDetails(200L)).thenReturn(Optional.of(item));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                groceryService.toggleGroceryStatus(200L, "user@test.com")
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void updateGroceryThrowsNotFoundWhenItemMissing() {
        User user = mock(User.class);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(groceryRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        UpdateGroceryRequest request = new UpdateGroceryRequest();
        request.setName("New");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                groceryService.updateGrocery(999L, request, "user@test.com")
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void updateGroceryThrowsForbiddenWhenNotMember() {
        User user = mock(User.class);
        Household household = mock(Household.class);
        GroceryItem item = mock(GroceryItem.class);

        when(user.getId()).thenReturn(1L);
        when(household.getId()).thenReturn(10L);
        when(item.getHousehold()).thenReturn(household);

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(groceryRepository.findByIdWithDetails(200L)).thenReturn(Optional.of(item));
        when(householdMemberRepository.existsByUserIdAndHouseholdId(1L, 10L)).thenReturn(false);

        UpdateGroceryRequest request = new UpdateGroceryRequest();
        request.setName("New");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                groceryService.updateGrocery(200L, request, "user@test.com")
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }
}
