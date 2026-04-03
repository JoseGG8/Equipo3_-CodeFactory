package com.UdeA.GestionFinanzas.services;

import com.UdeA.GestionFinanzas.entities.Category;
import com.UdeA.GestionFinanzas.repositories.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Crea una nueva categoría con validaciones.
     * HU10: Permite al usuario crear categorías para clasificar transacciones.
     */
    public Category crearCategoria(Category category) throws Exception {
        // Validación: nombre obligatorio
        if (category.getNombre() == null || category.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio");
        }

        // Validación: tipo debe ser INGRESO o GASTO
        if (!"INGRESO".equalsIgnoreCase(category.getTipo()) && !"GASTO".equalsIgnoreCase(category.getTipo())) {
            throw new IllegalArgumentException("El tipo debe ser INGRESO o GASTO");
        }

        // Validación: nombre único (opcional, pero buena práctica)
        if (categoryRepository.findAll().stream().anyMatch(c -> c.getNombre().equalsIgnoreCase(category.getNombre()))) {
            throw new IllegalArgumentException("Ya existe una categoría con ese nombre");
        }

        return categoryRepository.save(category);
    }

    /**
     * Lista todas las categorías disponibles.
     * HU10: Proporciona la lista para mostrar al usuario al registrar transacciones.
     */
    public List<Category> listarCategorias() {
        return categoryRepository.findAll();
    }

    /**
     * Busca una categoría por ID (útil para validaciones en transacciones).
     */
    public Category obtenerCategoriaPorId(Long id) throws Exception {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new Exception("Categoría no encontrada"));
    }
}