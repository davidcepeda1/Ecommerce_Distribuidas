# Tablero Kanban — Proyecto de Microservicios

## Cómo crearlo en GitHub Projects (5 min)
1. Repo → pestaña **Projects** → **New project** → plantilla **Board**.
2. Columnas: **Backlog · Por hacer · En progreso · En revisión · Hecho**.
3. Creen las tarjetas de abajo. A cada una: **responsable** + etiqueta de avance (`avance-1/2/3`).
4. Muevan las tarjetas conforme avanzan. Al cerrar cada avance suban **una captura** a `/docs` y enlácenla en el README.

> Si no usan GitHub Projects, usen la tabla Markdown del final como tablero dentro del repo.

---

## Tarjetas iniciales

### 🟢 Avance 1 — `avance-1`
- [ ] Definir dominio del MVP (3 microservicios + Gateway)
- [ ] Crear repo, proteger `main`, ramas base
- [ ] Docker Compose base (Gateway + 3 MS + Redis + Postgres)
- [ ] MS 1, MS 2, MS 3 (CRUD mínimo + persistencia TypeORM)
- [ ] API Gateway (entrada HTTP)
- [ ] Camino síncrono con TCP (cadena Gateway→A→B)
- [ ] Camino asíncrono con Redis (evento, emisor no bloquea)
- [ ] Manejo de excepciones en la capa de servicios
- [ ] Benchmark de latencia (prom/p95/máx) — solo JS o Postman
- [ ] Prueba de acoplamiento temporal (tumbar servicio)
- [ ] Diagrama de arquitectura v1 + README Avance 1
- [ ] Tag `v1-avance1`

### 🟡 Avance 2 — `avance-2`
- [ ] Definir contrato `.proto` (gRPC) entre dos microservicios
- [ ] Implementar comunicación gRPC en el monorepo
- [ ] try/catch para controlar errores en gRPC
- [ ] Agregar segundo transporte (RabbitMQ/MQTT/NATS) con PUB/SUB o queue
- [ ] Demostrar error controlado sin caída del servicio
- [ ] Tabla comparativa de transportes
- [ ] Diagrama actualizado + README Avance 2
- [ ] Tag `v2-avance2`

### 🔵 Avance 3 — `avance-3`
- [ ] Login que emite token JWT
- [ ] Validación del JWT en las rutas
- [ ] Guard que protege rutas (401 sin token; 403 por rol si aplica)
- [ ] Integrar logs con Sentry (capturar errores)
- [ ] Integrar todos los microservicios/transportes en una operación
- [ ] Diagrama final + README Avance 3 + sección Defensa
- [ ] Preparar diapositivas y ensayar demo
- [ ] Tag `v3-final`

---

## Tablero Markdown (alternativa dentro del repo)
| Backlog | Por hacer | En progreso | En revisión | Hecho |
|---|---|---|---|---|
| Integrar Sentry | Contrato gRPC | MS 1 | — | Crear repo |
| JWT + Guard | Segundo transporte | Gateway | — | Compose base |
| ... | ... | ... | ... | ... |
