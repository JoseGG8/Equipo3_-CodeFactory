package com.UdeA.GestionFinanzas.repositories;

import com.UdeA.GestionFinanzas.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Esto servirá para la HU1: "verificar que el correo no haya sido registrado previamente"
    Optional<User> findByEmail(String email); 
}
