package com.nestly.nestly_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nestly.nestly_backend.dto.HouseholdMemberResponse;
import com.nestly.nestly_backend.dto.HouseholdRequest;
import com.nestly.nestly_backend.dto.JoinHouseholdRequest;
import com.nestly.nestly_backend.entity.Household;
import com.nestly.nestly_backend.entity.HouseholdMember;
import com.nestly.nestly_backend.exception.GlobalExceptionHandler;
import com.nestly.nestly_backend.service.HouseholdService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class HouseholdControllerTest {

    private final HouseholdService householdService = mock(HouseholdService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new HouseholdController(householdService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    private final UsernamePasswordAuthenticationToken auth =
            new UsernamePasswordAuthenticationToken("user@example.com", "pass");

    @Test
    void createHouseholdShouldReturn201() throws Exception {
        HouseholdRequest request = new HouseholdRequest();
        request.setName("Sunset Villa");
        request.setAccommodationType("House");

        Household household = new Household();
        household.setName("Sunset Villa");
        household.setAccommodationType("House");
        household.setInviteCode("SUN123");

        when(householdService.createHousehold(any(HouseholdRequest.class), eq("user@example.com")))
                .thenReturn(household);

        mockMvc.perform(post("/api/households")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Sunset Villa"))
                .andExpect(jsonPath("$.inviteCode").value("SUN123"));
    }

    @Test
    void createHouseholdWithBlankNameShouldReturn400() throws Exception {
        HouseholdRequest request = new HouseholdRequest();
        request.setName("");

        mockMvc.perform(post("/api/households")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void getMyHouseholdsShouldReturn200() throws Exception {
        Household household = new Household();
        household.setName("Sunset Villa");

        when(householdService.getMyHouseholds("user@example.com"))
                .thenReturn(List.of(household));

        mockMvc.perform(get("/api/households")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Sunset Villa"));
    }

    @Test
    void getHouseholdMembersShouldReturn200() throws Exception {
        HouseholdMemberResponse member = new HouseholdMemberResponse(
                1L,
                2L,
                "Roommate",
                HouseholdMember.Role.MEMBER,
                LocalDateTime.now()
        );

        when(householdService.getHouseholdMembers(5L, "user@example.com"))
                .thenReturn(List.of(member));

        mockMvc.perform(get("/api/households/5/members")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Roommate"));
    }

    @Test
    void getInviteCodeShouldReturn200() throws Exception {
        when(householdService.getInviteCode(5L, "user@example.com"))
                .thenReturn("INV999");

        mockMvc.perform(get("/api/households/5/invite-code")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inviteCode").value("INV999"));
    }

    @Test
    void joinHouseholdShouldReturn200() throws Exception {
        JoinHouseholdRequest request = new JoinHouseholdRequest();
        request.setInviteCode("ABC123");

        Household household = new Household();
        household.setName("Joined House");

        when(householdService.joinHousehold(any(JoinHouseholdRequest.class), eq("user@example.com")))
                .thenReturn(household);

        mockMvc.perform(post("/api/households/join")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Joined House"));
    }

    @Test
    void joinHouseholdWhenAlreadyMemberShouldReturn409() throws Exception {
        JoinHouseholdRequest request = new JoinHouseholdRequest();
        request.setInviteCode("ABC123");

        when(householdService.joinHousehold(any(JoinHouseholdRequest.class), eq("user@example.com")))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "You are already a member of this household"));

        mockMvc.perform(post("/api/households/join")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("You are already a member of this household"));
    }
}
