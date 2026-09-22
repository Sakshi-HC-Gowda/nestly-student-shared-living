package com.nestly.nestly_backend.repository;

import com.nestly.nestly_backend.entity.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    List<Invitation> findByInvitedEmail(String invitedEmail);

    List<Invitation> findByHouseholdId(Long householdId);

    Optional<Invitation> findByIdAndInvitedEmail(Long id, String invitedEmail);
}