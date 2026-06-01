package com.UdeA.GestionFinanzas.services;

import com.UdeA.GestionFinanzas.entities.User;
import com.UdeA.GestionFinanzas.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    public User obtenerUsuarioPorId(Long id) throws Exception {
        return userRepository.findById(id)
                .orElseThrow(() -> new Exception("Usuario no encontrado"));
    }

    public Page<User> listarUsuariosPaginados(Pageable pageable) {
        return userRepository.findAll(pageable);
    }
}
