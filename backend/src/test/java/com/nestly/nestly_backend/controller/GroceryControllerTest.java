package com.nestly.nestly_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nestly.nestly_backend.dto.GroceryRequest;
import com.nestly.nestly_backend.dto.GroceryResponse;
import com.nestly.nestly_backend.dto.UpdateGroceryRequest;
import com.nestly.nestly_backend.entity.GroceryItem;
import com.nestly.nestly_backend.exception.GlobalExceptionHandler;
import com.nestly.nestly_backend.service.GroceryService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GroceryControllerTest {

    private final GroceryService groceryService = mock(GroceryService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new GroceryController(groceryService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    private final UsernamePasswordAuthenticationToken auth =
            new UsernamePasswordAuthenticationToken("user@example.com", "pass");

    @Test
    void createGroceryShouldReturn201() throws Exception {
        GroceryRequest request = new GroceryRequest();
        request.setHouseholdId(1L);
        request.setName("Eggs");
        request.setQuantity("1 dozen");
        request.setEstimatedPrice(new BigDecimal("3.50"));

        GroceryResponse response = new GroceryResponse(
                12L,
                "Eggs",
                "1 dozen",
                new BigDecimal("3.50"),
                GroceryItem.Status.PENDING,
                1L,
                2L,
                "User",
                LocalDateTime.now()
        );

        when(groceryService.createGrocery(any(GroceryRequest.class), eq("user@example.com")))
                .thenReturn(response);

        mockMvc.perform(post("/api/groceries")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(12))
                .andExpect(jsonPath("$.name").value("Eggs"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void createGroceryWithBlankNameShouldReturn400() throws Exception {
        GroceryRequest request = new GroceryRequest();
        request.setHouseholdId(1L);
        request.setName("");
        request.setQuantity("1");

        mockMvc.perform(post("/api/groceries")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void getHouseholdGroceriesShouldReturn200() throws Exception {
        GroceryResponse response = new GroceryResponse(
                12L,
                "Eggs",
                "1 dozen",
                new BigDecimal("3.50"),
                GroceryItem.Status.PENDING,
                1L,
                2L,
                "User",
                LocalDateTime.now()
        );

        when(groceryService.getHouseholdGroceries(1L, "user@example.com"))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/groceries/household/1")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Eggs"));
    }

    @Test
    void toggleGroceryStatusShouldReturn200() throws Exception {
        GroceryResponse response = new GroceryResponse(
                12L,
                "Eggs",
                "1 dozen",
                new BigDecimal("3.50"),
                GroceryItem.Status.PURCHASED,
                1L,
                2L,
                "User",
                LocalDateTime.now()
        );

        when(groceryService.toggleGroceryStatus(12L, "user@example.com"))
                .thenReturn(response);

        mockMvc.perform(put("/api/groceries/12/toggle")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PURCHASED"));
    }

    @Test
    void updateGroceryShouldReturn200() throws Exception {
        UpdateGroceryRequest request = new UpdateGroceryRequest();
        request.setName("Organic Eggs");
        request.setQuantity("2 dozen");

        GroceryResponse response = new GroceryResponse(
                12L,
                "Organic Eggs",
                "2 dozen",
                new BigDecimal("7.00"),
                GroceryItem.Status.PENDING,
                1L,
                2L,
                "User",
                LocalDateTime.now()
        );

        when(groceryService.updateGrocery(eq(12L), any(UpdateGroceryRequest.class), eq("user@example.com")))
                .thenReturn(response);

        mockMvc.perform(put("/api/groceries/12")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Organic Eggs"));
    }

    @Test
    void deleteGroceryShouldReturn204() throws Exception {
        doNothing().when(groceryService).deleteGrocery(12L, "user@example.com");

        mockMvc.perform(delete("/api/groceries/12")
                        .principal(auth))
                .andExpect(status().isNoContent());

        verify(groceryService).deleteGrocery(12L, "user@example.com");
    }

    @Test
    void deleteGroceryWhenNotMemberShouldReturn403() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this household"))
                .when(groceryService).deleteGrocery(99L, "user@example.com");

        mockMvc.perform(delete("/api/groceries/99")
                        .principal(auth))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("You are not a member of this household"));
    }
}
