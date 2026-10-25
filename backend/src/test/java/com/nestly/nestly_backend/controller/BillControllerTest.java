package com.nestly.nestly_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nestly.nestly_backend.dto.BillRequest;
import com.nestly.nestly_backend.dto.BillResponse;
import com.nestly.nestly_backend.entity.Bill;
import com.nestly.nestly_backend.exception.GlobalExceptionHandler;
import com.nestly.nestly_backend.service.BillService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
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

class BillControllerTest {

    private final BillService billService = mock(BillService.class);
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new BillController(billService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    private final UsernamePasswordAuthenticationToken auth =
            new UsernamePasswordAuthenticationToken("user@example.com", "pass");

    @Test
    void createBillShouldReturn201() throws Exception {
        BillRequest request = new BillRequest();
        request.setHouseholdId(1L);
        request.setTitle("Water");
        request.setAmount(new BigDecimal("35.00"));
        request.setDueDate(LocalDate.now().plusDays(5));
        request.setCategory("Utilities");

        BillResponse response = new BillResponse(
                1L,
                "Water",
                new BigDecimal("35.00"),
                request.getDueDate(),
                "Utilities",
                Bill.Status.PENDING,
                1L,
                2L,
                "User",
                LocalDateTime.now()
        );

        when(billService.createBill(any(BillRequest.class), eq("user@example.com")))
                .thenReturn(response);

        mockMvc.perform(post("/api/bills")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Water"));
    }

    @Test
    void getHouseholdBillsShouldReturn200() throws Exception {
        BillResponse response = new BillResponse(
                1L,
                "Water",
                new BigDecimal("35.00"),
                LocalDate.now(),
                "Utilities",
                Bill.Status.PENDING,
                1L,
                2L,
                "User",
                LocalDateTime.now()
        );

        when(billService.getHouseholdBills(1L, "user@example.com"))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/bills/household/1")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Water"));
    }
}
