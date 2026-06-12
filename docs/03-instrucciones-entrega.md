# Instrucciones de Entrega

## Antes de comenzar

1. Asegurate de tener instalado: Node.js 20+, Docker, Docker Compose, Git.
2. Lee **completamente** el documento [02-prueba-practica.md](02-prueba-practica.md) antes de escribir codigo.
3. Planifica tu tiempo. Tienes **8 horas maximo**.

## Paso 1: Fork del repositorio

1. Haz un **fork** de este repositorio a tu cuenta personal de GitHub.
2. Clona tu fork localmente:
   ```bash
   git clone https://github.com/TU_USUARIO/prueba-tecnica-backend.git
   cd prueba-tecnica-backend
   ```
3. Trabaja directamente sobre tu fork.

## Estructura esperada de tu fork

Al finalizar, tu repositorio debe tener esta estructura:

```
prueba-tecnica-backend/
  api-gateway/              # Express.js API Gateway
    src/
    package.json
    Dockerfile
  payment-service/          # NestJS Payment Service
    src/
    prisma/
    package.json
    Dockerfile
  notification-service/     # NestJS Notification Service
    src/
    package.json
    Dockerfile
  docker-compose.yml
  ARCHITECTURE.md           # Documentacion de arquitectura (Parte 5)
  README.md                 # Instrucciones de setup y endpoints
  docs/                     # (ya existente, no modificar)
```

## Reglas de entrega

1. **Fork:** Trabaja sobre tu fork. No crees un repositorio nuevo desde cero.

2. **Commits incrementales:** Haz commits frecuentes con mensajes descriptivos. **No** hagas un solo commit con todo el codigo. Queremos ver tu proceso de desarrollo.

   Ejemplo de buenos commits:
   ```
   feat: add prisma schema with merchants and transactions models
   feat: implement transaction CRUD endpoints
   feat: add state machine validation for status transitions
   feat: implement settlement generation with db transaction
   feat: add api-key guard with merchant injection
   feat: create express gateway with proxy middleware
   feat: add dual auth middleware (JWT + API key)
   feat: implement notification-service with event-driven communication
   feat: add circuit breaker pattern to api-gateway
   feat: add health check endpoints with db verification
   feat: add docker-compose with all services
   docs: add ARCHITECTURE.md with diagrams and trade-offs
   docs: add README with setup instructions and API docs
   ```

3. **README funcional:** Tu proyecto debe poder levantarse con:
   ```bash
   docker-compose up --build
   ```
   Si requiere pasos adicionales, documentalos claramente.

4. **Sin datos sensibles:** No incluyas credenciales reales, tokens, o datos personales en el repositorio. Usa variables de entorno con valores de ejemplo.

5. **Envia el link:** Comparte la URL de tu fork antes del deadline indicado.

## Que se permite

- Usar documentacion oficial (NestJS, Prisma, Express, Docker, Redis).
- Usar Stack Overflow o recursos similares para consultas puntuales.
- Usar librerias de npm para funcionalidades estandar (class-validator, class-transformer, axios, jsonwebtoken, ioredis, bullmq, etc.).

## Que NO se permite

- Usar herramientas de IA (ChatGPT, Copilot, Claude, etc.) para generar codigo.
- Copiar proyectos existentes de GitHub.
- Pedir ayuda a terceros.

Si se detecta uso de IA durante la revision tecnica, la prueba sera invalidada.

## Despues de la entrega

Se programara una sesion de **30-45 minutos** donde:

1. Haras un walkthrough de tu codigo explicando tus decisiones.
2. Responderas preguntas tecnicas sobre tu implementacion.
3. Se te pedira hacer un cambio pequeno en vivo.
4. Discutiremos como escalarias el sistema.

## Contacto

Si tienes dudas sobre los requisitos de la prueba, contacta a tu reclutador. Las dudas tecnicas sobre las instrucciones son validas; las dudas sobre "como implementar X" no.

Exitos.
