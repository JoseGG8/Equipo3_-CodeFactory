package com.UdeA.GestionFinanzas.services;

import com.UdeA.GestionFinanzas.services.strategies.BalanceCalculationStrategy;
import com.UdeA.GestionFinanzas.services.strategies.SavingsRateCalculationStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FinancialAnalysisServiceTest {

    @Mock
    private TransactionService transactionService;

    @Mock
    private BalanceCalculationStrategy balanceStrategy;

    @Mock
    private SavingsRateCalculationStrategy savingsRateStrategy;

    @InjectMocks
    private FinancialAnalysisService financialAnalysisService;

    private Long userId;
    private LocalDateTime inicio;
    private LocalDateTime fin;

    @BeforeEach
    void setUp() {
        userId = 1L;
        inicio = LocalDateTime.of(2023, 1, 1, 0, 0);
        fin = LocalDateTime.of(2023, 12, 31, 23, 59);
    }

    @Test
    void testCalcularBalanceTotalPeriodo_WithTransactions() {
        // Arrange
        when(balanceStrategy.analyze(userId, inicio, fin, transactionService)).thenReturn(500.0);

        // Act
        Double result = financialAnalysisService.calcularBalanceTotalPeriodo(userId, inicio, fin);

        // Assert
        assertEquals(500.0, result);
    }

    @Test
    void testCalcularBalanceTotalPeriodo_NoTransactions() {
        // Arrange
        when(balanceStrategy.analyze(userId, inicio, fin, transactionService)).thenReturn(0.0);

        // Act
        Double result = financialAnalysisService.calcularBalanceTotalPeriodo(userId, inicio, fin);

        // Assert
        assertEquals(0.0, result);
    }

    @Test
    void testCalcularTasaAhorro_WithIngresosAndBalance() {
        // Arrange
        when(savingsRateStrategy.analyze(userId, inicio, fin, transactionService)).thenReturn(50.0);

        // Act
        Double result = financialAnalysisService.calcularTasaAhorro(userId, inicio, fin);

        // Assert
        assertEquals(50.0, result);
    }

    @Test
    void testCalcularTasaAhorro_NoIngresos() {
        // Arrange
        when(savingsRateStrategy.analyze(userId, inicio, fin, transactionService)).thenReturn(0.0);

        // Act
        Double result = financialAnalysisService.calcularTasaAhorro(userId, inicio, fin);

        // Assert
        assertEquals(0.0, result);
    }

    @Test
    void testCalcularTasaAhorro_ZeroBalance() {
        // Arrange
        when(savingsRateStrategy.analyze(userId, inicio, fin, transactionService)).thenReturn(0.0);

        // Act
        Double result = financialAnalysisService.calcularTasaAhorro(userId, inicio, fin);

        // Assert
        assertEquals(0.0, result);
    }
}