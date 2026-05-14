package com.UdeA.GestionFinanzas.services.strategies;

import com.UdeA.GestionFinanzas.entities.Transaction;
import com.UdeA.GestionFinanzas.services.TransactionService;

import java.time.LocalDateTime;
import java.util.List;

public interface FinancialAnalysisStrategy {
    Double analyze(Long userId, LocalDateTime inicio, LocalDateTime fin, TransactionService transactionService);
}