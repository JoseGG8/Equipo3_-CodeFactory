package com.UdeA.GestionFinanzas.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users") // Evitamos usar 'user' porque es palabra reservada en Postgres
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre; // Requerido en HU1 [cite: 29]

    @Column(unique = true, nullable = false)
    private String email; // Requerido y único en HU1 [cite: 29, 30]

    @Column(nullable = false)
    private String password; // Requerido en HU1 [cite: 29]
    
    private String rol; // Para diferenciar Usuario de Administrador [cite: 11, 15]
}
