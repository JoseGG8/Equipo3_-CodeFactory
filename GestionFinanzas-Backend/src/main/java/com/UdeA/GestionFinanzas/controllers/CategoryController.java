package com.UdeA.GestionFinanzas.controllers;

import com.UdeA.GestionFinanzas.entities.Category;
import com.UdeA.GestionFinanzas.services.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*") // Permite CORS para frontend
@RestController
@RequestMapping("/api/categories") // Base URL para categorías
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    /**
     * Endpoint para crear una nueva categoría.
     * HU10: Permite al usuario agregar categorías personalizadas.
     * Método: POST /api/categories
     * Body: {"nombre": "Salud", "tipo": "GASTO"}
     */
    @PostMapping
    public ResponseEntity<?> crearCategoria(@RequestBody Category category) {
        try {
            Category nuevaCategoria = categoryService.crearCategoria(category);
            return ResponseEntity.ok(nuevaCategoria); // 200 OK con la categoría creada
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // 400 Bad Request con mensaje de error
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno del servidor"); // 500 en caso de error inesperado
        }
    }

    /**
     * Endpoint para listar todas las categorías.
     * HU10: Proporciona la lista de categorías disponibles para asignar a transacciones.
     * Método: GET /api/categories
     * Respuesta: Lista de categorías en JSON
     */
    @GetMapping
    public ResponseEntity<List<Category>> listarCategorias() {
        List<Category> categorias = categoryService.listarCategorias();
        return ResponseEntity.ok(categorias); // 200 OK con la lista
    }

    /**
     * Endpoint para obtener una categoría por ID (opcional, para futuras expansiones).
     * Método: GET /api/categories/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerCategoria(@PathVariable Long id) {
        try {
            Category categoria = categoryService.obtenerCategoriaPorId(id);
            return ResponseEntity.ok(categoria);
        } catch (Exception e) {
            return ResponseEntity.notFound().build(); // 404 si no existe
        }
    }
}