# TAREA 1 — Avance 1
## Medir el acoplamiento temporal y la acumulación de latencia
**Días 1–4 · Corte día 4 · Tag `v1-avance1` · Rúbrica /20**

> Lee primero `GUIA_GENERAL.md`.

### 🎯 Objetivo (en palabras simples)
Construir el MVP (**3 microservicios + Gateway**) y **demostrar con números** dos problemas de las arquitecturas distribuidas:
1. **Acumulación de latencia:** en una cadena síncrona *Gateway → A → B*, los tiempos **se suman**.
2. **Acoplamiento temporal:** si un servicio de la cadena **se cae**, **toda** la petición falla (todos deben estar vivos al mismo tiempo).

Luego se compara contra un **modelo asíncrono (eventos)** que **desacopla** a los servicios.

### 🧱 Qué construir
1. **API Gateway** + **3 microservicios** con dominio sencillo (persistencia con TypeORM + Postgres, como en clase).
2. **Camino A — Síncrono (TCP):** el Gateway llama a un microservicio y este llama a otro por **TCP**, esperando respuesta (≥2 saltos encadenados).
3. **Camino B — Asíncrono (Redis):** una operación se resuelve **publicando un evento** en **Redis**; el emisor **no espera** al consumidor.
4. **Manejo de excepciones** en la capa de servicios (Exception Filters / try-catch en los handlers).

> **Nota sobre el broker:** aquí Redis es solo para mostrar el **desacople en el tiempo** (el emisor no se bloquea). El *balanceo* llega en la Tarea 3 con colas.

### 🔬 Qué medir (evidencia obligatoria)
- **Tabla de latencia** del camino síncrono y del asíncrono: **promedio, p95 y máximo** (usen `benchmark.js`).
- **Prueba de acoplamiento temporal:** apaguen un microservicio *downstream* y muestren que la petición síncrona **falla**, mientras que el flujo asíncrono **acepta** la petición sin bloquearse (capturas).

### 📝 Qué documentar en el README (sección "Avance 1")
- Descripción del dominio y de los 3 microservicios.
- **Diagrama de arquitectura** (síncrono vs asíncrono).
- **Patrones y principios** aplicados (nómbrenlos).
- Tabla de latencias + **1 párrafo de análisis**: ¿por qué se acumula la latencia? ¿qué es el acoplamiento temporal y cómo lo evidenciaron?
- Enlace + captura del **tablero Kanban**.
- Explicación de la **estrategia de ramificación** + ejemplos de **commits semánticos**.

### ✅ Definición de Terminado
- [ ] Repo público con `README.md`, ramas y **tag `v1-avance1`**.
- [ ] Gateway + 3 microservicios ejecutables (idealmente `docker compose up`).
- [ ] Camino síncrono (TCP) y camino asíncrono (Redis) funcionando.
- [ ] Tabla de latencias (prom/p95/máx) de ambos caminos.
- [ ] Prueba de caída documentada con capturas.
- [ ] Diagrama de arquitectura + tablero Kanban en el README.

### 🚫 Qué NO necesitan aún
- Réplicas, clúster ni balanceador (eso es T2 y T3).
- Un benchmark "perfecto": 30–60 s de carga con autocannon basta.

### 🧪 Recursos de esta tarea
- `tarea-1/benchmark.js` — mide latencia e imprime la fila lista para el README.
- `tarea-1/docker-compose.yml` — base Gateway + 3 microservicios + Redis + Postgres.

---

## 📊 Rúbrica — Tarea 1 (20 pts)
> Cada criterio: **1, 2, 3 o 5**. Bruto máx 25 → **Nota /20 = suma × 0.8** (1→0.8 · 2→1.6 · 3→2.4 · 5→4.0).

| Criterio | Nivel 1 (Inicial) | Nivel 2 (En desarrollo) | Nivel 3 (Competente) | Nivel 5 (Sobresaliente) |
|---|---|---|---|---|
| **C1. Arquitectura del MVP** (3 MS + Gateway, TCP + Redis) | Solo Gateway o <3 MS; no ejecuta | 3 MS pero falta uno de los dos caminos | 3 MS + Gateway con camino síncrono y asíncrono funcionando | Además desplegable con `docker compose up` limpio y documentado |
| **C2. Medición de latencia y acoplamiento** | Sin mediciones | Mide un solo camino o sin p95 | Tabla prom/p95/máx de ambos caminos + prueba de caída | Análisis que interpreta correctamente la acumulación y el acoplamiento temporal |
| **C3. Buenas prácticas de clase** (SOLID, patrones, excepciones) | No se evidencian | Se mencionan sin aplicarse | Aplican y **nombran** ≥2 patrones/principios + manejo de excepciones | Justifican decisiones con SOLID y muestran manejo de errores consistente |
| **C4. Proceso** (Kanban + Git Flow + commits) | Sin tablero ni ramas | Tablero o ramas incompletos | Kanban activo + ramas + commits semánticos + tag | Historial limpio con PRs revisados, tarjetas trazables a commits |
| **C5. Documentación en README + diagrama** | README vacío o mínimo | README parcial sin diagrama | README completo del avance + diagrama claro | README profesional, diagrama legible y análisis bien redactado |
