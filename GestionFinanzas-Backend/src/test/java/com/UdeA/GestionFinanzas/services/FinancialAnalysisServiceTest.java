package com.UdeA.GestionFinanzas.services;

import com.UdeA.GestionFinanzas.entities.Gasto;
import com.UdeA.GestionFinanzas.entities.Ingreso;
import com.UdeA.GestionFinanzas.entities.Transaction;
import com.UdeA.GestionFinanzas.entities.TransactionType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FinancialAnalysisServiceTest {

    @Mock
    private TransactionService transactionService;

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
        Ingreso ingreso = new Ingreso();
        ingreso.setMonto(1000.0);

        Gasto gasto = new Gasto();
        gasto.setMonto(500.0);

        List<Transaction> transactions = Arrays.asList(ingreso, gasto);

        when(transactionService.consultarHistoricoFiltrado(userId, null, inicio, fin)).thenReturn(transactions);

        // Act
        Double result = financialAnalysisService.calcularBalanceTotalPeriodo(userId, inicio, fin);

        // Assert
        assertEquals(500.0, result); // 1000 - 500
    }

    @Test
    void testCalcularBalanceTotalPeriodo_NoTransactions() {
        // Arrange
        when(transactionService.consultarHistoricoFiltrado(userId, null, inicio, fin)).thenReturn(Collections.emptyList());

        // Act
        Double result = financialAnalysisService.calcularBalanceTotalPeriodo(userId, inicio, fin);

        // Assert
        assertEquals(0.0, result);
    }

    @Test
    void testCalcularTasaAhorro_WithIngresosAndBalance() {
        // Arrange
        Ingreso ingreso1 = new Ingreso();
        ingreso1.setMonto(2000.0);

        Ingreso ingreso2 = new Ingreso();
        ingreso2.setMonto(1000.0);

        List<Transaction> ingresos = Arrays.asList(ingreso1, ingreso2);

        Ingreso ingreso = new Ingreso();
        ingreso.setMonto(2000.0);

        Gasto gasto = new Gasto();
        gasto.setMonto(500.0);

        List<Transaction> allTransactions = Arrays.asList(ingreso, gasto);

        when(transactionService.consultarHistoricoFiltrado(userId, TransactionType.INGRESO, inicio, fin)).thenReturn(ingresos);
        when(transactionService.consultarHistoricoFiltrado(userId, null, inicio, fin)).thenReturn(allTransactions);

        // Act
        Double result = financialAnalysisService.calcularTasaAhorro(userId, inicio, fin);

        // Assert
        assertEquals(50.0, result); // (1500 / 3000) * 100 = 50%
    }

    @Test
    void testCalcularTasaAhorro_NoIngresos() {
        // Arrange
        List<Transaction> ingresos = Collections.emptyList();

        Ingreso ingreso = new Ingreso();
        ingreso.setMonto(1000.0);

        Gasto gasto = new Gasto();
        gasto.setMonto(500.0);

        List<Transaction> allTransactions = Arrays.asList(ingreso, gasto);

        when(transactionService.consultarHistoricoFiltrado(userId, TransactionType.INGRESO, inicio, fin)).thenReturn(ingresos);
        when(transactionService.consultarHistoricoFiltrado(userId, null, inicio, fin)).thenReturn(allTransactions);

        // Act
        Double result = financialAnalysisService.calcularTasaAhorro(userId, inicio, fin);

        // Assert
        assertEquals(0.0, result); // Evita división por cero
    }

    @Test
    void testCalcularTasaAhorro_ZeroBalance() {
        // Arrange
        Ingreso ingreso1 = new Ingreso();
        ingreso1.setMonto(1000.0);

        List<Transaction> ingresos = Arrays.asList(ingreso1);

        Ingreso ingreso = new Ingreso();
        ingreso.setMonto(1000.0);

        Gasto gasto = new Gasto();
        gasto.setMonto(1000.0);

        List<Transaction> allTransactions = Arrays.asList(ingreso, gasto);

        when(transactionService.consultarHistoricoFiltrado(userId, TransactionType.INGRESO, inicio, fin)).thenReturn(ingresos);
        when(transactionService.consultarHistoricoFiltrado(userId, null, inicio, fin)).thenReturn(allTransactions);

        // Act
        Double result = financialAnalysisService.calcularTasaAhorro(userId, inicio, fin);

        // Assert
        assertEquals(0.0, result); // Balance = 0
    }
}