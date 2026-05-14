package com.UdeA.GestionFinanzas.services.strategies;

import com.UdeA.GestionFinanzas.services.TransactionService;
import java.time.LocalDateTime;


public interface FinancialAnalysisStrategy {
    Double analyze(Long userId, LocalDateTime inicio, LocalDateTime fin, TransactionService transactionService);
}