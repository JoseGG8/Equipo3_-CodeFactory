package com.UdeA.GestionFinanzas.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Data;
import java.time.LocalDateTime; // Cambiado de LocalDate a LocalDateTime para reportes precisos

@Entity
@Table(name = "transactions")
@Data
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Min(value = 1, message = "El monto debe ser mayor a cero")
    @Column(nullable = false)
    private Double monto;

    private String descripcion;

    @Column(nullable = false)
    private LocalDateTime fecha; // LocalDateTime permite saber la hora exacta del gasto/ingreso

    @Enumerated(EnumType.STRING) // Esto guarda "INGRESO" en la BD en lugar de números
    @Column(nullable = false)
    private TransactionType tipo; // Cambiado de String a Enum

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User usuario;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category categoria;
}
