package com.UdeA.GestionFinanzas.services;

import com.UdeA.GestionFinanzas.entities.Category;
import com.UdeA.GestionFinanzas.entities.Transaction;
import com.UdeA.GestionFinanzas.entities.User;
import com.UdeA.GestionFinanzas.repositories.CategoryRepository;
import com.UdeA.GestionFinanzas.repositories.TransactionRepository;
import com.UdeA.GestionFinanzas.repositories.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@SpringBootTest
@Transactional
public class TransactionServiceTests {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    private User user;
    private Category ingresoCategory;
    private Category gastoCategory;

    @BeforeEach
    void setUp() {
        transactionRepository.deleteAll();
        userRepository.deleteAll();
        categoryRepository.deleteAll();

        user = new User();
        user.setNombre("Test");
        user.setEmail("test@example.com");
        user.setPassword("1234");
        user = userRepository.save(user);

        ingresoCategory = new Category();
        ingresoCategory.setNombre("Sueldo");
        ingresoCategory.setTipo("INGRESO");
        ingresoCategory = categoryRepository.save(ingresoCategory);

        gastoCategory = new Category();
        gastoCategory.setNombre("Comida");
        gastoCategory.setTipo("GASTO");
        gastoCategory = categoryRepository.save(gastoCategory);
    }

    @Test
    void registrarIngreso_valido_guardaTransaccionYActualizaBalance() throws Exception {
        Transaction t = transactionService.registrarIngreso(user.getId(), ingresoCategory.getId(), 1000.0, LocalDate.now(), "Sueldo mensual");

        Assertions.assertNotNull(t.getId());
        Assertions.assertEquals("INGRESO", t.getTipo());
        Assertions.assertEquals(1000.0, t.getMonto());
        Assertions.assertEquals(user.getId(), t.getUsuario().getId());
        Assertions.assertEquals(ingresoCategory.getId(), t.getCategoria().getId());

        List<Transaction> transacciones = transactionService.listarTransaccionesPorUsuario(user.getId());
        Assertions.assertFalse(transacciones.isEmpty());
        Assertions.assertEquals(1000.0, transactionService.calcularBalanceUsuario(user.getId()));
    }

    @Test
    void registrarIngreso_montoCero_lanzaIllegalArgumentException() {
        IllegalArgumentException ex = Assertions.assertThrows(IllegalArgumentException.class, () -> {
            transactionService.registrarIngreso(user.getId(), ingresoCategory.getId(), 0.0, LocalDate.now(), "Cero");
        });
        Assertions.assertTrue(ex.getMessage().contains("mayor a cero"));
    }

    @Test
    void registrarIngreso_categoriaNoIngreso_lanzaIllegalArgumentException() {
        IllegalArgumentException ex = Assertions.assertThrows(IllegalArgumentException.class, () -> {
            transactionService.registrarIngreso(user.getId(), gastoCategory.getId(), 100.0, LocalDate.now(), "No ingreso");
        });
        Assertions.assertTrue(ex.getMessage().contains("categoría no corresponde a un ingreso"));
    }
}
