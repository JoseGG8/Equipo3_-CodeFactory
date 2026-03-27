package com.UdeA.GestionFinanzas.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Entity
@Table(name = "budgets")
@Data
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Min(value = 1, message = "El presupuesto debe ser mayor a cero")
    @Column(nullable = false)
    private Double montoTotal; // Requerido en HU11 [cite: 114]

    @Column(nullable = false)
    private Integer mes; // Requerido en HU11 [cite: 114]

    @Column(nullable = false)
    private Integer año; // Requerido en HU11 [cite: 114]

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User usuario; // Cada presupuesto pertenece a un usuario [cite: 11]
}
