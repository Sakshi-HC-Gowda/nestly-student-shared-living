package com.nestly.nestly_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nestly.nestly_backend.dto.ChoreRequest;
import com.nestly.nestly_backend.dto.ChoreResponse;
import com.nestly.nestly_backend.entity.Chore;
import com.nestly.nestly_backend.exception.GlobalExceptionHandler;
import com.nestly.nestly_backend.service.ChoreService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ChoreControllerTest {

    private final ChoreService choreService = mock(ChoreService.class);
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new ChoreController(choreService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    private final UsernamePasswordAuthenticationToken auth =
            new UsernamePasswordAuthenticationToken("user@example.com", "pass");

    @Test
    void createChoreShouldReturn201() throws Exception {
        ChoreRequest request = new ChoreRequest();
        request.setHouseholdId(1L);
        request.setAssignedToUserId(2L);
        request.setTitle("Vacuum living room");
        request.setDueDate(LocalDate.now().plusDays(2));

        ChoreResponse response = new ChoreResponse(
                5L,
                "Vacuum living room",
                null,
                request.getDueDate(),
                Chore.Status.PENDING,
                1L,
                2L,
                "Roommate",
                1L,
                "User",
                LocalDateTime.now()
        );

        when(choreService.createChore(any(ChoreRequest.class), eq("user@example.com")))
                .thenReturn(response);

        mockMvc.perform(post("/api/chores")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.title").value("Vacuum living room"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void createChoreWithBlankTitleShouldReturn400() throws Exception {
        ChoreRequest request = new ChoreRequest();
        request.setHouseholdId(1L);
        request.setAssignedToUserId(2L);
        request.setTitle("");
        request.setDueDate(LocalDate.now());

        mockMvc.perform(post("/api/chores")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void getHouseholdChoresShouldReturn200() throws Exception {
        ChoreResponse response = new ChoreResponse(
                5L,
                "Wash dishes",
                null,
                LocalDate.now(),
                Chore.Status.PENDING,
                1L,
                2L,
                "Roommate",
                1L,
                "User",
                LocalDateTime.now()
        );

        when(choreService.getHouseholdChores(1L, "user@example.com"))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/chores/household/1")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(5))
                .andExpect(jsonPath("$[0].title").value("Wash dishes"));
    }

    @Test
    void completeChoreShouldReturn200() throws Exception {
        ChoreResponse response = new ChoreResponse(
                5L,
                "Wash dishes",
                null,
                LocalDate.now(),
                Chore.Status.COMPLETED,
                1L,
                2L,
                "Roommate",
                1L,
                "User",
                LocalDateTime.now()
        );

        when(choreService.completeChore(5L, "user@example.com"))
                .thenReturn(response);

        mockMvc.perform(put("/api/chores/5/complete")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void completeChoreWhenUnauthorizedShouldReturn403() throws Exception {
        when(choreService.completeChore(5L, "user@example.com"))
                .thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this household"));

        mockMvc.perform(put("/api/chores/5/complete")
                        .principal(auth))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("You are not a member of this household"));
    }
}
