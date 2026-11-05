/**
 * @file Construye el módulo con esbuild.
 *   node scripts/construir.js        Genera dist/ para abrir o publicar.
 *   node scripts/construir.js --dev  Servidor local con recompilación en http://localhost:5173
 */

import { cpSync, rmSync } from 'node:fs';
import * as esbuild from 'esbuild';

const PUERTO = 5173;
const esDesarrollo = process.argv.includes('--dev');

/** @type {import('esbuild').BuildOptions} */
const opciones = {
  entryPoints: { app: 'src/main.jsx' },
  bundle: true,
  outdir: 'dist',
  // IIFE permite abrir dist/index.html con doble clic, sin servidor.
  format: 'iife',
  target: 'es2020',
  jsx: 'automatic',
  sourcemap: esDesarrollo,
  minify: !esDesarrollo,
  define: { 'process.env.NODE_ENV': JSON.stringify(esDesarrollo ? 'development' : 'production') },
  logLevel: 'info',
};

// Empieza siempre desde una carpeta limpia y copia los archivos estáticos.
rmSync('dist', { recursive: true, force: true });
cpSync('public', 'dist', { recursive: true });

if (esDesarrollo) {
  const contexto = await esbuild.context(opciones);
  await contexto.watch();
  await contexto.serve({ servedir: 'dist', port: PUERTO });
  console.log(`VitaHealth Sueño disponible en http://localhost:${PUERTO}`);
} else {
  await esbuild.build(opciones);
}
