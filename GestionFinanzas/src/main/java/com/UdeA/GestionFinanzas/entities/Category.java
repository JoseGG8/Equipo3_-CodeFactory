package com.UdeA.GestionFinanzas.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "categories")
@Data
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre; // Ej: "Salud", "Transporte"

    @Column(nullable = false)
    private String tipo; // Debe ser "INGRESO" o "GASTO" (HU10)
}