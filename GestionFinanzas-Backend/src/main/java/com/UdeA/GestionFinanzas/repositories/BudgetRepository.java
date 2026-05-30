package com.UdeA.GestionFinanzas.repositories;

import com.UdeA.GestionFinanzas.entities.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    Optional<Budget> findByUsuarioIdAndMesAndAño(Long userId, Integer mes, Integer año);

    List<Budget> findByUsuarioId(Long userId);
}