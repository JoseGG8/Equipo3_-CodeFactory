package com.UdeA.GestionFinanzas.services;

import com.UdeA.GestionFinanzas.dtos.*;
import com.UdeA.GestionFinanzas.entities.Budget;
import com.UdeA.GestionFinanzas.entities.TransactionType;
import com.UdeA.GestionFinanzas.entities.User;
import com.UdeA.GestionFinanzas.repositories.BudgetRepository;
import com.UdeA.GestionFinanzas.repositories.TransactionRepository;
import com.UdeA.GestionFinanzas.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ReportServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private FinancialAnalysisService financialAnalysisService;

    @InjectMocks
    private ReportService reportService;

    private User testUser;
    private final Long USER_ID = 1L;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(USER_ID);
    }

    // --- Pruebas HU14: Generar reporte de gastos por categoría ---

    @Test
    void testGetCategoryReport_UsuarioSinGastos_RetornaEstructuraLimpia() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(transactionRepository.sumExpensesByCategory(eq(USER_ID), eq(TransactionType.GASTO), any(), any()))
                .thenReturn(Collections.emptyList());

        CategoryReportDTO result = reportService.getCategoryReport(USER_ID, 2023, 10);

        assertNotNull(result);
        assertEquals(0.0, result.getTotalMonthExpense());
        assertTrue(result.getCategories().isEmpty());
    }

    @Test
    void testGetCategoryReport_UsuarioConGastos_CalculaMontosYPorcentajes() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        
        List<CategorySumDTO> mockData = Arrays.asList(
                new CategorySumDTO("Alimentacion", 500.0, 200.0),
                new CategorySumDTO("Transporte", 300.0, 100.0),
                new CategorySumDTO("Salud", 200.0, 150.0)
        ); // Total: 1000.0

        when(transactionRepository.sumExpensesByCategory(eq(USER_ID), eq(TransactionType.GASTO), any(), any()))
                .thenReturn(mockData);

        CategoryReportDTO result = reportService.getCategoryReport(USER_ID, 2023, 10);

        assertEquals(1000.0, result.getTotalMonthExpense());
        assertEquals(3, result.getCategories().size());

        CategoryDetailDTO alimentacion = result.getCategories().stream().filter(c -> c.getCategoryName().equals("Alimentacion")).findFirst().get();
        assertEquals(50.0, alimentacion.getPercentage());
        assertEquals(500.0, alimentacion.getSubtotal());
    }

    // --- Pruebas HU15: Recibir recomendaciones financieras ---

    @Test
    void testGetRecommendations_CategoriaMayor60Porciento_DisparaAlertaCA1() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        
        // 65% de gasto en Alimentacion
        List<CategorySumDTO> mockData = Arrays.asList(
                new CategorySumDTO("Alimentacion", 650.0, 300.0),
                new CategorySumDTO("Transporte", 350.0, 150.0)
        );
        when(transactionRepository.sumExpensesByCategory(eq(USER_ID), eq(TransactionType.GASTO), any(), any()))
                .thenReturn(mockData);

        FinancialRecommendationsDTO result = reportService.getRecommendations(USER_ID, 2023, 10);

        boolean hasAlimentacionWarning = result.getRecommendations().stream()
                .anyMatch(r -> r.getType().equals("ADVERTENCIA") && r.getMessage().contains("Alimentacion") && r.getMessage().contains("65,00") || r.getMessage().contains("65.00"));
        
        assertTrue(hasAlimentacionWarning, "Debe incluir recomendación por superar el 60% en Alimentacion");
    }

    @Test
    void testGetRecommendations_CategoriaMenor60Porciento_NoDisparaAlertaCA1() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        
        // 40% Alimentacion, 60% Transporte
        List<CategorySumDTO> mockData = Arrays.asList(
                new CategorySumDTO("Alimentacion", 400.0, 200.0),
                new CategorySumDTO("Transporte", 600.0, 300.0)
        );
        when(transactionRepository.sumExpensesByCategory(eq(USER_ID), eq(TransactionType.GASTO), any(), any()))
                .thenReturn(mockData);

        FinancialRecommendationsDTO result = reportService.getRecommendations(USER_ID, 2023, 10);

        boolean hasAlimentacionWarning = result.getRecommendations().stream()
                .anyMatch(r -> r.getType().equals("ADVERTENCIA") && r.getMessage().contains("Alimentacion"));
        
        assertFalse(hasAlimentacionWarning, "No debe incluir recomendación porque es el 40%");
    }

    @Test
    void testGetRecommendations_MesAnteriorSaldoCeroONegativo_DisparaAlertaCA2() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(transactionRepository.sumExpensesByCategory(eq(USER_ID), eq(TransactionType.GASTO), any(), any()))
                .thenReturn(Collections.emptyList());
        
        // Saldo anterior es negativo
        when(financialAnalysisService.calcularBalanceTotalPeriodo(eq(USER_ID), any(), any()))
                .thenReturn(-150.0);

        FinancialRecommendationsDTO result = reportService.getRecommendations(USER_ID, 2023, 10);

        boolean hasSavingRecommendation = result.getRecommendations().stream()
                .anyMatch(r -> r.getType().equals("INFO") && r.getMessage().contains("meta de ahorro"));
        
        assertTrue(hasSavingRecommendation, "Debe recomendar ahorrar porque el mes anterior tuvo saldo negativo");
    }

    @Test
    void testGetRecommendations_PresupuestoExcedido_DisparaAlertaCA3() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        
        // Gasto total: 1200
        List<CategorySumDTO> mockData = Arrays.asList(
                new CategorySumDTO("Varios", 1200.0, 500.0)
        );
        when(transactionRepository.sumExpensesByCategory(eq(USER_ID), eq(TransactionType.GASTO), any(), any()))
                .thenReturn(mockData);
        
        // Presupuesto: 1000
        Budget budget = new Budget();
        budget.setMontoTotal(1000.0);
        when(budgetRepository.findByUsuarioIdAndMesAndAño(eq(USER_ID), eq(10), eq(2023)))
                .thenReturn(Optional.of(budget));

        FinancialRecommendationsDTO result = reportService.getRecommendations(USER_ID, 2023, 10);

        boolean hasBudgetAlert = result.getRecommendations().stream()
                .anyMatch(r -> r.getType().equals("CRITICA") && r.getMessage().contains("excedido tu presupuesto"));
        
        assertTrue(hasBudgetAlert, "Debe disparar alerta crítica por presupuesto excedido");
    }
}
