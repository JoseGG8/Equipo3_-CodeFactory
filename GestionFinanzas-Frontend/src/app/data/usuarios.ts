// Interface para usuario
export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  contraseña: string;
  fechaRegistro: string;
}

const CLAVE_USUARIOS = 'app_usuarios_registrados';

// Cargar usuarios desde localStorage (sin cuenta demo)
function cargarUsuarios(): Usuario[] {
  try {
    const guardados = localStorage.getItem(CLAVE_USUARIOS);
    return guardados ? JSON.parse(guardados) : [];
  } catch {
    return [];
  }
}

function guardarUsuarios(lista: Usuario[]): void {
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(lista));
}

// Simulación de base de datos de usuarios (sin demo)
let usuariosRegistrados: Usuario[] = cargarUsuarios();

// Función para verificar si el correo ya está registrado
export function correoYaRegistrado(correo: string): boolean {
  usuariosRegistrados = cargarUsuarios();
  return usuariosRegistrados.some(
    usuario => usuario.correo.toLowerCase() === correo.toLowerCase()
  );
}

// Función para registrar un nuevo usuario
export function registrarUsuario(usuario: Omit<Usuario, 'id' | 'fechaRegistro'>): Usuario {
  usuariosRegistrados = cargarUsuarios();
  const nuevoUsuario: Usuario = {
    ...usuario,
    id: Date.now().toString(),
    fechaRegistro: new Date().toISOString().split('T')[0]
  };

  usuariosRegistrados.push(nuevoUsuario);
  guardarUsuarios(usuariosRegistrados);
  return nuevoUsuario;
}

// Función para obtener todos los usuarios (para desarrollo/debug)
export function obtenerUsuarios(): Usuario[] {
  return [...cargarUsuarios()];
}

// Reglas de seguridad para contraseñas
export interface ReglasContraseña {
  longitudMinima: number;
  requiereMayuscula: boolean;
  requiereMinuscula: boolean;
  requiereNumero: boolean;
  requiereCaracterEspecial: boolean;
}

export const REGLAS_CONTRASEÑA: ReglasContraseña = {
  longitudMinima: 8,
  requiereMayuscula: true,
  requiereMinuscula: true,
  requiereNumero: true,
  requiereCaracterEspecial: true
};

// Función para validar contraseña
export function validarContraseña(contraseña: string): { valida: boolean; errores: string[] } {
  const errores: string[] = [];

  if (contraseña.length < REGLAS_CONTRASEÑA.longitudMinima) {
    errores.push(`La contraseña debe tener al menos ${REGLAS_CONTRASEÑA.longitudMinima} caracteres`);
  }

  if (REGLAS_CONTRASEÑA.requiereMayuscula && !/[A-Z]/.test(contraseña)) {
    errores.push('La contraseña debe contener al menos una letra mayúscula');
  }

  if (REGLAS_CONTRASEÑA.requiereMinuscula && !/[a-z]/.test(contraseña)) {
    errores.push('La contraseña debe contener al menos una letra minúscula');
  }

  if (REGLAS_CONTRASEÑA.requiereNumero && !/[0-9]/.test(contraseña)) {
    errores.push('La contraseña debe contener al menos un número');
  }

  if (REGLAS_CONTRASEÑA.requiereCaracterEspecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contraseña)) {
    errores.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*...)');
  }

  return {
    valida: errores.length === 0,
    errores
  };
}

// Función para validar formato de correo electrónico
export function validarCorreo(correo: string): boolean {
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexCorreo.test(correo);
}

// Interface para resultado de autenticación
export interface ResultadoAutenticacion {
  exito: boolean;
  usuario?: Usuario;
  mensaje?: string;
}

// Función para autenticar usuario
export function autenticarUsuario(correo: string, contraseña: string): ResultadoAutenticacion {
  const lista = cargarUsuarios();
  const usuario = lista.find(
    u => u.correo.toLowerCase() === correo.toLowerCase()
  );

  if (!usuario) {
    return {
      exito: false,
      mensaje: 'No existe una cuenta con este correo electrónico'
    };
  }

  if (usuario.contraseña !== contraseña) {
    return {
      exito: false,
      mensaje: 'Contraseña incorrecta'
    };
  }

  return {
    exito: true,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      contraseña: usuario.contraseña,
      fechaRegistro: usuario.fechaRegistro
    }
  };
}

// Función para obtener intentos restantes (para uso futuro)
export function obtenerIntentosRestantes(correo: string): number {
  return 5;
}

// Función para bloquear usuario (placeholder para expansión futura)
export function bloquearUsuario(correo: string): void {
  console.log(`Usuario ${correo} bloqueado temporalmente`);
}