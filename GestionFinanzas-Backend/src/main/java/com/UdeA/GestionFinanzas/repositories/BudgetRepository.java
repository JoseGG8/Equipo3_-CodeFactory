package com.UdeA.GestionFinanzas.repositories;

import com.UdeA.GestionFinanzas.entities.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    // Para evitar duplicados de mes/año como pide la HU11 [cite: 116]
    Optional<Budget> findByUsuarioIdAndMesAndAño(Long userId, Integer mes, Integer año);
}