package com.UdeA.GestionFinanzas.controllers;

import com.UdeA.GestionFinanzas.entities.User;
import com.UdeA.GestionFinanzas.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private User admin;
    private User normalUser;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setId(1L);
        admin.setNombre("Admin User");
        admin.setEmail("admin@example.com");
        admin.setPassword("adminPass");
        admin.setRol("ADMIN");
        admin.setActivo(true);

        normalUser = new User();
        normalUser.setId(2L);
        normalUser.setNombre("Normal User");
        normalUser.setEmail("user@example.com");
        normalUser.setPassword("userPass");
        normalUser.setRol("USUARIO");
        normalUser.setActivo(true);
    }

    @Test
    void testObtenerUsuarioPorId_Success() throws Exception {
        // Arrange
        when(userService.obtenerUsuarioPorId(2L)).thenReturn(normalUser);

        // Act
        ResponseEntity<?> response = userController.obtenerUsuarioPorId(2L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        User returnedUser = (User) response.getBody();
        assertNotNull(returnedUser);
        assertEquals(2L, returnedUser.getId());
        assertEquals("Normal User", returnedUser.getNombre());
        assertEquals("user@example.com", returnedUser.getEmail());
        assertEquals("USUARIO", returnedUser.getRol());
        assertNull(returnedUser.getPassword()); // Criterio de aceptación: ocultar contraseña
    }

    @Test
    void testListarUsuarios_AsAdmin_Success() throws Exception {
        // Arrange
        when(userService.obtenerUsuarioPorId(1L)).thenReturn(admin);
        
        List<User> userList = Arrays.asList(admin, normalUser);
        Page<User> userPage = new PageImpl<>(userList, PageRequest.of(0, 5), 2);
        when(userService.listarUsuariosPaginados(any())).thenReturn(userPage);

        // Act
        ResponseEntity<?> response = userController.listarUsuarios(1L, 0, 5);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Page<User> returnedPage = (Page<User>) response.getBody();
        assertNotNull(returnedPage);
        
        List<User> content = returnedPage.getContent();
        assertEquals(2, content.size());
        
        assertEquals("Admin User", content.get(0).getNombre());
        assertNull(content.get(0).getPassword()); // Criterio de aceptación: no mostrar contraseñas
        
        assertEquals("Normal User", content.get(1).getNombre());
        assertNull(content.get(1).getPassword()); // Criterio de aceptación: no mostrar contraseñas
        
        assertEquals(1, returnedPage.getTotalPages());
        assertEquals(2, returnedPage.getTotalElements());
    }

    @Test
    void testListarUsuarios_AsNormalUser_Forbidden() throws Exception {
        // Arrange
        when(userService.obtenerUsuarioPorId(2L)).thenReturn(normalUser);

        // Act
        ResponseEntity<?> response = userController.listarUsuarios(2L, 0, 5);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Acceso denegado: Solo los administradores pueden gestionar usuarios.", response.getBody());
    }

    @Test
    void testDesactivarUsuario_AsAdmin_Success() throws Exception {
        // Arrange
        normalUser.setActivo(false);
        when(userService.desactivarUsuario(1L, 2L)).thenReturn(normalUser);

        // Act
        ResponseEntity<?> response = userController.desactivarUsuario(2L, 1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        User returnedUser = (User) response.getBody();
        assertNotNull(returnedUser);
        assertEquals(2L, returnedUser.getId());
        assertFalse(returnedUser.isActivo());
        assertNull(returnedUser.getPassword());
    }
}
