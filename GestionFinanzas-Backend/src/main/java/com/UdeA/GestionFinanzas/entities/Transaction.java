package com.UdeA.GestionFinanzas.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Data;
import java.time.LocalDateTime; // Cambiado de LocalDate a LocalDateTime para reportes precisos

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@Entity
@Table(name = "transactions")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo", discriminatorType = DiscriminatorType.STRING)
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "tipo",
    visible = true
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = Ingreso.class, name = "INGRESO"),
    @JsonSubTypes.Type(value = Gasto.class, name = "GASTO")
})
@Data
public abstract class Transaction {
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
    @Column(name = "tipo", insertable = false, updatable = false)
    private TransactionType tipo; // Cambiado de String a Enum

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User usuario;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category categoria;

    // Método polimórfico
    public abstract Double getImpactoFinanciero();
}
