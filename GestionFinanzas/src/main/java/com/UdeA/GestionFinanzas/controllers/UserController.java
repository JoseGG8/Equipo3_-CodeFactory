package com.UdeA.GestionFinanzas.controllers;

import com.UdeA.GestionFinanzas.entities.User;
import com.UdeA.GestionFinanzas.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
}