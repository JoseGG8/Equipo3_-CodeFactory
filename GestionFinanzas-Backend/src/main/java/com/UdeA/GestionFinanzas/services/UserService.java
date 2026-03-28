package com.UdeA.GestionFinanzas.services;

import com.UdeA.GestionFinanzas.entities.User;
import com.UdeA.GestionFinanzas.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Lógica para HU1: Registro de cuenta
    public User registrarUsuario(User user) throws Exception {
        // Verificar si el email ya existe (Criterio de aceptación HU1)
        Optional<User> existente = userRepository.findByEmail(user.getEmail());
        if (existente.isPresent()) {
            throw new Exception("El correo electrónico ya está registrado.");
        }
        
        // Por ahora guardamos la contraseña así, luego le pondremos seguridad
        return userRepository.save(user);
    }

    // Lógica para HU2: Inicio de sesión
    public User login(String email, String password) throws Exception {
        return userRepository.findByEmail(email)
                .filter(u -> u.getPassword().equals(password))
                .orElseThrow(() -> new Exception("Credenciales incorrectas"));
    }
}
