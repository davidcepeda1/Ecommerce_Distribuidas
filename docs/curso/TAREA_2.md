# TAREA 2 — Avance 2
## Comunicación entre microservicios: gRPC + segundo transporte + manejo de excepciones
**Días 5–7 · Corte día 7 · Tag `v2-avance2` · Rúbrica /20**

> Lee primero `GUIA_GENERAL.md`.

### 🎯 Objetivo (en palabras simples)
Enriquecer la comunicación del MVP usando **dos temas centrales del curso**: **gRPC** (con contrato y monorepo) y **un segundo transporte de mensajería** (RabbitMQ, MQTT o NATS), aplicando **manejo de excepciones** en la capa de servicios. Al final, comparar los transportes que ya usaron.

### 🧱 Qué construir
1. **gRPC entre dos microservicios (Tema 7):**
   - Definir un **contrato `.proto`** (mensajes y servicio).
   - Implementar la comunicación gRPC en el **monorepo** de Nest.
   - Envolver las llamadas con **try/catch** para controlar errores (tal como se vio en clase).
2. **Segundo transporte de mensajería** (elijan uno de los vistos: **RabbitMQ / MQTT / NATS**):
   - Implementar un flujo **PUB/SUB** (o `queue`) para una operación asíncrona distinta a la de la Tarea 1.
3. **Manejo de excepciones** consistente en la capa de servicios (Exception Filters / try-catch) para los nuevos caminos.

> El **camino síncrono (TCP)** y el de **eventos con Redis** de la Tarea 1 se conservan. Aquí **agregan** gRPC y un transporte más.

### 📄 Ejemplo de contrato gRPC (referencia)
```proto
// productos.proto
syntax = "proto3";
package productos;

service ProductosService {
  rpc ObtenerProducto (ProductoRequest) returns (ProductoResponse);
}

message ProductoRequest  { int32 id = 1; }
message ProductoResponse { int32 id = 1; string nombre = 2; double precio = 3; }
```

### 🔬 Qué evidenciar (obligatorio)
- **gRPC funcionando:** captura/prueba de una llamada gRPC exitosa entre dos microservicios (Postman/grpcurl/logs).
- **Segundo transporte funcionando:** captura de un evento publicado y consumido por el nuevo transporte.
- **Manejo de errores:** captura de un error controlado (p. ej. producto inexistente) que **no tumba** el servicio, gracias al try/catch.
- **Tabla comparativa de transportes** (según lo visto y observado):

| Transporte | Tipo | Patrón | Cuándo lo usaron |
|---|---|---|---|
| TCP | Síncrono | Petición-respuesta | Cadena Gateway→servicio |
| Redis | Asíncrono | PUB/SUB | Eventos (Tarea 1) |
| <<RabbitMQ/MQTT/NATS>> | Asíncrono | <<PUB/SUB o queue>> | <<…>> |
| gRPC | Síncrono | Contrato/RPC | <<…>> |

### 📝 Qué documentar en el README (sección "Avance 2")
- Diagrama actualizado con los nuevos transportes.
- **Contrato `.proto`** y explicación de la comunicación gRPC.
- Flujo del **segundo transporte** y su patrón.
- **Manejo de excepciones**: qué se controla y cómo.
- **Tabla comparativa** de transportes + 1 párrafo: ¿cuándo conviene cada uno según lo que vieron?
- Patrones/SOLID aplicados + Kanban actualizado.

### ✅ Definición de Terminado
- [ ] Comunicación **gRPC** funcional entre dos microservicios (contrato `.proto` en monorepo).
- [ ] **Segundo transporte** de mensajería funcionando (PUB/SUB o queue).
- [ ] **Manejo de excepciones** demostrado (error controlado sin caída).
- [ ] Diagrama, tabla comparativa y README actualizados + **tag `v2-avance2`**.

### 🚫 Qué NO necesitan
- Nada de clúster, réplicas, balanceo ni orquestadores. Solo **transportes vistos + gRPC + excepciones**.

### 🧪 Recursos de esta tarea
- `tarea-2/docker-compose.transportes.yml` — añade el broker del segundo transporte (RabbitMQ de ejemplo).

---

## 📊 Rúbrica — Tarea 2 (20 pts)
> Cada criterio: **1, 2, 3 o 5**. Bruto máx 25 → **Nota /20 = suma × 0.8** (1→0.8 · 2→1.6 · 3→2.4 · 5→4.0).

| Criterio | Nivel 1 | Nivel 2 | Nivel 3 | Nivel 5 |
|---|---|---|---|---|
| **C1. Integración de gRPC** (contrato + monorepo) | Sin gRPC | Contrato definido pero no funciona | Comunicación gRPC funcional entre dos servicios con `.proto` | gRPC bien estructurado en monorepo, con contrato claro y probado |
| **C2. Segundo transporte de mensajería** | No lo agregan | Configurado pero no funciona | PUB/SUB o queue funcionando (RabbitMQ/MQTT/NATS) | Flujo asíncrono sólido y bien justificado frente a los otros transportes |
| **C3. Manejo de excepciones** | No se evidencia | try/catch suelto sin demostrar | Errores controlados en la capa de servicios (demo de error sin caída) | Estrategia consistente (Exception Filters) explicada y aplicada en todos los caminos |
| **C4. Buenas prácticas + proceso** (SOLID/patrones + Git + Kanban) | No se evidencian | Parciales | Patrones nombrados + Kanban + commits semánticos + tag | Historial limpio con PRs revisados, monorepo ordenado, trazabilidad completa |
| **C5. Documentación / README v2** | README sin actualizar | Actualización parcial | README v2 con diagrama + tabla comparativa + evidencias | Documentación profesional, comparación de transportes bien argumentada |
