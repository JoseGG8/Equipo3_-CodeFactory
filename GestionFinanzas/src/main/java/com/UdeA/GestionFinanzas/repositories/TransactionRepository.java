package com.UdeA.GestionFinanzas.repositories;

import com.UdeA.GestionFinanzas.entities.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Esto servirá para los reportes de la HU13
    List<Transaction> findByUsuarioId(Long userId);
}
