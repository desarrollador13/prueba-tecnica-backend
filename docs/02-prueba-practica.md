# Prueba Tecnica Practica

**Duracion maxima:** 8 horas
**Entregable:** Fork de este repositorio con commits descriptivos
**Partes obligatorias:** 1, 2, 3 y 4
**Parte bonus (opcional):** 5 — suma puntos extra pero no es eliminatoria

## Como empezar

1. Haz un **fork** de este repositorio a tu cuenta de GitHub.
2. Clona tu fork localmente.
3. Trabaja sobre tu fork haciendo commits incrementales.
4. Al finalizar, asegurate de que tu fork este actualizado y compartelo.

## Contexto

Se requiere construir un mini sistema de gestion de pagos manuales con arquitectura de microservicios. El sistema tiene dos servicios: un **API Gateway** (Express.js) y un **servicio de pagos** (NestJS), ambos conectados a una base de datos PostgreSQL.

El objetivo es simular un escenario real donde multiples merchants procesan transacciones y requieren liquidaciones periodicas.

---

## PARTE 1: Modelado de Base de Datos con Prisma

**Objetivo:** Evaluar capacidad de diseno de schema relacional y uso de Prisma.

Crear un schema de Prisma que modele las siguientes entidades:

### Entidades

**merchants**
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | UUID | PK, auto-generado |
| name | String | Requerido |
| email | String | Requerido, unico |
| api_key | String | Requerido, unico |
| status | Enum | active, inactive |
| created_at | DateTime | Default now() |
| updated_at | DateTime | Auto-update |

**transactions**
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | UUID | PK, auto-generado |
| merchant_id | UUID | FK -> merchants |
| amount | Decimal | Requerido, precision 12,2 |
| currency | Enum | GTQ, COP, USD |
| type | Enum | payin, payout |
| status | Enum | pending, approved, rejected, failed, completed |
| reference | String | Requerido, unico |
| metadata | JSON | Opcional |
| created_at | DateTime | Default now() |
| updated_at | DateTime | Auto-update |

**settlements**
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | UUID | PK, auto-generado |
| merchant_id | UUID | FK -> merchants |
| total_amount | Decimal | Precision 14,2 |
| transaction_count | Int | |
| status | Enum | pending, processed, paid |
| period_start | DateTime | Requerido |
| period_end | DateTime | Requerido |
| created_at | DateTime | Default now() |

**settlement_transactions** (tabla pivot)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| settlement_id | UUID | FK -> settlements |
| transaction_id | UUID | FK -> transactions, unico |

### Requisitos

- Usar enums de Prisma para status, type y currency.
- Indices apropiados para queries frecuentes (busqueda por merchant, por status, por rango de fechas).
- Escribir la migracion inicial con `npx prisma migrate dev`.
- El campo `transaction_id` en `settlement_transactions` debe ser unico para garantizar que una transaccion solo pertenezca a una liquidacion.

### Criterios de evaluacion

- Correctitud de relaciones y constraints.
- Eleccion de tipos de datos (Decimal vs Float, etc.).
- Indices bien pensados para los queries mas comunes.

---

## PARTE 2: Servicio de Pagos con NestJS

**Objetivo:** Evaluar dominio de NestJS, patrones de diseno y logica de negocio.

Crear un servicio NestJS (`payment-service`) con los siguientes modulos:

### 2.1 Modulo de Transacciones

**Endpoints:**

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /transactions | Crear una transaccion |
| GET | /transactions | Listar transacciones (paginado, filtros) |
| GET | /transactions/:id | Obtener detalle de una transaccion |
| PATCH | /transactions/:id/status | Cambiar status con validacion |

**Requisitos especificos:**

#### a) Validacion de transiciones de estado

No todas las transiciones son validas. Implementar una maquina de estados simple:

```
pending  --> approved
pending  --> rejected
pending  --> failed
approved --> completed
approved --> failed
```

Cualquier otra transicion debe retornar **422 Unprocessable Entity** con un mensaje descriptivo.

Ejemplo de respuesta de error:
```json
{
  "statusCode": 422,
  "message": "Transicion de estado invalida: no se puede cambiar de 'rejected' a 'approved'",
  "error": "Unprocessable Entity"
}
```

#### b) Generacion de referencia unica

Cada transaccion debe tener una referencia con formato:
```
TXN-{YYYYMMDD}-{random6chars}
```

Ejemplo: `TXN-20260327-A3F8K2`

Garantizar unicidad (reintentar si hay colision).

#### c) Validaciones con class-validator

- `amount` debe ser mayor a 0
- `currency` debe ser un valor valido del enum
- `type` debe ser un valor valido del enum
- `metadata` es opcional, pero si se envia debe ser un objeto valido
- `merchant_id` es requerido y debe existir en la base de datos

#### d) Paginacion

Implementar offset pagination en el listado con los siguientes query params:

| Param | Default | Descripcion |
|-------|---------|-------------|
| page | 1 | Numero de pagina |
| limit | 20 | Items por pagina (max 100) |
| status | - | Filtro por status |
| type | - | Filtro por type |
| date_from | - | Fecha inicio (ISO 8601) |
| date_to | - | Fecha fin (ISO 8601) |

Respuesta esperada:
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "total_pages": 8
  }
}
```

### 2.2 Modulo de Liquidaciones (Settlements)

**Endpoints:**

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /settlements/generate | Generar liquidacion para un merchant |
| GET | /settlements/:id | Obtener detalle con transacciones |

**Requisitos:**

- Al generar una liquidacion, agrupar todas las transacciones con status `approved` del merchant en el rango de fechas indicado.
- Calcular `total_amount` (suma de amounts) y `transaction_count`.
- Usar una **transaccion de base de datos** para crear la liquidacion y asociar las transacciones atomicamente.
- No permitir que una transaccion pertenezca a mas de una liquidacion (validar antes de crear).
- Si no hay transacciones elegibles, retornar 404 con mensaje descriptivo.

**Request body para generar:**
```json
{
  "merchant_id": "uuid",
  "period_start": "2026-03-01T00:00:00Z",
  "period_end": "2026-03-27T23:59:59Z"
}
```

### 2.3 Guard de Autenticacion por API Key

Crear un guard que:

1. Lea el header `x-api-key` del request.
2. Busque el merchant asociado a esa API key en la base de datos.
3. Si la key no existe, retorne `401 Unauthorized`.
4. Si el merchant esta inactivo, retorne `403 Forbidden`.
5. Inyecte el objeto merchant en el request para uso en controllers/services.

Crear un decorador custom `@CurrentMerchant()` para extraer el merchant del request de forma limpia.

### Criterios de evaluacion

- Estructura del proyecto (modulos, servicios, controllers separados).
- Uso correcto de decoradores, pipes, guards.
- Manejo de errores con excepciones HTTP apropiadas.
- Transacciones de base de datos donde corresponda.
- Codigo limpio y tipado (evitar `any`).

---

## PARTE 3: API Gateway con Express.js

**Objetivo:** Evaluar capacidad de trabajar con Express.js y comunicacion entre servicios.

Crear un API Gateway en Express.js que actue como punto de entrada al sistema.

### 3.1 Proxy hacia el servicio de pagos

- Reenviar las peticiones `/api/v1/transactions/*` y `/api/v1/settlements/*` al `payment-service`.
- Propagar headers relevantes: `x-api-key`, `content-type`, `authorization`.
- Manejar errores del servicio downstream (timeouts, servicio caido) con respuestas apropiadas.

### 3.2 Middleware de autenticacion dual

Implementar un middleware que soporte dos modos de autenticacion:

1. **JWT:** Si el header `Authorization: Bearer <token>` esta presente, validar el JWT.
   - Usar una clave simetrica hardcoded para la prueba (ej: `PRUEBA_TECNICA_SECRET_KEY`).
   - Decodificar y adjuntar el payload al request.
2. **API Key:** Si no hay JWT, verificar el header `x-api-key`.
3. Si ninguno esta presente, retornar `401`.

### 3.3 Middleware de logging

Crear un middleware que registre cada request con el formato:
```
[2026-03-27T10:30:00.000Z] POST /api/v1/transactions 201 45ms
```

Debe incluir: timestamp ISO, metodo HTTP, ruta, status code, tiempo de respuesta.

### 3.4 Rate limiting basico

Implementar rate limiting en memoria (sin Redis ni librerias externas):

- **100 requests por minuto** por API key.
- Retornar `429 Too Many Requests` cuando se exceda con el header `Retry-After`.
- Limpiar entradas expiradas periodicamente para evitar memory leaks.

### Criterios de evaluacion

- Organizacion de middlewares (archivos separados, orden correcto).
- Manejo de errores del servicio downstream.
- Correcta propagacion de headers y body.
- Rate limiting funcional sin memory leaks.

---

## PARTE 4: Docker y Documentacion

**Objetivo:** Evaluar conocimiento de containerizacion y capacidad de documentar.

### 4.1 Docker Compose

Crear un `docker-compose.yml` que levante:

| Servicio | Imagen/Build | Puerto |
|----------|-------------|--------|
| postgres | postgres:15 | 5432 |
| payment-service | Build desde NestJS | 3001 |
| api-gateway | Build desde Express | 3000 |

**Requisitos:**
- Variables de entorno configurables.
- Healthcheck para PostgreSQL.
- `depends_on` para garantizar orden de inicio.
- Networking apropiado para comunicacion entre servicios.
- Volumen persistente para datos de PostgreSQL.

### 4.2 Dockerfiles

Crear Dockerfiles para ambos servicios con:
- Multi-stage build (build + production).
- Imagen base `node:20-alpine`.
- Solo copiar archivos necesarios para produccion.

### 4.3 README del proyecto

Documentar:
- Como levantar el proyecto completo con un solo comando.
- Variables de entorno necesarias y sus valores por defecto.
- Catalogo de endpoints con ejemplos de request/response.
- Decisiones de diseno tomadas y su justificacion.





Es aceptable no completar el 100% de todos los items. Prioriza funcionalidad y calidad sobre cantidad.

---

## PARTE 5: Bonus — Arquitectura y Patrones de Microservicios (opcional)

> **Esta parte es completamente opcional.** No es eliminatoria, pero suma puntos extra significativos y demuestra dominio de arquitectura de microservicios. Si terminaste las partes 1-4 y te queda tiempo, intenta implementar los items que puedas. Cada item se evalua de forma independiente: no necesitas completarlos todos.

### 5.1 Servicio de Notificaciones (Event-Driven)

Crear un tercer microservicio `notification-service` (NestJS) que se comunique de forma **asincrona** con el `payment-service`.

**Requisitos:**

- Cuando una transaccion cambia de status (PATCH /transactions/:id/status), el `payment-service` debe emitir un evento.
- El `notification-service` consume ese evento y registra una notificacion en base de datos.
- Usar una de estas estrategias de comunicacion (elegir una y justificar):
  - **Opcion A:** Cola de mensajes con Redis pub/sub o BullMQ.
  - **Opcion B:** HTTP asincrono con reintentos (patron outbox + polling o webhook interno).
  - **Opcion C:** Event emitter con NestJS Microservices (transport TCP o Redis).

**Modelo de notificaciones:**

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | UUID | PK, auto-generado |
| transaction_id | UUID | Requerido |
| merchant_id | UUID | Requerido |
| event_type | String | Ej: "transaction.approved", "transaction.rejected" |
| payload | JSON | Datos del evento |
| status | Enum | pending, sent, failed |
| attempts | Int | Default 0 |
| created_at | DateTime | Default now() |

**Endpoints del notification-service:**

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /notifications | Listar notificaciones por merchant (paginado) |
| GET | /notifications/:id | Detalle de una notificacion |

### 5.2 Circuit Breaker en el API Gateway

Implementar el patron **Circuit Breaker** en el API Gateway para proteger las llamadas al `payment-service`. Se permite usar librerias como `opossum` o implementar desde cero.

El circuit breaker debe tener 3 estados:

```
CLOSED (normal) --> OPEN (fallando) --> HALF_OPEN (probando)
     ^                                       |
     |_______________________________________|
              (si la prueba pasa)
```

- **CLOSED:** Las requests pasan normalmente. Si se acumulan N fallos consecutivos (ej: 5), cambia a OPEN.
- **OPEN:** Todas las requests se rechazan inmediatamente con `503 Service Unavailable`. Despues de un timeout (ej: 30 segundos), cambia a HALF_OPEN.
- **HALF_OPEN:** Permite una sola request de prueba. Si pasa, vuelve a CLOSED. Si falla, vuelve a OPEN.

### 5.3 Health Checks

Implementar un endpoint `GET /health` en el `payment-service` que verifique la conexion real a la base de datos:

```json
{
  "status": "ok",
  "service": "payment-service",
  "uptime": 3600,
  "database": "connected",
  "timestamp": "2026-03-27T10:30:00.000Z"
}
```

Si tambien implementaste el `notification-service`, agregar su health check y un endpoint agregador en el gateway (`GET /api/v1/health`) que consulte el estado de todos los servicios.

### 5.4 Documentacion de Arquitectura

Agregar un archivo `ARCHITECTURE.md` en la raiz del proyecto con:

1. **Diagrama** (ASCII art, Mermaid, o imagen) mostrando los servicios, base de datos, y tipo de comunicacion entre ellos.
2. **Justificacion de decisiones:** Por que elegiste esa estrategia de comunicacion? Que trade-offs tiene?
3. **Propuesta de escalabilidad:** Como escalarias el sistema si tuviera que manejar 10,000 transacciones por segundo?

### Puntos extra por item

| Item | Puntos |
|------|--------|
| Notification service funcional y desacoplado | +8 |
| Circuit breaker con los 3 estados | +5 |
| Health checks con verificacion real de BD | +3 |
| ARCHITECTURE.md con diagrama y justificaciones | +4 |
| Docker compose actualizado con servicios extra | +2 |
| Reintentos con backoff en notificaciones | +3 |

**Si implementas items de la Parte 5**, actualiza tu `docker-compose.yml` para incluir los servicios nuevos (notification-service, Redis si lo usas).
