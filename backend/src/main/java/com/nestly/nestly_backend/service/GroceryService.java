package com.nestly.nestly_backend.service;

import com.nestly.nestly_backend.dto.GroceryRequest;
import com.nestly.nestly_backend.dto.GroceryResponse;
import com.nestly.nestly_backend.entity.GroceryItem;
import com.nestly.nestly_backend.entity.Household;
import com.nestly.nestly_backend.entity.User;
import com.nestly.nestly_backend.repository.GroceryRepository;
import com.nestly.nestly_backend.repository.HouseholdMemberRepository;
import com.nestly.nestly_backend.repository.HouseholdRepository;
import com.nestly.nestly_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
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

    public GroceryResponse createGrocery(
            GroceryRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Household household = householdRepository
                .findById(request.getHouseholdId())
                .orElseThrow(() -> new RuntimeException("Household not found"));

        boolean isMember =
                householdMemberRepository.existsByUserIdAndHouseholdId(
                        user.getId(),
                        household.getId()
                );

        if (!isMember) {
            throw new RuntimeException(
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
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isMember =
                householdMemberRepository.existsByUserIdAndHouseholdId(
                        user.getId(),
                        householdId
                );

        if (!isMember) {
            throw new RuntimeException(
                    "You are not a member of this household"
            );
        }

        return groceryRepository.findByHouseholdId(householdId)
                .stream()
                .map(this::convertToResponse)
                .toList();
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