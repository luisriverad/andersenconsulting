# Schema de Datos del Cliente · Dashboard Andersen

Cada cliente se representa con un único archivo **JSON** que contiene toda la información del diagnóstico. La arquitectura es **data-driven**: el código no sabe nada del cliente; los datos viven aquí.

## Estructura

```
{
  "meta":                  → Identidad del cliente (nombre, sector, framework)
  "kpis":                  → Conteos globales (hallazgos, severidades, procesos)
  "conclusionEjecutiva":   → Título + texto de la conclusión del Resumen
  "mapaValor":             → Matriz visual 7 × 6 del Gobierno Corporativo
  "topCriticos":           → Cards de los hallazgos críticos destacados
  "tiposRiesgo":           → Distribución por familia de riesgo
  "roadmap":               → Fases del programa de implementación
  "decisionEstrategica":   → Conclusión / Decisión / Eliminación (cierre)
  "procesos":              → Array de procesos con sus hallazgos
}
```

---

## 1. `meta` (obligatorio)

| Campo | Tipo | Descripción |
|---|---|---|
| `cliente` | string | Nombre corto del cliente (ej: `"GSL"`) |
| `razonSocial` | string | Razón social completa o descripción del negocio |
| `evaluacion` | string | Año o periodo de evaluación (ej: `"2026"`) |
| `sector` | string | Sector industrial (ej: `"LOGÍSTICA PESADA"`) |
| `framework` | string | Framework usado (ej: `"ANDERSEN CONSULTING"`) |
| `tituloDashboard` | string | Primera parte del H1 (ej: `"Diagnóstico de"`) |
| `tituloAcento` | string | Segunda parte del H1, en rojo (ej: `"Gobierno Corporativo"`) |
| `subtitulo` | string | Subtítulo en itálica bajo el H1 |

---

## 2. `kpis` (obligatorio)

| Campo | Tipo |
|---|---|
| `hallazgosTotal` | number |
| `criticosMuerte` | number |
| `altos` | number |
| `medios` | number |
| `bajos` | number |
| `procesos` | number |
| `ejesCorporativos` | number |
| `celdasMapa` | number |

⚠️ El validador comprueba que `hallazgosTotal` y `criticosMuerte` cuadren con la suma de los hallazgos en `procesos[]`. Si no cuadran, muestra warning (no error).

---

## 3. `conclusionEjecutiva`

```json
{
  "titulo": "Frase potente que resume el diagnóstico",
  "texto": "Párrafo de 4-8 líneas con la conclusión ejecutiva."
}
```

---

## 4. `mapaValor` (array de 7 ejes)

Cada eje representa una fila del Mapa de Valor visual (la matriz codificada por colores).

```json
{
  "eje": "NOMBRE DEL EJE EN MAYÚSCULAS",
  "id": "id_unico_del_eje",
  "celdas": [
    { "nombre": "Tema o subcategoría", "sev": "critical" }
  ]
}
```

Valores válidos para `sev`:
- `"critical"` → morado (muerte)
- `"high"` → rojo (grave)
- `"medium"` → amarillo (mejoras)
- `"ok"` → verde (sin observaciones)

---

## 5. `topCriticos` (array)

Cards destacadas en el Resumen para los hallazgos de muerte patrimonial.

```json
{
  "id": "H30",
  "titulo": "Título corto y memorable",
  "area": "Proceso o área del negocio",
  "riesgo": "Descripción del riesgo en una línea"
}
```

---

## 6. `tiposRiesgo` (array)

Distribución por familia de riesgo (gráfica de barras horizontales).

```json
{
  "tipo": "Familia de Riesgo",
  "cantidad": 14,
  "color": "#A6192E"
}
```

---

## 7. `roadmap` (array de fases)

Cada fase del programa de implementación.

```json
{
  "fase": "FASE 1",
  "titulo": "Título de la fase",
  "horizonte": "0–3 meses",
  "color": "#6B2D8C",
  "tint": "#F3EBF7",
  "objetivo": "Frase objetivo",
  "entregables": ["Entregable 1", "Entregable 2"],
  "impacto": "Impacto estimado · Métrica"
}
```

---

## 8. `decisionEstrategica`

Tres bloques del cierre estratégico al final del Roadmap.

```json
{
  "conclusion": "Lo que el diagnóstico concluye",
  "decision": "Lo que se decide hacer",
  "eliminacion": "Lo que se cancela"
}
```

---

## 9. `procesos` (array, lo más voluminoso)

Cada proceso del diagnóstico (típicamente 15-25 procesos).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | ID único del proceso (snake_case, ej: `"operaciones"`) |
| `code` | string | Código corto (ej: `"P01"`, `"P02"`…) |
| `nombre` | string | Nombre completo del proceso |
| `nombreCorto` | string | Nombre para el dropdown y tabs |
| `iconKey` | string | Nombre del icono Lucide React (ver lista abajo) |
| `sintesis` | string | Síntesis ejecutiva de 2-4 líneas |
| `hallazgos` | array | Array de hallazgos del proceso |

Cada `hallazgo`:

```json
{
  "id": "H01",
  "sev": "critical",
  "desc": "Descripción completa del hallazgo (1-5 líneas)",
  "tipo": "Tipo de riesgo institucional"
}
```

### Iconos disponibles para `iconKey`

```
AlertOctagon, ShieldAlert, ShieldCheck, FileText, ShoppingCart,
CreditCard, Gavel, Calculator, DollarSign, Package, Megaphone,
Globe, Cog, Users, Target, Box, UserCheck, Heart, Server,
TrendingUp, Briefcase, Truck, Factory, Building, Layers,
Activity, BarChart3, PieChart, LineChart, Wrench, Hammer,
Lock, Key, Eye, Star, Award, Compass, Map, Network, GitBranch
```

Si pasas un `iconKey` que no existe, el dashboard usa `ShieldAlert` como fallback.

---

## Workflow para un nuevo cliente

1. **Descargar el JSON actual** desde el panel "Cargar Cliente" (botón flotante)
2. **Editar el archivo** con los datos del nuevo cliente (mismo schema)
3. **Arrastrar el archivo** al dropzone del panel "Cargar Cliente"
4. El dashboard se renderiza con los nuevos datos
5. El validador muestra errores si el schema está mal, o warnings si hay inconsistencias

⚠️ Los datos cargados se persisten en `localStorage` del navegador. Para volver al cliente por defecto, usa "Restaurar por defecto".

---

## Ejemplo mínimo funcional

Ver `src/data/template.json` para un schema base que puedes copiar y rellenar.
