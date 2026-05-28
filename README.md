# Dashboard Ejecutivo · Andersen Consulting

Diagnóstico de Gobierno Corporativo con **arquitectura data-driven**: el código no sabe nada del cliente. Para cambiar de cliente, sólo arrastras un nuevo JSON al dashboard.

**Powered by AXON B2B**

---

## Filosofía de la arquitectura

```
                ┌──────────────────────────┐
                │   gsl.json  (DATOS)      │  ← Lo único que cambia entre clientes
                └────────────┬─────────────┘
                             │ prop
                             ▼
                ┌──────────────────────────┐
                │   Dashboard.jsx          │  ← Componente puro, recibe data
                │   (UI · INDEPENDIENTE)   │
                └──────────────────────────┘
```

**Cambiar de cliente = arrastrar un JSON nuevo**. No tocas código, no rompes nada, no rehaces componentes.

---

## Instalación (Cursor)

```bash
# 1. Descomprimir el ZIP y abrir en Cursor
cd dashboard-saas

# 2. Instalar dependencias
npm install

# 3. Levantar el dashboard
npm run dev
```

Se abre automáticamente en `http://localhost:5173`.

### Stack

- **Vite 5** + **React 18** (sin TypeScript, JSX puro)
- **Tailwind 3** (sólo utility classes, sin librerías de componentes)
- **Recharts** para gráficas
- **Lucide React** para iconos

---

## Workflow para cambiar de cliente

### Opción A · Drag & Drop (recomendada)

1. Abrir el dashboard
2. Click en el botón flotante **"Cargar Cliente"** (esquina inferior derecha)
3. Arrastrar el JSON del nuevo cliente al dropzone
4. El validador revisa el schema y carga los datos
5. ✅ Listo. El dashboard se persiste en `localStorage`

### Opción B · Reemplazar archivo

1. Editar `src/data/gsl.json` con los datos del nuevo cliente
2. Guardar
3. Vite recarga automáticamente

### Opción C · Empezar desde cero

1. Copiar `src/data/template.json`
2. Rellenar con los datos del cliente nuevo
3. Cargar vía drag & drop

---

## Estructura de archivos

```
dashboard-saas/
├── src/
│   ├── App.jsx              ← Orquesta el estado + localStorage
│   ├── Dashboard.jsx        ← UI principal (recibe `data` como prop)
│   ├── ClientLoader.jsx     ← FAB flotante + modal drag & drop
│   ├── theme.js             ← Paleta Andersen (colores constantes)
│   ├── icons.js             ← Map de string → icono Lucide
│   ├── validator.js         ← Valida schema del JSON
│   ├── main.jsx             ← Entry point
│   ├── index.css            ← Tailwind + estilos globales
│   └── data/
│       ├── gsl.json         ← Cliente por defecto (61 hallazgos, 20 procesos)
│       ├── template.json    ← Schema vacío para nuevos clientes
│       └── SCHEMA.md        ← Documentación completa del schema
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Lo que verás al abrir el dashboard

### Navegación

```
[ Resumen ]  |  [ Matriz Riesgos · 61 ]  [ Roadmap · 3 ]  [ Procesos Evaluados ▾ ]
                                                              │
                                                              └─ Mega-dropdown
                                                                 con los 20 procesos
                                                                 ordenados por gravedad
```

### Pestañas

1. **Resumen** · KPIs + Mapa de Valor visual + Donut de severidades + Barras apiladas + Top críticos + Conclusión ejecutiva
2. **Matriz de Riesgos** · 61 hallazgos consolidados con filtros por severidad
3. **Roadmap** · 3 fases del programa de implementación + Decisión Estratégica
4. **20 procesos individuales** · cada uno con síntesis ejecutiva + sus hallazgos detallados

### FAB flotante "Cargar Cliente"

Esquina inferior derecha. Abre el modal con:
- Dropzone para drag & drop de JSON
- Botón "Descargar JSON actual" (para usarlo como base de otros clientes)
- Botón "Restaurar por defecto" (vuelve a GSL)
- Validador con mensajes de error específicos y warnings de inconsistencias

---

## Schema del JSON

Ver `src/data/SCHEMA.md` para documentación completa. Resumen:

```json
{
  "meta": { cliente, razonSocial, evaluacion, sector, framework, ... },
  "kpis": { hallazgosTotal, criticosMuerte, altos, medios, bajos, procesos, ... },
  "conclusionEjecutiva": { titulo, texto },
  "mapaValor": [{ eje, id, celdas: [{ nombre, sev }] }],     // 7 ejes × 6 celdas
  "topCriticos": [{ id, titulo, area, riesgo }],
  "tiposRiesgo": [{ tipo, cantidad, color }],
  "roadmap": [{ fase, titulo, horizonte, color, tint, objetivo, entregables, impacto }],
  "decisionEstrategica": { conclusion, decision, eliminacion },
  "procesos": [{ id, code, nombre, nombreCorto, iconKey, sintesis, hallazgos: [...] }]
}
```

### Severidades válidas (`sev`)

| Valor | Color | Significado |
|---|---|---|
| `"critical"` | Morado #6B2D8C | Muerte patrimonial |
| `"high"` | Rojo #A6192E | Grave (importante) |
| `"medium"` | Amarillo #D9941E | Medio (mejoras) |
| `"low"` | Verde #5A9136 | Bajo |
| `"ok"` | Verde #5A9136 | Sin observaciones |

### Iconos disponibles (`iconKey`)

40 iconos Lucide React mapeados. Ver lista completa en `SCHEMA.md`. Si pasas un `iconKey` inválido, el dashboard usa `ShieldAlert` como fallback automático.

---

## Reglas de diseño (paleta Andersen)

- **Light mode siempre** · nunca dark
- **Tipografía Georgia/serif** para títulos · **Inter/sans** para body
- **Rojo institucional** `#A6192E` + **negro** `#1A1A1A` + **papel** `#F7F5F2`
- **Sin iconos a color** · Lucide monocromos en `inkSoft`
- **Footer**: "A N D E R S E N C O N S U L T I N G" + "Powered by AXON B2B"

Para reusar la arquitectura con otra marca, edita `src/theme.js`.

---

## Conclusión · Decisión · Eliminación

**Conclusión**: La arquitectura ahora es genuinamente SaaS. El componente Dashboard es puro: recibe `data` como única prop. Todos los datos del cliente viven en JSON. El validador atrapa schemas inválidos antes de romper la UI.

**Decisión**: Se adopta este patrón data-driven como estándar para futuros clientes de Andersen Consulting. Cada cliente se entrega como JSON; el código se reusa sin modificación.

**Eliminación**: Queda prohibido hardcodear datos de cliente dentro de los componentes React. Todo cliente nuevo entra como JSON validado por el schema. Cambio de cliente = drag & drop, nunca refactor.
