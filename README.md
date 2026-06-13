
# Como levantar el proyecto completo con un solo comando:
1. tener instalado docker instalado.
2. nos ubicamos en la raiz del proyecto.
```bash
$ docker-compose up --build
```

3. Probar servicios:

```bash
$ curl --request GET \
  --url http://localhost:3000/api/v1/transactions/ \
  --header 'User-Agent: insomnia/12.6.0' \
  --header 'x-api-key: key_test_1' \
```

# Variables de entorno necesarias y sus valores por defecto:
#### POSTGRES_USER = payment
#### POSTGRES_PASSWORD = payment
#### POSTGRES_DB = payment_db
#### TZ = "America/Bogota
#### PAYMENT_SERVICE_URL = http://payment-service:3001
#### DATABASE_URL = postgresql://payment:payment@payment-postgres-db:5432/payment_db

# Catalogo de endpoints: 

```bash
$ curl --request POST \
  --url http://localhost:3000/api/v1/transactions/ \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: key_test_1' \
  --data '{
    "merchantId" : "09003aa2-bcba-4cad-b2a6-9138b23279eb",
    "amount" : 310000,
    "currency" : "COP",
    "type" : "payin"
}'

$ curl --request GET \
  --url http://localhost:3000/api/v1/transactions/ \
  --header 'x-api-key: key_test_1' \


$ curl --request GET \
  --url http://localhost:3000/api/v1/transactions/9fef1798-e16e-4e1f-ad09-22ef94478f9f \
  --header 'x-api-key: key_test_1' \


$ curl --request PATCH \
  --url http://localhost:3000/api/v1/transactions/492e29a9-ab45-40b1-af17-389bcf1e01fb/status \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: key_test_1' \
  --data '{
    "status" : "approved"
}'

$ curl --request POST \
  --url http://localhost:3000/api/v1/settlements/generate \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: key_test_1' \
  --data '{
    "merchant_id": "09003aa2-bcba-4cad-b2a6-9138b23279eb",
    "period_start": "2026-06-13",
    "period_end": "2026-06-13"
}'

$ curl --request GET \
  --url http://localhost:3000/api/v1/settlements/ef60e433-5887-47ee-b11d-60fd7276196d \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: key_test_1' \
  --data '{
    "merchant_id": "09003aa2-bcba-4cad-b2a6-9138b23279eb",
    "period_start": "2026-06-13",
    "period_end": "2026-06-13"
}'
```

# Decisiones de diseno tomadas y su justificacion:
1. Estrucrar el proyecto por capas para que cada capa tenga unica responsabilidad.
2. tener usos comunes para evitar la duplicidad de codigo **(DRY)**.
3. Clases que solo se dedique hacer una sola cosa y no tenga informacion de mas **(SRP)**.
4. Hacer uso de DTOS y Mapper para comunicacion entre capas y transformacion de datos.
5. en Payment-Service separacion por Modulacion y solo haga el proceso que tiene que hacer.
6. Inyeccion dependencia para saber que dependencias tiene cada clase.

# Prueba Tecnica - Backend Developer

Bienvenido/a a la prueba tecnica para la posicion de **Backend Developer**. Esta prueba evalua tus habilidades en Node.js, TypeScript, NestJS, Express.js, PostgreSQL, Docker y arquitectura de microservicios.

## Como empezar

1. Haz un **fork** de este repositorio a tu cuenta de GitHub.
2. Clona tu fork localmente.
3. Lee [docs/01-requisitos-perfil.md](docs/01-requisitos-perfil.md) para entender el perfil esperado.
4. Lee [docs/02-prueba-practica.md](docs/02-prueba-practica.md) para las instrucciones completas de la prueba.
5. Lee [docs/03-instrucciones-entrega.md](docs/03-instrucciones-entrega.md) para saber como entregar tu solucion.

## Tiempo Limite

**8 horas** desde el momento en que se comparte este repositorio con el candidato.

Exitos.
