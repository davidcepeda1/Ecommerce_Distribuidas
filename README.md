<!--
============================================================
 README — Proyecto de Microservicios (3 avances)
============================================================
-->

# EcommerceMicroServicios

> MVP de arquitectura de microservicios · Arquitectura de Software · 7.° semestre · Entrega por avances.

## 👥 Equipo
| Integrante | Rol | GitHub |
|---|---|---|
| David Gustavo Cepeda Salguero | Backend / Arquitectura | [@davidcepeda1](https://github.com/davidcepeda1) |
| Zaith Alejandro Manangón Vinueza | Transportes / gRPC | [@zmanangon09](https://github.com/zmanangon09) |
| Brayan Josué Jácome Noroña | Seguridad / Observabilidad | [@BrayanJac](https://github.com/BrayanJac) |
| Juan Carlos Granda Arcos | Documentación / QA | [@Juangranda3424](https://github.com/Juangranda3424) |

## 🧩 Descripción del MVP
Sistema de e-commerce simplificado a 2-3 entidades para poder concentrar el esfuerzo en la **arquitectura de comunicación** entre microservicios y no en features de negocio. Un cliente crea un **pedido** de un **producto**; el sistema valida stock en tiempo real (camino síncrono) y, si el pedido se confirma, dispara una **notificación** desacoplada en el tiempo (camino asíncrono).

- **MS 1 — Pedidos:** crea pedidos, orquesta la validación/reserva de stock contra Productos (TCP) y publica el evento `pedido.creado` en Redis.
- **MS 2 — Productos:** catálogo con persistencia TypeORM/Postgres; expone la verificación y reserva de stock por TCP.
- **MS 3 — Notificaciones:** suscriptor de Redis que simula el envío de una confirmación (email/push) al consumir el evento `pedido.creado`.
- **API Gateway:** punto único de entrada HTTP; traduce peticiones REST a llamadas TCP hacia Pedidos/Productos.

## 🛠️ Stack
- **Framework:** NestJS (monorepo con **pnpm workspaces**, 4 apps independientes en `apps/*`)
- **Síncrono:** TCP + **gRPC** (contrato `proto/productos.proto`) · **Eventos:** Redis (Pub/Sub) + **RabbitMQ** (cola) · **2.º transporte:** RabbitMQ
- **Seguridad:** JWT + Guard *(Avance 3)* · **Observabilidad:** Sentry *(Avance 3)*
- **BD:** PostgreSQL (TypeORM) · **Contenedores:** Docker Compose · **Estructura:** monorepo (pnpm workspaces)

## ▶️ Cómo ejecutar
```bash
docker compose up -d --build
docker compose ps
curl http://localhost:3000/api/productos
```

Crear un pedido (camino síncrono, requiere un `productoId` real devuelto por el endpoint anterior):
```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{"productoId": "<uuid-de-producto>", "cantidad": 1}'
```

Crear un pedido por el camino asíncrono (solo publica el evento, no valida stock ni persiste):
```bash
curl -X POST http://localhost:3000/api/pedidos/async \
  -H "Content-Type: application/json" \
  -d '{"productoId": "<uuid-de-producto>", "cantidad": 1}'
```

Consultar un producto por **gRPC** (Avance 2, camino de lectura Gateway→Productos):
```bash
curl http://localhost:3000/api/grpc/productos/<uuid-de-producto>
```

## 🏗️ Arquitectura

```mermaid
flowchart LR
    Cliente((Cliente))

    subgraph Camino_Sincrono["Camino A — Síncrono (HTTP + TCP)"]
        direction LR
        GW1[API Gateway]
        PED1[MS Pedidos]
        PROD1[MS Productos]

        Cliente -->|"HTTP POST /api/pedidos"| GW1
        GW1 -->|"TCP: pedidos.crear"| PED1
        PED1 -->|"TCP: productos.verificarYReservarStock\n(espera respuesta)"| PROD1
        PROD1 -->|"TCP: StockReservado / RpcException"| PED1
        PED1 -->|"TCP: PedidoCreado / RpcException"| GW1
        GW1 -->|"HTTP 201 / 409 / 503"| Cliente
    end

    subgraph Camino_Asincrono["Camino B — Asíncrono (HTTP + Redis + RabbitMQ)"]
        direction LR
        GW2[API Gateway]
        PED2[MS Pedidos]
        PROD2[MS Productos]
        REDIS[(Redis Pub/Sub)]
        RMQ[(RabbitMQ)]
        NOTIF[MS Notificaciones]

        Cliente -->|"HTTP POST /api/pedidos/async"| GW2
        GW2 -->|"TCP: pedidos.crearAsync"| PED2
        PED2 -->|"emit pedido.creado"| REDIS
        REDIS -.->|"evento"| NOTIF

        PROD2 -->|"emit stock.bajo"| RMQ
        RMQ -.->|"cola"| NOTIF

        PED2 -->|"TCP: ACK"| GW2
        GW2 -->|"HTTP 201 Created"| Cliente
    end

    subgraph Camino_gRPC["Camino C — gRPC (lectura, Avance 2)"]
        direction LR
        GW3[API Gateway]
        PROD3[MS Productos]

        Cliente -->|"HTTP GET /api/productos/:id"| GW3
        GW3 -->|"gRPC ObtenerProducto"| PROD3
        PROD3 -->|"ProductoResponse"| GW3
        GW3 -->|"HTTP 200 / 404"| Cliente
    end

    PED1 -.->|TypeORM| DB[(PostgreSQL)]
    PROD1 -.->|TypeORM| DB
```

**Nota:** en la implementación real, `POST /api/pedidos` ejecuta *ambos* caminos en una sola operación de negocio: espera el salto síncrono a Productos (reserva de stock) y, tras confirmar, publica el evento asíncrono a Notificaciones sin esperarlo. El endpoint `POST /api/pedidos/async` existe además como una variante puramente asíncrona (sin validación de stock), usada para poder **medir y comparar de forma aislada** la latencia de cada camino en el benchmark.

## 🧭 Metodología
- **Kanban:** [GitHub Projects](https://github.com/users/davidcepeda1/projects/1) (captura: `docs/kanban-avance1.png`).
- **Ramificación:** GitHub Flow — `main` protegida, ramas `feat/…`, `fix/…`, `docs/…`, Pull Requests revisados por otro integrante, tags por avance (`v1-avance1`, `v2-avance2`, `v3-final`).
- **Commits semánticos:** Conventional Commits (`tipo(alcance): descripción`).

  ```
  feat(productos): agregar entidad Producto y validación de stock vía TCP
  feat(pedidos): publicar evento pedido.creado en Redis sin bloquear la respuesta
  feat(gateway): exponer POST /api/pedidos y /api/pedidos/async
  fix(pedidos): controlar timeout de MS Productos con RpcException 503
  perf(benchmark): adaptar benchmark.js para soportar POST con body JSON
  docs(readme): documentar Avance 1 con diagrama y tabla de latencias
  ```

## 🗺️ Patrones y principios aplicados
- **API Gateway** — `apps/gateway` centraliza el punto de entrada HTTP y oculta la topología interna (TCP) de los 3 microservicios al cliente.
- **Proxy** — `ClientProxy` de NestJS actúa como proxy remoto: el código de Pedidos invoca `productosClient.send(...)` como si fuera una llamada local.
- **Publisher/Subscriber** — MS Pedidos publica `pedido.creado` en Redis sin conocer a sus consumidores; MS Notificaciones se suscribe sin conocer al emisor. Desacople total.
- **Message Queue (RabbitMQ)** — MS Productos publica `stock.bajo` en una cola durable (`notificaciones_stock`); MS Notificaciones la consume. Segundo transporte del Avance 2, distinto al Pub/Sub de Redis.
- **Contrato/RPC (gRPC)** — contrato `proto/productos.proto` compartido en el monorepo; el Gateway invoca `ObtenerProducto` sobre Productos con tipos fuertes. Camino de lectura del Avance 2.
- **Inyección de Dependencias (DIP)** — los `ClientProxy` (`PRODUCTOS_TCP`, `EVENTOS_REDIS`, `PEDIDOS_TCP`) y los repositorios de TypeORM se inyectan vía `@Inject`/constructor en lugar de instanciarse directamente; los servicios dependen de abstracciones (`ClientProxy`, `Repository<T>`), no de implementaciones concretas.
- **DTO + Pipes (SRP)** — `CreatePedidoDto` y `VerificarStockDto` con `class-validator` separan la responsabilidad de validar de la de ejecutar lógica de negocio; `ValidationPipe` se aplica de forma declarativa con `@UsePipes`.
- **Exception Filters** — `RpcExceptionFilter` (en cada microservicio) y `MicroserviceExceptionFilter` (en el Gateway) centralizan el manejo de errores: ningún controlador tiene try/catch disperso, y ningún error no controlado tumba el proceso.
- **Single Responsibility Principle** — cada microservicio tiene una única razón de cambio: Productos solo gestiona catálogo/stock, Pedidos solo orquesta la creación de pedidos, Notificaciones solo consume eventos.

---

## 🟢 Avance 1 — Acoplamiento temporal y latencia · `tag v1-avance1`

### Caminos
- **Síncrono (TCP):** Gateway → Pedidos → Productos. Gateway espera la respuesta completa de la cadena (`POST /api/pedidos`); si Productos no responde, la petición completa falla.
- **Asíncrono (Redis):** Gateway → Pedidos publica el evento `pedido.creado`; Pedidos responde de inmediato sin esperar a que Notificaciones lo procese (`POST /api/pedidos/async`, o la parte de notificación de `POST /api/pedidos`).

Para hacer medible la diferencia en una red Docker local (donde un round-trip TCP tarda ~1-2ms), se añadió una latencia simulada configurable por variable de entorno que representa trabajo downstream real:
- `svc-productos`: `LATENCIA_SIMULADA_MS=80` (simula consultar un sistema de inventario).
- `svc-notificaciones`: `LATENCIA_SIMULADA_MS=150` (simula el envío de un email/push).

### 📈 Latencia (con `benchmark.js`, 200 peticiones por camino)
| Camino | Promedio (ms) | p95 (ms) | Máx (ms) |
|---|---|---|---|
| Síncrono (`POST /api/pedidos`) | 110.57 | 119.00 | 332.00 |
| Asíncrono (`POST /api/pedidos/async`) | 5.96 | 7.00 | 81.00 |

Comandos usados (ver `docs/bench-sincrono.txt` y `docs/bench-asincrono.txt`):
```bash
node benchmark.js http://localhost:3000/api/pedidos 200 POST '{"productoId":"<uuid>","cantidad":1}' > docs/bench-sincrono.txt
node benchmark.js http://localhost:3000/api/pedidos/async 200 POST '{"productoId":"<uuid>","cantidad":1}' > docs/bench-asincrono.txt
```

### 🧨 Acoplamiento temporal
Evidencia completa en `docs/prueba-caida.txt` (agregar capturas de pantalla equivalentes en `/docs`).

**Escenario 1 — apagar `svc-productos` (downstream del camino síncrono):**
- `POST /api/pedidos` → `503 MS Productos no disponible: no se pudo verificar stock (acoplamiento temporal)`.
- `POST /api/pedidos/async` → `201`, responde con normalidad porque no depende de Productos.

**Escenario 2 — apagar `svc-notificaciones` (consumidor del camino asíncrono):**
- `POST /api/pedidos` → `201`, se crea con normalidad (Pedidos nunca esperó a Notificaciones).
- `POST /api/pedidos/async` → `201`, el evento queda en el canal/se pierde su procesamiento, pero el emisor nunca se bloquea.

### 🧠 Análisis
La latencia se **acumula** en el camino síncrono porque cada salto TCP es una espera bloqueante encadenada: el Gateway no responde hasta que Pedidos responde, y Pedidos no responde hasta que Productos responde. El tiempo total observado (~110ms de promedio) es aproximadamente la suma del trabajo simulado en Productos (80ms) más el overhead real de dos saltos TCP, serialización y las escrituras en Postgres — cada eslabón añade su propio tiempo al total, y ese total es lo que finalmente percibe el cliente.

El **acoplamiento temporal** es la dependencia de que *todos* los servicios de una cadena síncrona estén vivos y respondiendo *al mismo tiempo* para que la operación complete con éxito: si Productos cae, toda la petición de Pedidos falla, aunque Pedidos y el Gateway estén perfectamente sanos. Esto se evidenció directamente con el `503` del Escenario 1. El camino asíncrono rompe esta dependencia: Pedidos publica el evento y continúa sin preguntar si hay algún consumidor vivo del otro lado — por eso, apagar Notificaciones no afecta en absoluto la respuesta al cliente (Escenario 2), y ese es exactamente el desacople que se buscaba demostrar.

### 🗂️ Kanban
[github.com/users/davidcepeda1/projects/1](https://github.com/users/davidcepeda1/projects/1)

![Tablero Kanban Avance 1](docs/kanban-avance1.png)

**Tablero alternativo en Markdown** (respaldo dentro del repo, por si GitHub Projects no está disponible):

| Backlog | Por hacer | En progreso | En revisión | Hecho |
|---|---|---|---|---|
| Contrato `.proto` (gRPC) — Av. 2<br>Segundo transporte — Av. 2<br>JWT + Guard — Av. 3<br>Sentry — Av. 3<br>Diagrama final + Defensa — Av. 3 | — | — | — | Definir dominio del MVP<br>Crear repo, proteger `main`, ramas base<br>Docker Compose base (Gateway + 3 MS + Redis + Postgres)<br>MS Pedidos, MS Productos, MS Notificaciones<br>API Gateway<br>Camino síncrono con TCP<br>Camino asíncrono con Redis<br>Manejo de excepciones<br>Benchmark de latencia (prom/p95/máx)<br>Prueba de acoplamiento temporal<br>Diagrama de arquitectura + README Avance 1<br>Tag `v1-avance1` |

---

## 🟡 Avance 2 — Comunicación: gRPC + 2.º transporte + excepciones · `tag v2-avance2`

Sobre el mismo sistema del Avance 1 (TCP + Redis se **conservan**) se añaden dos formas de comunicación vistas en clase: **gRPC** con contrato en el monorepo y un **segundo transporte de mensajería, RabbitMQ**.

### 📄 gRPC — contrato y comunicación
Contrato compartido en el monorepo: [`proto/productos.proto`](proto/productos.proto).

```proto
syntax = "proto3";
package productos;

service ProductosService {
  rpc ObtenerProducto (ProductoRequest) returns (ProductoResponse);
}

message ProductoRequest  { string id = 1; }                 // los IDs son UUID (string)
message ProductoResponse { string id = 1; string nombre = 2; double precio = 3; int32 stock = 4; }
```

- **Servidor:** MS Productos es una app **híbrida** que expone TCP (Avance 1) **y** gRPC en el mismo proceso (`apps/productos/src/main.ts`). El handler está en `productos-grpc.controller.ts` (`@GrpcMethod('ProductosService','ObtenerProducto')`).
- **Cliente:** el Gateway registra un `ClientGrpc` (`PRODUCTOS_GRPC`) y expone `GET /api/grpc/productos/:id`, que llama a Productos por gRPC con tipos fuertes derivados del `.proto`.
- **Evidencia:** [`docs/avance2-grpc.txt`](docs/avance2-grpc.txt) — llamada exitosa (`200`) y error controlado (`404`).

![Llamada gRPC exitosa (Postman)](docs/avance2-grpc-ok.png)
![Error gRPC controlado NOT_FOUND](docs/avance2-grpc-error.png)

### 🐇 Segundo transporte — RabbitMQ (cola)
Flujo **distinto** al `pedido.creado` de Redis. Cuando una reserva de stock deja el producto por **debajo del umbral** (`UMBRAL_STOCK_BAJO`, por defecto 5), MS Productos publica el evento **`stock.bajo`** en la cola durable `notificaciones_stock`; MS Notificaciones la consume y emite una alerta de reabastecimiento. El emisor **no espera** al consumidor (patrón *queue*, fire-and-forget).

- MS Notificaciones es ahora híbrido: consume **Redis** (`pedido.creado`) **y RabbitMQ** (`stock.bajo`) a la vez.
- Panel de RabbitMQ para captura: `http://localhost:15672` (guest/guest) → *Queues* → `notificaciones_stock`.
- **Evidencia:** [`docs/avance2-rabbitmq.txt`](docs/avance2-rabbitmq.txt) — publicación y consumo del evento.

![Cola notificaciones_stock en el panel de RabbitMQ](docs/avance2-rabbitmq-panel.png)

### 🔁 Comparación de transportes
| Transporte | Tipo | Patrón | Uso en el proyecto |
|---|---|---|---|
| **TCP** | Síncrono | Petición-respuesta | Cadena Gateway→Pedidos→Productos: reservar stock al crear un pedido (Avance 1). |
| **Redis** | Asíncrono | PUB/SUB | Evento `pedido.creado`: notificar confirmación de pedido sin bloquear (Avance 1). |
| **RabbitMQ** | Asíncrono | Cola (queue) | Evento `stock.bajo`: alerta de reabastecimiento desacoplada, cola durable (Avance 2). |
| **gRPC** | Síncrono | Contrato/RPC | Lectura `ObtenerProducto` Gateway→Productos con contrato `.proto` tipado (Avance 2). |

**¿Cuándo conviene cada uno?** El **TCP petición-respuesta** y **gRPC** sirven cuando el llamante *necesita la respuesta ya* para continuar (validar stock, leer un producto); gRPC añade además un **contrato tipado** y binario más eficiente, ideal para comunicación interna estable entre servicios. **Redis Pub/SUB** encaja cuando uno o varios interesados reaccionan a un hecho y no importa perder algún mensaje si nadie escucha (notificaciones best-effort). **RabbitMQ (cola)** conviene cuando el mensaje **no se debe perder** y puede procesarse más tarde: la cola durable retiene el evento hasta que un consumidor lo tome, desacoplando por completo emisor y consumidor en el tiempo — por eso lo usamos para la alerta de reabastecimiento.

### 🧯 Manejo de excepciones
- **gRPC:** el handler `ObtenerProducto` envuelve la lógica en **try/catch**; un producto inexistente se traduce a `RpcException` con código gRPC `NOT_FOUND` en vez de tumbar el servidor. El Gateway mapea el código gRPC a HTTP en `MicroserviceExceptionFilter` (`NOT_FOUND → 404`). Evidencia: `404` controlado en [`docs/avance2-grpc.txt`](docs/avance2-grpc.txt) con `svc-productos` **`Up`** después del error.
- **RabbitMQ:** el consumidor `handleStockBajo` envuelve el procesamiento en try/catch: un fallo al notificar se **loguea** y no interrumpe el consumo de la cola.
- Se mantiene la estrategia del Avance 1: `RpcExceptionFilter` (por microservicio) + `MicroserviceExceptionFilter` (Gateway) centralizan los errores en toda la aplicación.

### 🗂️ Kanban (Avance 2)
[github.com/users/davidcepeda1/projects/1](https://github.com/users/davidcepeda1/projects/1) — tarjetas de `avance-2` (contrato `.proto`, gRPC, segundo transporte, excepciones) movidas a **Hecho**.

![Tablero Kanban Avance 2](docs/kanban-avance2.png)

---

## 🔵 Avance 3 — Seguridad, observabilidad e integración (FINAL) · `tag v3-final`
*(pendiente — se documentará en el corte final)*

---

## 🏷️ Tags de entrega
- `v1-avance1` — 2026-07-14 · `v2-avance2` — 2026-07-16 · `v3-final` — <<pendiente>>
