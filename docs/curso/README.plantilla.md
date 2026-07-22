<!--
============================================================
 PLANTILLA README — Proyecto de Microservicios (3 avances)
 Cópienla como README.md en la raíz del repo.
 Completen las secciones ✍️ en cada avance. Reemplacen todo entre << >>.
============================================================
-->

# <<Nombre del Sistema>>

> MVP de arquitectura de microservicios · <<Materia>> · 7.° semestre · Entrega por avances.

## 👥 Equipo
| Integrante | Rol | GitHub |
|---|---|---|
| <<Nombre 1>> | <<Backend / Arquitectura>> | @usuario |
| <<Nombre 2>> | <<Transportes / gRPC>> | @usuario |
| <<Nombre 3>> | <<Seguridad / Observabilidad>> | @usuario |
| <<Nombre 4 (opcional)>> | <<Documentación / QA>> | @usuario |

## 🧩 Descripción del MVP
✍️ <<1–2 párrafos: qué hace el sistema y por qué el dominio es sencillo.>>
- **MS 1 — <<Pedidos>>:** <<responsabilidad>>
- **MS 2 — <<Productos>>:** <<responsabilidad>>
- **MS 3 — <<Notificaciones>>:** <<responsabilidad>>
- **API Gateway:** punto único de entrada.

## 🛠️ Stack
- **Framework:** <<NestJS / Spring Boot>>
- **Síncrono:** TCP · **Eventos:** <<Redis>> · **2.º transporte:** <<RabbitMQ/MQTT/NATS>> · **Contrato:** gRPC
- **Seguridad:** JWT + Guard · **Observabilidad:** Sentry
- **BD:** PostgreSQL · **Contenedores:** Docker Compose · **Estructura:** monorepo

## ▶️ Cómo ejecutar
```bash
docker compose up -d --build
docker compose ps
curl http://localhost:3000/api/<<recurso>>
```

## 🏗️ Arquitectura
✍️ <<Diagrama en /docs o Mermaid. Actualícenlo en cada avance.>>

## 🧭 Metodología
- **Kanban:** <<enlace GitHub Projects>> (captura en /docs).
- **Ramificación:** <<GitHub Flow>> — `main` protegida, ramas `feat/…`, PRs revisados, tags por avance.
- **Commits semánticos:** Conventional Commits.

## 🗺️ Patrones y principios aplicados
✍️ <<Nómbrenlos: API Gateway, Proxy, Publisher/Subscriber, DIP, DTO+Pipes (SRP), Exception Filters. Cuáles trae Nest y cuáles agregaron ustedes.>>

---

## 🟢 Avance 1 — Acoplamiento temporal y latencia · `tag v1-avance1`
### Caminos
- **Síncrono (TCP):** Gateway → <<A>> → <<B>>.
- **Asíncrono (Redis):** Gateway publica evento; el consumidor procesa sin bloquear.

### 📈 Latencia (con `benchmark.js`)
| Camino | Promedio (ms) | p95 (ms) | Máx (ms) |
|---|---|---|---|
| Síncrono | << >> | << >> | << >> |
| Asíncrono | << >> | << >> | << >> |

### 🧨 Acoplamiento temporal
✍️ <<Al apagar <<B>>, la petición síncrona falla; el flujo asíncrono acepta la petición sin bloquearse (capturas).>>

### 🧠 Análisis
✍️ <<Por qué se suman las latencias y qué es el acoplamiento temporal según lo observado.>>

---

## 🟡 Avance 2 — Comunicación: gRPC + 2.º transporte + excepciones · `tag v2-avance2`
### gRPC (contrato + monorepo)
✍️ <<Contrato `.proto` y comunicación gRPC entre <<A>> y <<B>>. Control de errores con try/catch.>>

### Segundo transporte
✍️ <<Transporte elegido (<<RabbitMQ/MQTT/NATS>>) y flujo PUB/SUB o queue implementado.>>

### 🔁 Comparación de transportes
| Transporte | Tipo | Patrón | Uso en el proyecto |
|---|---|---|---|
| TCP | Síncrono | Petición-respuesta | << >> |
| Redis | Asíncrono | PUB/SUB | << >> |
| <<RabbitMQ/MQTT/NATS>> | Asíncrono | <<PUB/SUB o queue>> | << >> |
| gRPC | Síncrono | Contrato/RPC | << >> |

✍️ <<1 párrafo: cuándo conviene cada uno.>>

### 🧯 Manejo de excepciones
✍️ <<Qué errores se controlan y cómo (evidencia de un error que no tumba el servicio).>>

---

## 🔵 Avance 3 — Seguridad, observabilidad e integración (FINAL) · `tag v3-final`
### 🔐 Autenticación y autorización
✍️ <<Login que emite JWT; Guard que protege rutas. Evidencia: 200 con token, 401 sin token (y 403 por rol si aplica).>>

### 📊 Observabilidad (Sentry)
✍️ <<Qué se registra; captura del error en el panel de Sentry.>>

### 🔗 Integración final
✍️ <<Operación que atraviesa varios microservicios/transportes desde el Gateway.>>

### 🏗️ Diagrama final
✍️ <<Sistema integrado>>

---

## 🎤 Defensa
✍️ <<Enlace a diapositivas + guion. Runbook de la demo (levantar → login → ruta protegida → operación integrada → error en Sentry). Preguntas frecuentes preparadas.>>

## 🏷️ Tags de entrega
- `v1-avance1` — <<fecha>> · `v2-avance2` — <<fecha>> · `v3-final` — <<fecha>>
