# Trazabilidad del módulo front-end de sueño

Relación entre los artefactos del ciclo de vida de VitaHealth y el código de la evidencia GA7-220501096-AA4-EV03.

## 1. Artefactos tenidos en cuenta

| Artefacto | Cómo se aplicó |
|---|---|
| Estándares de codificación (AA1-EV02) | Módulo "Hidratación, sueño y hábitos": se codifica la parte de sueño. Reglas en la sección 6. |
| Requisitos e historias de usuario (GA4-AA2-EV02, GA5-AA1-EV03) | Las historias continúan la numeración de HU01 a HU13. El resumen semanal sigue RF06 Estadísticas. |
| Diagrama de clases (GA4-AA2-EV02, AA3-EV01) | `RegistroSueno` sigue el patrón de `Hidratacion`, `RegistroActividad` y `RegistroDiario`. |
| Prototipos y mapa de navegación (GA5-AA1-EV03/EV05) | Misma paleta verde, Nunito, logo, barra superior, tarjetas, anillo de progreso y modal de confirmación. |
| Arquitectura por capas (AA3-EV01) | Separación entre vista, estado, modelo y repositorio. |

## 2. Historias de usuario del módulo

| HU | Historia de usuario | Criterios de aceptación | Implementación |
|---|---|---|---|
| HU14 | **Como** usuario **quiero** registrar mis horas de sueño **para** saber cuánto dormí. | Fecha no futura y sin repetir. Duración de 30 min a 16 h, también cruzando la medianoche. Calidad obligatoria. Nota de máximo 200 caracteres. | `PaginaRegistrar`, `FormularioSueno`, `RelojSueno`, `validarRegistro` |
| HU15 | **Como** usuario **quiero** consultar mi historial por fechas **para** revisar noches anteriores. | Ordenado de reciente a antiguo. Avisa si el rango está invertido o vacío. | `PaginaHistorial`, `filtrarPorFechas` |
| HU16 | **Como** usuario **quiero** editar una noche **para** corregir un dato. | Precarga los datos y recalcula la duración. | `PaginaRegistrar` (`#/registrar/:id`), `guardarRegistro` |
| HU17 | **Como** usuario **quiero** eliminar una noche **para** quitar un registro equivocado. | Pide confirmación y se puede cancelar. | `ModalConfirmacion`, `eliminarRegistro` |
| HU18 | **Como** usuario **quiero** ver el resumen de mi semana **para** saber cómo voy. | Promedio, noches con la meta, racha, calidad y gráfico con tabla alterna. | `PaginaEstadisticas`, `GraficoSemana`, `resumirSemana` |
| HU19 | **Como** usuario **quiero** definir mi meta de sueño **para** ajustarla a mi rutina. | Entre 4 y 12 horas. Actualiza el gráfico y la racha. | `PaginaEstadisticas`, `validarMeta`, `cambiarMeta` |

## 3. Casos de uso

| Caso de uso | Actor | Ruta |
|---|---|---|
| CU-07 Registrar noche | Usuario | `#/registrar` |
| CU-08 Consultar historial | Usuario | `#/historial` |
| CU-09 Editar noche | Usuario | `#/registrar/:id` |
| CU-10 Eliminar noche | Usuario | `#/historial` |
| CU-11 Consultar resumen semanal | Usuario | `#/estadisticas` |
| CU-12 Definir meta | Usuario | `#/estadisticas` |

## 4. Clases y componentes

```
RegistroSueno                         RepositorioSueno
- id: String                          - almacen: Storage
- fecha: AAAA-MM-DD                   + leer()
- horaAcostarse: HH:MM                + guardar(datos)
- horaLevantarse: HH:MM                      ▲ usa
- duracionMinutos: Number             useSueno (estado)
- calidad: 1..5                              ▲ usa
- nota: String                        App ─ PaginaRegistrar ─ FormularioSueno ─ RelojSueno
                                          ├ PaginaHistorial ─ ModalConfirmacion
                                          └ PaginaEstadisticas ─ GraficoSemana
```

## 5. Plan y resultados de pruebas funcionales

Ejecutadas en Chromium sobre `dist/index.html`, en 1200 px y 360 px de ancho, sin errores de consola.

| Caso | HU | Pasos | Resultado |
|---|---|---|---|
| CP01 | HU14 | Guardar sin elegir calidad | Pide elegir cómo descansó |
| CP02 | HU14 | Usar fecha futura | La rechaza |
| CP03 | HU14 | Poner horas iguales | Exige al menos 30 minutos |
| CP04 | HU14 | Arrastrar el sol hasta las 06:00 | Campo y duración se actualizan |
| CP05 | HU14 | Mover la manija con teclado | Cambia 5 y 30 minutos |
| CP06 | HU14 | Guardar una noche válida | Muestra "Noche guardada." |
| CP07 | HU14 | Repetir la fecha | Indica que ya está registrada |
| CP08 | HU15 | Recargar la página | Los datos persisten |
| CP09 | HU14 | Escribir HTML en la nota | Se muestra como texto |
| CP10 | HU16 | Editar la hora de levantarse | Actualiza la duración |
| CP11 | HU17 | Eliminar y cancelar; eliminar y confirmar; Esc | Conserva, borra y cierra según el caso |
| CP12 | HU15 | Filtrar por fechas y con rango invertido | Filtra y avisa |
| CP13 | HU18 | Cargar los datos de ejemplo | 7 h 48 min, 5 de 7, racha de 1 día, 3,9 de 5 (verificado a mano) |
| CP14 | HU19 | Meta de 3 h y de 7,5 h | Rechaza 3 h; con 7,5 h mueve la línea |
| CP15 | Todas | Ver a 360 px | Sin desplazamiento horizontal |

`npm test` ejecuta 20 pruebas unitarias del modelo, las estadísticas, las fechas y el repositorio.

## 6. Estándares de codificación aplicados (AA1-EV02)

| Regla | Aplicación |
|---|---|
| Organización por funcionalidades y capas | `paginas`, `componentes`, `hooks`, `modelo`, `servicios`, `utilidades` |
| camelCase, PascalCase, constantes en MAYÚSCULAS | `calcularDuracion`, `RelojSueno`, `MAX_NOTA` |
| Documentación de funciones y clases | JSDoc y comentarios en español en todos los archivos |
| Análisis estático y formato | ESLint y Prettier; EditorConfig |
| Pruebas unitarias | `node:test` |
| Ramas `main`, `develop` y `feature/<módulo>-<descripción>` | `feature/sueno-frontend` integrada en `develop` y `main` |
| Conventional Commits | `feat(modelo): …`, `test: …`, `docs: …`, `chore: …` |
| No exponer ni inyectar datos | React escapa el contenido; la nota no se interpreta como HTML |
