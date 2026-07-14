/**
 * benchmark.js — Mide latencia de un endpoint usando SOLO JavaScript nativo.
 *   No requiere instalar nada (usa fetch integrado de Node 18+).
 *
 * Evidencia para:
 *   - Avance 1: comparar camino síncrono vs asíncrono.
 *   - Avance 3: comparar 1 réplica vs 3 réplicas (misma carga).
 *
 * Uso:      node benchmark.js <URL> [numero_de_peticiones] [metodo] [bodyJSON]
 * Ejemplos:
 *   node benchmark.js http://localhost:3000/api/productos
 *   node benchmark.js http://localhost:3000/api/pedidos 200 POST '{"productoId":"<uuid>","cantidad":1}'
 *   node benchmark.js http://localhost:3000/api/pedidos/async 200 POST '{"productoId":"<uuid>","cantidad":1}' > docs/bench-asincrono.txt
 *
 * (Alternativa sin código: usen el "tiempo de respuesta" que ya muestra Postman/Thunder.)
 */

const url = process.argv[2];
const n = Number(process.argv[3]) || 200;
const metodo = (process.argv[4] || 'GET').toUpperCase();
const bodyJson = process.argv[5];

if (!url) {
  console.error('❌ Falta la URL.\n   Uso: node benchmark.js <URL> [numero_de_peticiones] [metodo] [bodyJSON]');
  process.exit(1);
}

const fetchOptions = { method: metodo };
if (bodyJson) {
  fetchOptions.headers = { 'Content-Type': 'application/json' };
  fetchOptions.body = bodyJson;
}

function percentil(valoresOrdenados, p) {
  const idx = Math.ceil((p / 100) * valoresOrdenados.length) - 1;
  return valoresOrdenados[Math.max(0, idx)];
}

(async () => {
  console.log(`\n▶️  Midiendo ${metodo} ${url}  (${n} peticiones)\n`);
  const tiempos = [];
  let errores = 0;

  for (let i = 0; i < n; i++) {
    const inicio = Date.now();
    try {
      const res = await fetch(url, fetchOptions);
      await res.text();                 // consume el body
      if (!res.ok) errores++;
    } catch (e) {
      errores++;
    }
    tiempos.push(Date.now() - inicio);   // latencia en ms
    if ((i + 1) % 50 === 0) process.stdout.write(`  ${i + 1}/${n}\r`);
  }

  tiempos.sort((a, b) => a - b);
  const suma = tiempos.reduce((s, t) => s + t, 0);
  const prom = suma / tiempos.length;

  console.log('\n──────────── RESULTADOS ────────────');
  console.log(`Peticiones        : ${n}`);
  console.log(`Latencia promedio : ${prom.toFixed(2)} ms`);
  console.log(`Latencia p95      : ${percentil(tiempos, 95).toFixed(2)} ms`);
  console.log(`Latencia máx      : ${tiempos[tiempos.length - 1].toFixed(2)} ms`);
  console.log(`Errores           : ${errores}`);
  console.log('────────────────────────────────────');
  console.log('\n📋 Fila para el README:');
  console.log(`| ${url} | ${prom.toFixed(2)} | ${percentil(tiempos, 95).toFixed(2)} | ${tiempos[tiempos.length - 1].toFixed(2)} |\n`);
})();
