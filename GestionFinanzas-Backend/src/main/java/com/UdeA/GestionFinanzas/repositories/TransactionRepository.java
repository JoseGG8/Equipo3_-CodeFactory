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

    @org.springframework.data.jpa.repository.Query("SELECT new com.UdeA.GestionFinanzas.dtos.CategorySumDTO(t.categoria.nombre, SUM(t.monto), MAX(t.monto)) " +
           "FROM Transaction t " +
           "WHERE t.usuario.id = :userId AND t.tipo = :tipo AND t.fecha >= :inicio AND t.fecha <= :fin " +
           "GROUP BY t.categoria.nombre")
    List<com.UdeA.GestionFinanzas.dtos.CategorySumDTO> sumExpensesByCategory(
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("tipo") TransactionType tipo,
            @org.springframework.data.repository.query.Param("inicio") LocalDateTime inicio,
            @org.springframework.data.repository.query.Param("fin") LocalDateTime fin
    );
}
