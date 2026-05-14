package com.UdeA.GestionFinanzas.services.strategies;

import com.UdeA.GestionFinanzas.entities.Transaction;
import com.UdeA.GestionFinanzas.entities.TransactionType;
import com.UdeA.GestionFinanzas.services.TransactionService;

import java.time.LocalDateTime;
import java.util.List;

public class SavingsRateCalculationStrategy implements FinancialAnalysisStrategy {

    @Override
    public Double analyze(Long userId, LocalDateTime inicio, LocalDateTime fin, TransactionService transactionService) {
        List<Transaction> ingresos = transactionService.consultarHistoricoFiltrado(userId, TransactionType.INGRESO, inicio, fin);
        Double totalIngresos = ingresos.stream().mapToDouble(Transaction::getMonto).sum();
        List<Transaction> transacciones = transactionService.consultarHistoricoFiltrado(userId, null, inicio, fin);
        Double balance = transacciones.stream().mapToDouble(Transaction::getImpactoFinanciero).sum();
        if (totalIngresos == 0) {
            return 0.0;
        }
        return (balance / totalIngresos) * 100;
    }
}