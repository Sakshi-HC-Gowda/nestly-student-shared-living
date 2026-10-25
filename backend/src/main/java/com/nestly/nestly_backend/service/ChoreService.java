package com.nestly.nestly_backend.service;

import com.nestly.nestly_backend.dto.ChoreRequest;
import com.nestly.nestly_backend.dto.ChoreResponse;
import com.nestly.nestly_backend.entity.Chore;
import com.nestly.nestly_backend.entity.Household;
import com.nestly.nestly_backend.entity.User;
import com.nestly.nestly_backend.repository.ChoreRepository;
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
public class ChoreService {

    private final ChoreRepository choreRepository;
    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository householdMemberRepository;
    private final UserRepository userRepository;

    public ChoreService(
            ChoreRepository choreRepository,
            HouseholdRepository householdRepository,
            HouseholdMemberRepository householdMemberRepository,
            UserRepository userRepository) {

        this.choreRepository = choreRepository;
        this.householdRepository = householdRepository;
        this.householdMemberRepository = householdMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ChoreResponse createChore(
            ChoreRequest request,
            String email) {

        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Household household = householdRepository
                .findById(request.getHouseholdId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Household not found"));

        boolean creatorIsMember =
                householdMemberRepository.existsByUserIdAndHouseholdId(
                        creator.getId(),
                        household.getId()
                );

        if (!creatorIsMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a member of this household"
            );
        }

        User assignedUser = userRepository
                .findById(request.getAssignedToUserId())
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigned user not found")
                );

        boolean assignedUserIsMember =
                householdMemberRepository.existsByUserIdAndHouseholdId(
                        assignedUser.getId(),
                        household.getId()
                );

        if (!assignedUserIsMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Assigned user is not a member of this household"
            );
        }

        Chore chore = new Chore();

        chore.setHousehold(household);
        chore.setCreatedBy(creator);
        chore.setAssignedTo(assignedUser);
        chore.setTitle(request.getTitle());
        chore.setDescription(request.getDescription());
        chore.setDueDate(request.getDueDate());
        chore.setStatus(Chore.Status.PENDING);

        Chore savedChore = choreRepository.save(chore);

        return convertToResponse(savedChore);
    }

    public List<ChoreResponse> getHouseholdChores(
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

        return choreRepository.findByHouseholdId(householdId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Transactional
    public ChoreResponse completeChore(
            Long choreId,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Chore chore = choreRepository.findByIdWithDetails(choreId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chore not found"));

        boolean isMember = householdMemberRepository.existsByUserIdAndHouseholdId(
                user.getId(),
                chore.getHousehold().getId()
        );

        if (!isMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a member of this household"
            );
        }

        chore.setStatus(Chore.Status.COMPLETED);
        Chore savedChore = choreRepository.save(chore);

        return convertToResponse(savedChore);
    }

    private ChoreResponse convertToResponse(Chore chore) {

        return new ChoreResponse(
                chore.getId(),
                chore.getTitle(),
                chore.getDescription(),
                chore.getDueDate(),
                chore.getStatus(),
                chore.getHousehold().getId(),
                chore.getAssignedTo().getId(),
                chore.getAssignedTo().getName(),
                chore.getCreatedBy().getId(),
                chore.getCreatedBy().getName(),
                chore.getCreatedAt()
        );
    }
}