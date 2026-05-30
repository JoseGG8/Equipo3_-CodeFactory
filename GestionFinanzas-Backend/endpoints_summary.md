# 📘 Guía de Endpoints del Backend (Gestión de Finanzas)

Este documento es una guía de referencia para el equipo de desarrollo Frontend. Detalla todos los endpoints expuestos por la API REST, explicando **cómo consumirlos**, **para qué sirven** y **en qué vistas o componentes del frontend** deberían ser implementados.

---

## 1. 🧑‍💼 Usuarios (`UserController`)
**URL Base:** `/api/users`

| Método | Endpoint | Parámetros / Body | ¿Para qué sirve? | ¿Dónde usarlo en el Frontend? |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/register` | **Body (JSON):** Objeto `User` (nombre, email, password, etc.) | Registra un nuevo usuario en la plataforma. | **Pantalla de Registro** (`/register`). Formulario de creación de cuenta nueva. |
| **POST** | `/login` | **Query Params:** `email` y `password` (`?email=x&password=y`) | Autentica a un usuario y devuelve sus datos si las credenciales son correctas. | **Pantalla de Login** (`/login`). Para iniciar sesión y guardar la sesión/ID del usuario en el estado global (Context/Zustand) o LocalStorage. |

---

## 2. 📊 Dashboard (`DashboardController`)
**URL Base:** `/api/dashboard`

| Método | Endpoint | Parámetros / Body | ¿Para qué sirve? | ¿Dónde usarlo en el Frontend? |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/{userId}` | **Query Params:** `inicio` (fecha-hora), `fin` (fecha-hora). | Trae un resumen financiero unificado para el usuario en un periodo. Devuelve el `DashboardSummaryDTO` (Total ingresos, Total gastos, balance y transacciones recientes). | **Pantalla Principal (Home/Dashboard)**. Se consume nada más entrar a la app para alimentar las tarjetas principales (Ingresos, Gastos, Balance) y la tabla de "Actividad Reciente". |

---

## 3. 💸 Transacciones (`TransactionController`)
**URL Base:** `/api/transactions`

| Método | Endpoint | Parámetros / Body | ¿Para qué sirve? | ¿Dónde usarlo en el Frontend? |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/register` | **Body (JSON):** Objeto `Transaction` (monto, fecha, descripción, `tipo` ["INGRESO" o "GASTO"], ID usuario, ID categoría, ID presupuesto [opcional]). | Registra un nuevo ingreso o un nuevo gasto en el sistema. | **Formularios / Modales de "Añadir Ingreso" o "Añadir Gasto"**. |
| **GET** | `/user/{userId}/balance` | **Query Params:** `inicio`, `fin` (fecha-hora). | Calcula y devuelve el balance neto (Ingresos - Gastos) de un usuario en un rango de fechas. | **Tarjetas de KPI / Resumen Financiero**. Útil si solo necesitas el dato del balance sin traer todo el dashboard. |
| **GET** | `/{userId}/transactions/history` | **Query Params:** `inicio`, `fin`, `tipo` (opcional: INGRESO/GASTO). | Devuelve el historial de transacciones, filtrado por fecha y tipo (si se envía). | **Pantalla "Historial de Transacciones"**. Para mostrar una tabla detallada con filtros de fecha y tipo. |
| **GET** | `/{userId}/transactions/ahorro` | **Query Params:** `inicio`, `fin`. | Calcula el porcentaje/tasa de ahorro de un usuario en un periodo de tiempo determinado. | **Métricas del Dashboard**. Ideal para una gráfica tipo *gauge* (medidor) o tarjeta de "Tu capacidad de ahorro este mes es del X%". |

---

## 4. 📁 Categorías (`CategoryController`)
**URL Base:** `/api/categories`

| Método | Endpoint | Parámetros / Body | ¿Para qué sirve? | ¿Dónde usarlo en el Frontend? |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | *Ninguno* | Lista todas las categorías disponibles en la base de datos. | **Formularios de Transacción**. Para alimentar los *dropdowns* o *selects* (ej: El input donde elijes que el gasto es de "Comida"). |
| **POST** | `/` | **Body (JSON):** Objeto `Category` (nombre, tipo). | Crea una nueva categoría personalizada. | **Pantalla de Configuraciones** o un botón de "+ Añadir Categoría" directamente en los formularios de gastos/ingresos. |
| **GET** | `/{id}` | *Ninguno* (El ID va en la URL) | Trae los datos de una sola categoría por su ID. | **Vista de edición de categoría**. |

---

## 5. 🎯 Presupuestos (`BudgetController`)
**URL Base:** `/api/budgets`

| Método | Endpoint | Parámetros / Body | ¿Para qué sirve? | ¿Dónde usarlo en el Frontend? |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/register` | **Body (JSON):** Objeto `Budget` (montoTotal, nombre, mes, año, ID usuario). | Crea un nuevo presupuesto (Ej: "Mercado - Mayo"). | **Formulario / Modal de "Crear Presupuesto"**. |
| **GET** | `/user/{userId}` | *Ninguno* (El ID va en la URL) | Lista todos los presupuestos básicos de un usuario. | **Pantalla "Mis Presupuestos"** (Listado o tabla sencilla). |
| **GET** | `/user/{userId}/progress` | *Ninguno* (El ID va en la URL) | **[NUEVO]** Trae la lista de todos los presupuestos con su cálculo dinámico (Total, Gastado, Porcentaje). | **Sección de Gráficas de Presupuesto**. Para renderizar barras de progreso, gráficas circulares (pie/donut) comparando cuánto se ha gastado respecto a la meta total. |
| **GET** | `/{id}` | *Ninguno* (El ID va en la URL) | Trae un presupuesto individual por su ID. | **Formulario de edición de presupuesto** (para cargar los datos previos). |
| **GET** | `/{id}/progress` | *Ninguno* (El ID va en la URL) | Trae el cálculo dinámico de progreso para **un solo** presupuesto. | **Vista detallada de un presupuesto específico** al hacer clic en él. |
| **PUT** | `/{id}` | **Body (JSON):** `Budget` (montoTotal, nombre). | Modifica los datos de un presupuesto existente. | **Formulario de edición de presupuesto** (al enviar los cambios). |
| **DELETE**| `/{id}` | *Ninguno* (El ID va en la URL) | Elimina por completo un presupuesto de la BD. | **Botón "Eliminar"** (ícono de papelera) en la lista de presupuestos. |

---

## 💡 Notas Adicionales para el equipo Frontend
* **Fechas (`LocalDateTime`)**: Todos los endpoints que reciben `inicio` o `fin` esperan el formato `ISO-8601`. Ejemplo desde Javascript: `new Date().toISOString()`.
* **Manejo de Errores**: En la mayoría de los casos de error (ej: formulario incompleto, fondos insuficientes), el backend retornará un status `400 Bad Request` y el mensaje de error vendrá directamente en texto plano (o JSON en algunos casos). Asegúrense de usar `try/catch` y mostrar *Toasts* o Alertas con el mensaje al usuario.
* **CORS**: El backend ya está configurado con `@CrossOrigin(origins = "*")` en los controladores, por lo que no deberían tener problemas conectando el Front local (React/Vue/Angular) con el backend de Spring Boot.
