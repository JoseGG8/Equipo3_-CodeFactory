package com.UdeA.GestionFinanzas;

import com.UdeA.GestionFinanzas.entities.User;
import com.UdeA.GestionFinanzas.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class GestionFinanzasApplication {

	public static void main(String[] args) {
		SpringApplication.run(GestionFinanzasApplication.class, args);
	}

	@Bean
	public CommandLineRunner seedAdmin(UserRepository userRepository) {
		return args -> {
			String adminEmail = "admin@codefactory.test";
			if (userRepository.findByEmail(adminEmail).isEmpty()) {
				User admin = new User();
				admin.setNombre("Administrador");
				admin.setEmail(adminEmail);
				admin.setPassword("Admin1234!");
				admin.setRol("admin");
				userRepository.save(admin);
			}
		};
	}
}
