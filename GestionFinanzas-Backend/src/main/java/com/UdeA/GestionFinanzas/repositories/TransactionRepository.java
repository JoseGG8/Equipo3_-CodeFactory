package com.UdeA.GestionFinanzas.repositories;

import com.UdeA.GestionFinanzas.entities.Transaction;
import com.UdeA.GestionFinanzas.entities.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByUsuarioIdAndTipoAndFechaBetween(
        Long userId, 
        TransactionType tipo, 
        LocalDateTime inicio, 
        LocalDateTime fin
    );

    List<Transaction> findByUsuarioIdAndFechaBetween(
        Long userId,
        LocalDateTime inicio,
        LocalDateTime fin
    );

    List<Transaction> findByPresupuestoId(Long budgetId);
}

