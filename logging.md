# Especificación de Logs
---

### Estructura del JSON

estructura en común:

| Campo | Origen / Tipo | Descripción |
|---|---|---|
| `time` | ISO 8601 (`string`) | Marca temporal exacta de la emisión del log en UTC. |
| `level` | Texto (`string`) | Nivel del evento: `info`, `warn`, `error` o `fatal`. |
| `servicio` | Texto (`string`) | Identificador del microservicio emisor (`ctv-backend` o `api-vuelos`). |
| `requestId` | UUID / Texto (`string`) | Identificador único de trazabilidad de la petición, administrado mediante `AsyncLocalStorage` y propagado vía la cabecera `x-request-id`. |
| `msg` | Texto (`string`) | Identificador unificado del evento en convención `snake_case`. |

---

## 2. Eventos Compartidos entre Servicios

Los siguientes eventos son emitidos indistintamente por `ctv-backend` y `api-vuelos`:

| Evento (`msg`) | Nivel | Campos Adicionales | Descripción / Contexto |
|---|---|---|---|
| `peticion_finalizada` | `info` / `warn` / `error` | `metodo`, `ruta`, `status`, `duracionMs` | Registrado al concluir la atención de una solicitud HTTP. El nivel es `info` (<400), `warn` (400-499) o `error` (≥500). |
| `error_no_controlado` | `error` | `err` | Excepción o error inesperado capturado en la capa de procesamiento Express. |
| `peticion_invalida` | `warn` | `err` | Error de validación en los datos de entrada de una petición HTTP. |
| `servidor_iniciado` | `info` | `puerto` | Notificación del arranque exitoso del servidor HTTP. |
| `port_no_especificado` | `warn` | *Sin campos* | Advertencia emitida durante el arranque cuando la variable de entorno `PORT` no está definida. |
| `database_url_no_especificada` | `warn` | *Sin campos* | Advertencia emitida durante el arranque cuando la variable de entorno `DATABASE_URL` no está definida. |
| `promesa_rechazada_sin_manejar` | `fatal` | `err` | Evento global para rechazos de promesas no capturados (`unhandledRejection`). |
| `excepcion_sin_capturar` | `fatal` | `err` | Evento global para excepciones no controladas a nivel de proceso (`uncaughtException`). |

---

## 3. Eventos Exclusivos de `ctv-backend`

### Autenticación y Gestión de Usuarios

| Evento (`msg`) | Nivel | Campos Adicionales | Descripción |
|---|---|---|---|
| `login_exitoso` | `info` | `rol` | Autenticación satisfactoria de un usuario. |
| `login_fallido` | `warn` | `rol`, `motivo` | Intento fallido de inicio de sesión. |
| `usuario_registrado` | `info` | `rol`, `usuarioId`, `agenciaId` | Registro exitoso de usuario (`agenciaId` presente si el rol es agencia). |
| `registro_rechazado` | `warn` | `rol`, `motivo` | Rechazo en la creación de una cuenta de usuario. |

### Agencias y Paquetes Turísticos

| Evento (`msg`) | Nivel | Campos Adicionales | Descripción |
|---|---|---|---|
| `agencia_creada` | `info` | `agenciaId` | Registro y alta exitosa de una nueva agencia. |
| `agencia_rechazada` | `warn` | `motivo` | Rechazo en la creación o solicitud de agencia. |
| `paquete_creado` | `info` | `paqueteId`, `agenciaId` | Alta exitosa de un paquete turístico. |
| `paquete_rechazado` | `warn` | `agenciaId`, `motivo` | Rechazo durante la validación o creación de paquete. |

### Transacciones de Compra y Reseñas

| Evento (`msg`) | Nivel | Campos Adicionales | Descripción |
|---|---|---|---|
| `compra_registrada` | `info` | `idVenta`, `paqueteId`, `usuarioClienteId` | Procesamiento y registro exitoso de una orden de compra. |
| `compra_rechazada` | `warn` | `paqueteId`, `motivo`, `estadoApiVuelos`, `detalle` | Rechazo de la transacción de compra (`estadoApiVuelos` y `detalle` incluidos si derivó de la API de vuelos). |
| `compra_inconsistente` | `error` | `err`, `idVenta`, `paqueteId`, `usuarioClienteId` | Inconsistencia detectada durante la confirmación o liquidación de la orden. |
| `opinion_guardada` | `info` | `paqueteId`, `puntaje` | Registro satisfactorio de una calificación/reseña de cliente. |
| `opinion_rechazada` | `warn` | `paqueteId`, `motivo` | Rechazo de publicación de reseña por validación de negocio. |

### Integración con api-vuelos

| Evento (`msg`) | Nivel | Campos Adicionales | Descripción |
|---|---|---|---|
| `llamada_api_vuelos` | `info` / `warn` / `error` | `operacion`, `estado`, `duracionMs`, `origen`, `destino`, `idsVuelo` | Respuesta obtenida al invocar la API de vuelos (`operacion`: `buscar_vuelos` o `vender_vuelos`). |
| `llamada_api_vuelos_fallida` | `error` | `err`, `operacion`, `duracionMs` | Falla de conexión o error no controlado al comunicarse con el servicio de vuelos. |

---

## 4. Eventos Exclusivos de `api-vuelos`

| Evento (`msg`) | Nivel | Campos Adicionales | Descripción |
|---|---|---|---|
| `venta_registrada` | `info` | `idVenta`, `idsVuelo` | Reserva y venta exitosa de pasajes para los vuelos especificados. |
| `venta_rechazada` | `warn` | `status`, `motivo`, `detalle` | Rechazo de venta por validación (`motivo`: `PedidoInvalido`, `VueloInexistente` o `VueloSinDisponibilidad`). |
| `error_registrando_venta` | `error` | `err` | Error no controlado o falla de base de datos durante el proceso de compra. |
| `error_consultando_vuelos` | `error` | `err` | Falla durante la consulta o filtrado del catálogo de vuelos. |

---