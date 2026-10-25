package com.nestly.nestly_backend.service;

import com.nestly.nestly_backend.dto.GroceryRequest;
import com.nestly.nestly_backend.dto.GroceryResponse;
import com.nestly.nestly_backend.dto.UpdateGroceryRequest;
import com.nestly.nestly_backend.entity.GroceryItem;
import com.nestly.nestly_backend.entity.Household;
import com.nestly.nestly_backend.entity.User;
import com.nestly.nestly_backend.repository.GroceryRepository;
import com.nestly.nestly_backend.repository.HouseholdMemberRepository;
import com.nestly.nestly_backend.repository.HouseholdRepository;
import com.nestly.nestly_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class GroceryService {

    private final GroceryRepository groceryRepository;
    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository householdMemberRepository;
    private final UserRepository userRepository;

    public GroceryService(
            GroceryRepository groceryRepository,
            HouseholdRepository householdRepository,
            HouseholdMemberRepository householdMemberRepository,
            UserRepository userRepository) {

        this.groceryRepository = groceryRepository;
        this.householdRepository = householdRepository;
        this.householdMemberRepository = householdMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public GroceryResponse createGrocery(
            GroceryRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Household household = householdRepository
                .findById(request.getHouseholdId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Household not found"));

        boolean isMember =
                householdMemberRepository.existsByUserIdAndHouseholdId(
                        user.getId(),
                        household.getId()
                );

        if (!isMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a member of this household"
            );
        }

        GroceryItem item = new GroceryItem();

        item.setHousehold(household);
        item.setAddedBy(user);
        item.setName(request.getName());
        item.setQuantity(request.getQuantity());
        item.setEstimatedPrice(request.getEstimatedPrice());
        item.setStatus(GroceryItem.Status.PENDING);

        GroceryItem savedItem = groceryRepository.save(item);

        return convertToResponse(savedItem);
    }

    public List<GroceryResponse> getHouseholdGroceries(
            Long householdId,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean isMember =
                householdMemberRepository.existsByUserIdAndHouseholdId(
                        user.getId(),
                        householdId
                );

        if (!isMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a member of this household"
            );
        }

        return groceryRepository.findByHouseholdId(householdId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Transactional
    public void deleteGrocery(Long itemId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        GroceryItem item = groceryRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grocery item not found"));

        boolean isMember = householdMemberRepository.existsByUserIdAndHouseholdId(
                user.getId(),
                item.getHousehold().getId()
        );

        if (!isMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a member of this household"
            );
        }

        groceryRepository.delete(item);
    }

    @Transactional
    public GroceryResponse toggleGroceryStatus(Long itemId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        GroceryItem item = groceryRepository.findByIdWithDetails(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grocery item not found"));

        boolean isMember = householdMemberRepository.existsByUserIdAndHouseholdId(
                user.getId(),
                item.getHousehold().getId()
        );

        if (!isMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a member of this household"
            );
        }

        item.setStatus(item.getStatus() == GroceryItem.Status.PURCHASED
                ? GroceryItem.Status.PENDING
                : GroceryItem.Status.PURCHASED);

        GroceryItem savedItem = groceryRepository.save(item);

        return convertToResponse(savedItem);
    }

    @Transactional
    public GroceryResponse updateGrocery(Long itemId, UpdateGroceryRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        GroceryItem item = groceryRepository.findByIdWithDetails(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grocery item not found"));

        boolean isMember = householdMemberRepository.existsByUserIdAndHouseholdId(
                user.getId(),
                item.getHousehold().getId()
        );

        if (!isMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a member of this household"
            );
        }

        item.setName(request.getName());
        if (request.getQuantity() != null && !request.getQuantity().isBlank()) {
            item.setQuantity(request.getQuantity());
        }
        if (request.getEstimatedPrice() != null) {
            item.setEstimatedPrice(request.getEstimatedPrice());
        }

        GroceryItem savedItem = groceryRepository.save(item);

        return convertToResponse(savedItem);
    }

    private GroceryResponse convertToResponse(GroceryItem item) {

        return new GroceryResponse(
                item.getId(),
                item.getName(),
                item.getQuantity(),
                item.getEstimatedPrice(),
                item.getStatus(),
                item.getHousehold().getId(),
                item.getAddedBy().getId(),
                item.getAddedBy().getName(),
                item.getCreatedAt()
        );
    }
}