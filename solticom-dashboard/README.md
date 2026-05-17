# Diagnóstico Estratégico Empresarial · Hello SOLTICOM

Sistema de Inteligencia Empresarial para Junta de Consejo.
Framework: **Andersen Consulting** · Diseño: **Powered by AXON B2B**.

---

## Stack técnico

- **Vite 5** · build tool
- **React 18** · UI
- **Tailwind CSS 3** · estilos utilitarios
- **Recharts** · gráficas (radar, barras, heatmap)
- **Lucide React** · iconografía monocroma

---

## Instalación

Desde la raíz del proyecto:

```bash
npm install
```

(También funciona con `pnpm install` o `yarn`.)

## Desarrollo

```bash
npm run dev
```

Abre automáticamente `http://localhost:5173`.

## Build de producción

```bash
npm run build
```

Genera la carpeta `dist/` lista para subir a cualquier hosting estático
(Netlify, Vercel, S3, Cloudflare Pages, GitHub Pages, etc.).

```bash
npm run preview
```

Previsualiza el build localmente.

---

## Estructura

```
solticom-dashboard/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx              ← entry point
    ├── App.jsx               ← root component
    ├── index.css             ← Tailwind + globals
    └── components/
        └── SolticomDashboard.jsx  ← Dashboard completo (2,600+ líneas)
```

El componente principal incluye:

- **14 pestañas** organizadas en 3 grupos (Overview · 9 Áreas Evaluadas · Cierre).
- **Telarañas (radar charts)** globales y por nivel de control (Estratégico, Directivo, Operativo).
- **9 macroprocesos** con sus 39 subprocesos, ~380 actividades operativas Nivel 3
  y todos los riesgos con descripción completa del PPT original.
- **Matriz de riesgos**, mapa de calor probabilidad × impacto y Top 12 estratégicos.
- **Roadmap** en 3 fases con cierre Conclusión · Decisión · Eliminación.

---

## Paleta Andersen Consulting

| Token              | Hex       |
|--------------------|-----------|
| Brand red          | `#A6192E` |
| Brand red profundo | `#7A1220` |
| Ink (negro)        | `#1A1A1A` |
| Paper (fondo)      | `#F7F5F2` |
| Border             | `#DDD7CD` |

Tipografía: Georgia / Cormorant Garamond (títulos) + Inter (body).

---

## Cómo trabajar en Cursor

1. **Abre la carpeta del proyecto** en Cursor (`File → Open Folder…`).
2. Abre una terminal integrada: `npm install` y luego `npm run dev`.
3. El archivo principal a editar es:
   `src/components/SolticomDashboard.jsx`
4. Los datos del diagnóstico (KPIs, dimensiones SCI, macroprocesos, riesgos)
   están en la parte superior del mismo archivo, antes de los componentes.
5. Para cambiar paleta, busca la constante `COLORS` al inicio del componente.
6. Para cambiar tipografía, busca `FONT_SERIF` y `FONT_SANS`.

---

## Cliente

**Hello SOLTICOM** · Evaluación 2026
Score SCI Global: **2.12 / 5.00** (Implementado con muchas oportunidades de mejora)

---

© AXON B2B
