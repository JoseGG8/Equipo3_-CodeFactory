package com.UdeA.GestionFinanzas.services.strategies;

import com.UdeA.GestionFinanzas.entities.Transaction;
import com.UdeA.GestionFinanzas.services.TransactionService;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class BalanceCalculationStrategy implements FinancialAnalysisStrategy {

    @Override
    public Double analyze(Long userId, LocalDateTime inicio, LocalDateTime fin, TransactionService transactionService) {
        List<Transaction> transacciones = transactionService.consultarHistoricoFiltrado(userId, null, inicio, fin);
        return transacciones.stream().mapToDouble(Transaction::getImpactoFinanciero).sum();
    }
}