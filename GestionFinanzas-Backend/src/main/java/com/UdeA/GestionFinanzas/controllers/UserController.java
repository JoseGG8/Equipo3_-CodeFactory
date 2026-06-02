package com.UdeA.GestionFinanzas.controllers;

import com.UdeA.GestionFinanzas.entities.User;
import com.UdeA.GestionFinanzas.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users") // La URL base para los usuarios
public class UserController {

    @Autowired
    private UserService userService;

    // Ruta para HU1: Registro
    @PostMapping("/register")
    public ResponseEntity<?> registrar(@RequestBody User user) {
        try {
            User nuevoUsuario = userService.registrarUsuario(user);
            return ResponseEntity.ok(nuevoUsuario);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Ruta para HU2: Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        try {
            User user = userService.login(email, password);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // Ruta para HU4: Visualizar Perfil de Usuario
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerUsuarioPorId(@PathVariable Long id) {
        try {
            User user = userService.obtenerUsuarioPorId(id);
            // Ocultamos la contraseña antes de retornar el objeto por seguridad
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Ruta para HU5: Administración de Usuarios (Paginada y Protegida)
    @GetMapping
    public ResponseEntity<?> listarUsuarios(
            @RequestParam Long adminId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        try {
            // Criterio de aceptación: validar el rol del usuario que realiza la consulta
            User admin = userService.obtenerUsuarioPorId(adminId);
            if (admin.getRol() == null || !"admin".equalsIgnoreCase(admin.getRol())) {
                return ResponseEntity.status(403).body("Acceso denegado: Solo los administradores pueden gestionar usuarios.");
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<User> usuariosPage = userService.listarUsuariosPaginados(pageable);

            // Criterio de aceptación: Garantizar que no se exponga información sensible (ocultar contraseñas)
            usuariosPage.forEach(u -> u.setPassword(null));

            return ResponseEntity.ok(usuariosPage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> desactivarUsuario(
            @PathVariable("id") Long userId,
            @RequestParam Long adminId) {
        try {
            User desactivado = userService.desactivarUsuario(adminId, userId);
            desactivado.setPassword(null);
            return ResponseEntity.ok(desactivado);
        } catch (Exception e) {
            if (e.getMessage().contains("Acceso denegado")) {
                return ResponseEntity.status(403).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}