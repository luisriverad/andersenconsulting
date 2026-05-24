import React, { useState } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LabelList,
} from 'recharts';
import andersenLogo from '../assets/andersen_logo.png';
import { extractText, extractDashboardData } from '../utils/fileExtractor.js';

// ============================================================
//  PALETA · ANDERSEN CONSULTING BRAND
//  Rojo institucional + negro corporativo · Light mode ejecutivo
// ============================================================
const COLORS = {
  bg: '#F7F5F2',           // papel cálido refinado
  bgCard: '#FFFFFF',
  bgElev: '#FAF8F4',
  bgSoft: '#F0EBE3',
  border: '#DDD7CD',
  borderSoft: '#E8E3D9',
  borderStrong: '#C8C0B5',
  ink: '#1A1A1A',          // negro corporativo
  inkSoft: '#3D3D3D',
  textMuted: '#6B6B6B',
  textDim: '#9E9E9E',
  // Andersen primary accent (los nombres 'green*' se mantienen como alias internos)
  green: '#A6192E',        // rojo institucional Andersen
  greenSoft: '#C44558',
  greenDeep: '#A6192E',
  greenInk: '#7A1220',     // rojo profundo para hovers
  greenTint: '#FAEFF1',    // rojo muy claro para fondos suaves
  // Severidades alineadas al branding
  red: '#A6192E',
  redTint: '#FAEFF1',
  amber: '#C68214',        // ámbar profundo
  amberTint: '#FBF3DC',
  yellow: '#9B7E1F',
  yellowTint: '#F4EDC9',
  blue: '#2D4F73',         // azul corporativo sobrio
  blueTint: '#E6ECF2',
};

// Tipografía
const FONT_SERIF = 'Georgia, "Times New Roman", "Cormorant Garamond", serif';
const FONT_SANS = 'Inter, "Helvetica Neue", system-ui, sans-serif';

const SEVERITY = {
  critical: { color: '#A6192E', label: 'Crítico', bg: '#FAEFF1', border: '#E8B4BC' },
  high:     { color: '#C68214', label: 'Alto',    bg: '#FBF3DC', border: '#E8D08F' },
  medium:   { color: '#9B7E1F', label: 'Medio',   bg: '#F4EDC9', border: '#D4C68A' },
  low:      { color: '#2B5A35', label: 'Bajo',    bg: '#E4ECDF', border: '#A8C29E' },
};

const MATURITY_LEVELS = [
  { score: 0, label: 'Inexistente',                     color: '#7A1220' },
  { score: 1, label: 'Insuficiente',                    color: '#A6192E' },
  { score: 2, label: 'Muchas oportunidades de mejora',  color: '#C68214' },
  { score: 3, label: 'Algunas oportunidades de mejora', color: '#9B7E1F' },
  { score: 4, label: 'Bien Implementado',               color: '#2B5A35' },
  { score: 5, label: 'Excelencia',                      color: '#1A3D24' },
];

// ============================================================
//  KPIs GLOBALES
// ============================================================
const KPIs = {
  scoreGlobal: 2.12,
  entrevistados: 12,
  reactivosEstrategicos: 9,
  reactivosDirectivos: 11,
  reactivosOperativos: 13,
  reactivosEntreAreas: 148,
  reactivosTotal: 181,
  riesgosIdentificados: 127,
  macroprocesos: 9,
};

const RADAR_GLOBAL = [
  { dimension: 'Control\nEstratégico', score: 1.51, fullMark: 5 },
  { dimension: 'Control\nDirectivo',   score: 1.82, fullMark: 5 },
  { dimension: 'Control\nOperativo',   score: 3.03, fullMark: 5 },
];

// ============================================================
//  SISTEMA DE CONTROL INTERNO · 3 NIVELES
// ============================================================
const SCI_DIMENSIONS = [
  {
    id: 'estrategico',
    nombre: 'Control Estratégico',
    score: 1.51,
    reactivos: 9,
    diagnostico: 'Implementado con muchas oportunidades de mejora',
    resumen: 'Existe filosofía organizacional, pero no se traduce en gobernanza, indicadores ni planeación formal. La operación diaria "se come" a la estrategia.',
    radarItems: [
      { nombre: 'Código de Ética y Conducta',                  short: 'Código Ética',        score: 3.00 },
      { nombre: 'Consejo de Administración y Órganos de Apoyo', short: 'Consejo Admin.',     score: 0.00 },
      { nombre: 'Gobierno Corporativo',                         short: 'Gobierno Corp.',     score: 0.00 },
      { nombre: 'Metas Institucionales de cada Objetivo',       short: 'Metas Inst.',        score: 0.80 },
      { nombre: 'Objetivos Institucionales',                    short: 'Objetivos Inst.',    score: 1.20 },
      { nombre: 'Planeación Estratégica',                       short: 'Planeación Estr.',   score: 1.40 },
      { nombre: 'Políticas Directivas',                         short: 'Políticas Dir.',     score: 1.20 },
      { nombre: 'Sistema de Administración de Riesgos',         short: 'Admón. de Riesgos',  score: 3.00 },
      { nombre: 'Visión y Misión Institucional',                short: 'Visión y Misión',    score: 3.00 },
    ],
    elementos: [
      {
        nombre: 'Ausencia de Gobernanza', score: 0.00, criticidad: 'critical',
        hallazgo: 'No existe un Consejo de Administración ni órganos de apoyo. Las decisiones críticas están centralizadas en el Director General.',
        impacto: 'Genera un "cuello de botella" estratégico y falta de contrapesos. Sin órganos colegiados, la empresa carece de visión externa que rete las decisiones.',
      },
      {
        nombre: 'Metas Sin Indicadores', score: 0.80, criticidad: 'critical',
        hallazgo: 'Aunque hay objetivos, no se miden. Al no existir KPIs (Indicadores Clave de Desempeño), la empresa no puede evaluar si sus esfuerzos están rindiendo frutos.',
        impacto: 'Imposibilidad de saber si está perdiendo dinero en proyectos específicos. Decisiones tomadas por intuición y no por evidencia.',
      },
      {
        nombre: 'Planeación Desarticulada', score: 1.40, criticidad: 'high',
        hallazgo: 'Existe una noción de hacia dónde va la empresa, pero no hay un Plan Estratégico formalizado con presupuesto y responsables asignados.',
        impacto: 'La operación diaria "se come" a la estrategia. Sin instrumentación formal, los objetivos quedan como aspiraciones.',
      },
      {
        nombre: 'Identidad en "Borrador"', score: 2.20, criticidad: 'high',
        hallazgo: 'Es el punto más alto: existe una filosofía (Misión/Visión), pero el personal la percibe de forma ambigua o no la aplica en la toma de decisiones diarias.',
        impacto: 'Filosofía organizacional sin aterrizaje operativo. El equipo no comparte un norte común.',
      },
      {
        nombre: 'Gestión de Riesgos Reactiva', score: 3.00, criticidad: 'medium',
        hallazgo: 'Los riesgos se atienden conforme aparecen ("bomberazos"). No existe inventario formal de riesgos ni controles preventivos.',
        impacto: 'Imposibilidad de anticipar siniestros, proteger la continuidad operativa y blindar el patrimonio.',
      },
    ],
  },
  {
    id: 'directivo',
    nombre: 'Control Directivo',
    score: 1.82,
    reactivos: 11,
    diagnostico: 'Implementado con muchas oportunidades de mejora',
    resumen: 'La dirección opera sin tabla de facultades, sin control presupuestal y sin KPIs por área. Toda decisión escala al Director General.',
    radarItems: [
      { nombre: 'Sistema de Calidad o de Mejora Continua',                              short: 'Calidad / Mejora',     score: 4.00 },
      { nombre: 'Seguridad de Sistemas (Controles Lógicos y Físicos)',                  short: 'Seguridad Sist.',      score: 2.17 },
      { nombre: 'Sistema de Información',                                               short: 'Sistema Info.',        score: 2.00 },
      { nombre: 'Estructura o Diagrama de Organización',                                short: 'Estructura Org.',      score: 2.00 },
      { nombre: 'Comunicación Interna',                                                 short: 'Comunicación Int.',    score: 2.00 },
      { nombre: 'Misión y Objetivos de cada Área de Negocio o Función Organizacional', short: 'Misión por Área',      score: 1.83 },
      { nombre: 'Metas de cada Función y Directivos Relevantes',                        short: 'Metas Funcionales',   score: 1.67 },
      { nombre: 'Indicadores de Desempeño y Resultados por Área Funcional',             short: 'KPIs por Área',        score: 1.50 },
      { nombre: 'Sistema de Sugerencias, Quejas y Denuncias',                           short: 'Sugerencias / Quejas', score: 1.00 },
      { nombre: 'Tabla de Facultades',                                                  short: 'Tabla Facultades',    score: 1.00 },
      { nombre: 'Control Presupuestal',                                                 short: 'Control Presup.',     score: 0.83 },
    ],
    elementos: [
      {
        nombre: 'Inexistencia de Control Presupuestal', score: 0.83, criticidad: 'critical',
        hallazgo: 'Es la brecha más grave. La operación financiera no se rige por techos de gasto ni proyecciones de flujo por área.',
        impacto: 'Decisiones basadas en disponibilidad bancaria del momento y no en una planeación de rentabilidad. Sin techos presupuestales, el costo crece desordenadamente.',
      },
      {
        nombre: 'Centralización Excesiva y Falta de Tabla de Facultades', score: 1.00, criticidad: 'critical',
        hallazgo: 'No existe una delegación formal de autoridad. Al no haber un escalamiento de autorización, el Director General se convierte en el único validador de gastos y contratos.',
        impacto: 'Cuello de botella crítico que limita el crecimiento de los gerentes y la velocidad de respuesta del negocio.',
      },
      {
        nombre: 'Fragilidad en Comunicación y Denuncia', score: 1.00, criticidad: 'critical',
        hallazgo: 'No hay canales institucionales para reportar quejas, sugerencias o malas prácticas. La comunicación interna depende de relaciones informales.',
        impacto: 'Eleva el riesgo de fraudes internos o climas laborales tóxicos que pasan desapercibidos por la dirección.',
      },
      {
        nombre: 'Ceguera de Desempeño', score: 1.50, criticidad: 'high',
        hallazgo: 'La falta de KPIs (Indicadores Clave) por área funcional impide medir la eficiencia real. Se evalúa por "percepción de esfuerzo" y no por resultados concretos.',
        impacto: 'Dificulta la implementación de esquemas de incentivos, planes de carrera y mejora continua basada en datos.',
      },
      {
        nombre: 'Operación Sin Rumbo por Área', score: 1.83, criticidad: 'high',
        hallazgo: 'Aunque la empresa tiene una visión general, los departamentos no cuentan con objetivos específicos ni metas alineadas.',
        impacto: 'Cada área trabaja de forma aislada (silos), sin entender cómo su esfuerzo impacta en la meta global.',
      },
    ],
  },
  {
    id: 'operativo',
    nombre: 'Control Operativo',
    score: 3.03,
    reactivos: 13,
    diagnostico: 'Implementado con algunas oportunidades de mejora',
    resumen: 'Existe sólida estructura documental, pero opera como archivo. La supervisión se enfoca en la forma, no en los riesgos críticos del proceso.',
    radarItems: [
      { nombre: 'Manuales',                                                              short: 'Manuales',           score: 4.00 },
      { nombre: 'Manuales y Guías para uso de los Sistemas de Información',              short: 'Manuales SI',        score: 4.00 },
      { nombre: 'Agendas de Autocontrol – Check List de Supervisión',                    short: 'Autocontrol',        score: 4.00 },
      { nombre: 'Descripción de Puestos',                                                short: 'Descripción Puestos', score: 3.00 },
      { nombre: 'Perfiles de Puestos',                                                   short: 'Perfiles Puestos',   score: 3.00 },
      { nombre: 'Matriz de Riesgos y Controles',                                         short: 'Matriz Riesgos',     score: 3.00 },
      { nombre: 'Políticas y Procedimientos de Calidad de Servicio al Cliente',          short: 'Calidad Servicio',   score: 3.00 },
      { nombre: 'Diagramas de Procesos',                                                 short: 'Diagramas Proc.',    score: 3.00 },
      { nombre: 'Control en Contratación del Personal',                                  short: 'Contratación',       score: 3.00 },
      { nombre: 'Entrenamiento y Capacitación con base en Brechas de Desempeño',         short: 'Capacitación',       score: 3.00 },
      { nombre: 'Análisis de la Volumetría Operativa',                                   short: 'Volumetría',         score: 2.44 },
      { nombre: 'Definición de Estándares y Volumetría del Desempeño',                   short: 'Estándares',         score: 2.00 },
      { nombre: 'Plan de Contingencias y Recuperación',                                  short: 'Contingencias',      score: 2.00 },
    ],
    elementos: [
      {
        nombre: 'Matriz de Riesgos No Operativa', score: 1.67, criticidad: 'high',
        hallazgo: 'Existe matriz de riesgos pero no está ligada a los check-lists de supervisión. La gestión de riesgos no se ejecuta en campo.',
        impacto: 'Los controles documentados no protegen al negocio porque no se aplican en la operación diaria.',
      },
      {
        nombre: 'Supervisión No Efectiva', score: 2.22, criticidad: 'medium',
        hallazgo: 'Los check-lists de supervisión están implementados pero tienen muchas áreas de mejora. Se enfocan en la forma y no en el control de los riesgos críticos del proceso.',
        impacto: 'Supervisión limitada al cumplimiento documental sin identificación de desviaciones que afecten la calidad y rentabilidad.',
      },
      {
        nombre: 'Documentación Pasiva vs. Ejecución Activa', score: 2.44, criticidad: 'medium',
        hallazgo: 'Existen descripciones de puestos y diagramas de procesos, pero operan como "documentos de archivo". No están vinculados a indicadores de Volumetría y Desempeño.',
        impacto: 'Los manuales no sirven para gestionar la carga de trabajo real ni para evaluar productividad.',
      },
      {
        nombre: 'Sólida Estructura Documental', score: 3.00, criticidad: 'low',
        hallazgo: 'Repositorio documental sólido como base. La empresa cuenta con la materia prima documental para operar.',
        impacto: 'Oportunidad para sensibilizar al personal sobre la cultura de estandarización y normatividades internacionales.',
      },
    ],
  },
];

// ============================================================
//  MAPA DE VALOR 2026 · Matriz 7×6 (42 ítems)
//  status: critical | high | medium | low (red, orange, yellow, green)
// ============================================================
const MAPA_VALOR_2026 = [
  // Sustentabilidad · Generación del Valor del Comité Directivo
  {
    grupo: 'Generación del Valor del Comité Directivo',
    bloque: 'Sustentabilidad',
    categoria: 'Socios y Organización Corporativa',
    items: [
      { label: 'Acuerdos y requerimientos de socios',          status: 'critical',
        explicacion: 'No existen acuerdos formales entre socios. Cualquier desacuerdo puede paralizar decisiones críticas o desencadenar conflictos legales costosos.',
        plan: [
          ['Mapear socios actuales y vínculos contractuales', 'Recopilar acuerdos informales vigentes', 'Identificar riesgos legales prioritarios'],
          ['Redactar borrador de Convenio entre Socios', 'Definir cláusulas de gobernanza, salida y dilución', 'Validar con asesor legal especializado'],
          ['Firmar Convenio formal ante notario', 'Capacitar socios sobre cláusulas clave', 'Establecer revisión anual del acuerdo'],
        ] },
      { label: 'Centro de Servicios compartidos',              status: 'critical',
        explicacion: 'No existe estructura que centralice funciones de soporte. Esto genera duplicidad de costos y fragmentación operativa entre unidades.',
        plan: [
          ['Inventariar funciones duplicadas entre unidades', 'Calcular costos actuales por función', 'Identificar servicios candidatos a centralizar'],
          ['Diseñar modelo de Centro de Servicios (CSC)', 'Definir SLAs y facturación interna', 'Asignar líder responsable del CSC'],
          ['Migrar primer wave de servicios (TI, RH)', 'Medir ahorros y eficiencias logradas', 'Plan de expansión a otras funciones'],
        ] },
      { label: 'Precios de transferencia',                     status: 'high',
        explicacion: 'Operaciones entre entidades relacionadas sin política formal de precios. Expone al negocio a contingencias fiscales y observaciones del SAT.',
        plan: [
          ['Inventariar operaciones intercompañía actuales', 'Recopilar contratos vigentes entre partes', 'Evaluar exposición fiscal con asesor'],
          ['Elaborar estudio de precios de transferencia', 'Definir política formal de precios intercompañía', 'Documentar metodología y benchmarks'],
          ['Aplicar política a operaciones recurrentes', 'Generar reporte anual obligatorio', 'Capacitar área fiscal en actualización continua'],
        ] },
      { label: 'Partes relacionadas y conflictos de interés',  status: 'critical',
        explicacion: 'Sin protocolos de identificación ni revelación, las operaciones con partes vinculadas pueden distorsionar resultados y violar normatividad.',
        plan: [
          ['Identificar todas las partes relacionadas existentes', 'Mapear potenciales conflictos de interés activos', 'Definir matriz inicial de revelación'],
          ['Redactar política de partes relacionadas', 'Diseñar formato de declaración anual', 'Establecer comité de revisión'],
          ['Aplicar declaración anual a directivos y socios', 'Revelar operaciones materiales identificadas', 'Monitoreo trimestral del comité'],
        ] },
      { label: 'Código de ética y valores corporativos',       status: 'high',
        explicacion: 'El código existe pero su aplicación es ambigua. El personal no lo usa como guía operativa real en la toma de decisiones diaria.',
        plan: [
          ['Diagnosticar aplicación actual del código', 'Identificar brechas entre código y conducta', 'Encuesta breve de percepción al personal'],
          ['Actualizar código con casos reales del negocio', 'Diseñar programa de inducción al código', 'Definir consecuencias por incumplimiento'],
          ['Capacitación obligatoria a todo el personal', 'Lanzar canal de denuncias asociado', 'Reporte trimestral de adherencia'],
        ] },
      { label: 'Organización holding SAPI–SAPIB–SAB',          status: 'critical',
        explicacion: 'Estructura societaria informal que limita protección patrimonial, acceso a capital institucional y posibilidades de transición generacional ordenada.',
        plan: [
          ['Diagnosticar estructura patrimonial y societaria actual', 'Evaluar conveniencia de SAPI vs alternativas', 'Análisis fiscal preliminar de reestructura'],
          ['Diseñar estructura societaria objetivo', 'Plan de transición con asesor legal y fiscal', 'Validar implicaciones de capital y control'],
          ['Ejecutar primer paso de reestructura', 'Modificar estatutos y registro público', 'Comunicar nueva estructura a stakeholders'],
        ] },
    ],
  },
  {
    grupo: 'Generación del Valor del Comité Directivo',
    bloque: 'Sustentabilidad',
    categoria: 'Control, Auditoría y Riesgos',
    items: [
      { label: 'Control interno estratégico, directivo y operativo', status: 'critical',
        explicacion: 'Score SCI global de 2.12 sobre 5. Las tres dimensiones evidencian brechas materiales que comprometen la sostenibilidad del negocio.',
        plan: [
          ['Priorizar las 5 brechas más críticas del SCI', 'Asignar líder responsable por brecha', 'Aprobar presupuesto de remediación'],
          ['Diseñar planes de acción por brecha', 'Implementar quick wins de bajo costo', 'Capacitar líderes en control interno'],
          ['Auditoría interna de los cambios aplicados', 'Reportar avance al Consejo', 'Definir ciclo anual de evaluación SCI'],
        ] },
      { label: 'Auditoría interna',                                  status: 'high',
        explicacion: 'Sin función formal e independiente de auditoría interna, no hay validación periódica de controles ni detección temprana de fraudes.',
        plan: [
          ['Definir alcance y plan anual de auditoría', 'Contratar auditor interno (interno o externo)', 'Aprobar carta de auditoría'],
          ['Ejecutar primera auditoría de proceso crítico', 'Generar reporte con hallazgos y recomendaciones', 'Presentar al Consejo'],
          ['Implementar recomendaciones priorizadas', 'Auditoría de seguimiento sobre remediación', 'Establecer cadencia trimestral'],
        ] },
      { label: 'Auditoría externa',                                  status: 'high',
        explicacion: 'Aunque existe revisión externa, los hallazgos no se traducen en un plan formal de remediación con responsables y fechas comprometidas.',
        plan: [
          ['Revisar carta a la administración previa', 'Identificar hallazgos pendientes de remediación', 'Asignar responsables por hallazgo'],
          ['Implementar plan de remediación por hallazgo', 'Documentar evidencias de cambio', 'Sesión preparatoria con auditor externo'],
          ['Cerrar auditoría con menos observaciones', 'Plan continuo de mejora basado en hallazgos', 'Reporte semestral al Consejo'],
        ] },
      { label: 'Evaluación de riesgos',                              status: 'low',
        explicacion: 'Existe inventario y monitoreo de riesgos con clasificación por probabilidad e impacto. Es una fortaleza del sistema actual.',
        plan: [
          ['Validar vigencia del inventario de riesgos', 'Actualizar matriz con riesgos emergentes', 'Revisar controles asociados a cada riesgo'],
          ['Pruebas de efectividad de controles clave', 'Documentar resultados y mejoras', 'Capacitación a dueños de riesgo'],
          ['Ciclo formal de revisión semestral', 'Tablero ejecutivo de riesgos', 'Integrar a la toma de decisiones estratégica'],
        ] },
      { label: 'Estados financieros',                                status: 'high',
        explicacion: 'Información financiera disponible pero con retrasos y observaciones que limitan su utilidad como herramienta directiva en tiempo real.',
        plan: [
          ['Acelerar cierre contable a 10 días hábiles', 'Identificar causas recurrentes de retraso', 'Definir formato ejecutivo de reporte'],
          ['Implementar reporte mensual estandarizado', 'Análisis variación vs presupuesto y vs año previo', 'Distribuir a directivos antes del día 15'],
          ['Tablero financiero en tiempo real', 'Capacitar directivos en lectura financiera', 'Integrar métricas operativas al reporte'],
        ] },
      { label: 'Cumplimiento regulatorio y fiscal',                  status: 'low',
        explicacion: 'Obligaciones tributarias y regulatorias al corriente, sin contingencias materiales identificadas. Cumple estándar institucional.',
        plan: [
          ['Validar calendario fiscal completo del año', 'Revisar dictámenes y opiniones vigentes', 'Confirmar cero contingencias materiales'],
          ['Plan de cumplimiento continuo documentado', 'Capacitación al área fiscal sobre cambios', 'Auditoría fiscal preventiva interna'],
          ['Reporte de cumplimiento al Consejo', 'Anticipar reformas del año siguiente', 'Mantener política de gestión proactiva'],
        ] },
    ],
  },
  {
    grupo: 'Generación del Valor del Comité Directivo',
    bloque: 'Sustentabilidad',
    categoria: 'Prácticas Societarias',
    items: [
      { label: 'Operaciones relevantes e inusuales',                  status: 'critical',
        explicacion: 'No existe matriz que identifique ni autorice operaciones fuera del curso ordinario. Expone al negocio a riesgo de simulación y observaciones de autoridad.',
        plan: [
          ['Definir umbrales de operaciones relevantes', 'Identificar operaciones inusuales del último año', 'Establecer comité revisor inicial'],
          ['Política formal de identificación y autorización', 'Formato de revelación de operaciones inusuales', 'Bitácora de operaciones materiales'],
          ['Aplicar política a operaciones del trimestre', 'Reporte mensual al Consejo', 'Capacitar áreas operativas en alertas'],
        ] },
      { label: 'Control y gestión de indicadores',                    status: 'low',
        explicacion: 'Sistema de medición funcional con KPIs claros aplicados consistentemente en la operación. Punto sólido del modelo de gestión.',
        plan: [
          ['Validar KPIs vigentes y su pertinencia', 'Confirmar disponibilidad de datos', 'Revisar frecuencia de actualización'],
          ['Tablero ejecutivo unificado de KPIs', 'Sesión mensual de revisión de indicadores', 'Vincular KPIs a planes de acción'],
          ['Sistema BI integrado con fuentes principales', 'Extender cultura de gestión por datos', 'Revisión trimestral del set de KPIs'],
        ] },
      { label: 'Planeación estratégica',                              status: 'high',
        explicacion: 'Existe noción del rumbo pero no un plan formal con presupuesto, responsables y KPIs por iniciativa estratégica.',
        plan: [
          ['Sesión ejecutiva de diagnóstico estratégico', 'Definir prioridades 2026–2028', 'Identificar iniciativas habilitadoras'],
          ['Formalizar Plan Estratégico con presupuesto', 'Asignar responsables y KPIs por iniciativa', 'Aprobar plan en Consejo'],
          ['Despliegue del plan a áreas funcionales', 'Tablero de seguimiento del plan', 'Sesión trimestral de revisión'],
        ] },
      { label: 'Definición y seguimiento a presupuesto',              status: 'critical',
        explicacion: 'No existe presupuesto operativo formal. Las decisiones de gasto se toman por disponibilidad de caja, no por planeación de rentabilidad.',
        plan: [
          ['Histórico de gastos por área último año', 'Identificar líderes financieros por área', 'Lineamientos generales para 2027'],
          ['Construir presupuesto anual bottom-up', 'Aprobar presupuesto en Consejo', 'Comunicar techos por área'],
          ['Reporte mensual plan vs real', 'Proceso de re-pronóstico trimestral', 'Cultura de accountability presupuestal'],
        ] },
      { label: 'Nominación, remuneración y evaluación de ejecutivos', status: 'critical',
        explicacion: 'Sin políticas formales de compensación ni evaluación de desempeño. La remuneración se asigna por percepción subjetiva, no por resultados.',
        plan: [
          ['Diagnóstico de paquetes actuales por nivel', 'Benchmark externo de compensación', 'Identificar inequidades internas'],
          ['Política formal de compensación por nivel', 'Sistema de evaluación de desempeño anual', 'KPIs personales atados a bono variable'],
          ['Primera revisión anual con nueva política', 'Plan de carrera para posiciones clave', 'Comité de compensación operativo'],
        ] },
      { label: 'Políticas de dirección y facultades',                 status: 'critical',
        explicacion: 'No existe tabla de facultades que delegue autoridad. Todas las decisiones escalan al Director General, generando cuello de botella crítico.',
        plan: [
          ['Mapear decisiones actuales y nivel de aprobación', 'Identificar cuellos de botella en el DG', 'Definir niveles de autoridad propuestos'],
          ['Tabla de Facultades formal aprobada', 'Política de delegación documentada', 'Capacitar directivos en sus nuevos límites'],
          ['Operar bajo nueva tabla de facultades', 'Auditoría de cumplimiento del esquema', 'Revisión semestral de límites'],
        ] },
    ],
  },
  // Crecimiento
  {
    grupo: 'Generación del Valor del Comité Directivo',
    bloque: 'Crecimiento',
    categoria: 'Más Ingreso',
    items: [
      { label: 'Nuevos mercados, segmentos, productos, sectores',    status: 'high',
        explicacion: 'Exploración de mercado reactiva ante oportunidades, sin estrategia documentada de diversificación ni evaluación sistemática.',
        plan: [
          ['Mapeo del mercado actual y potencial', 'Análisis de tendencias del sector', 'Identificar 3–5 oportunidades a explorar'],
          ['Business case por oportunidad seleccionada', 'Priorizar por fit y atractividad', 'Plan piloto para top 2 oportunidades'],
          ['Lanzamiento de pilotos en mercado', 'Métricas de validación por piloto', 'Decisión go/no-go basada en datos'],
        ] },
      { label: 'Análisis de precios',                                 status: 'high',
        explicacion: 'Pricing por benchmark intuitivo, sin modelo formal de costos, valor percibido por el cliente y elasticidad por segmento.',
        plan: [
          ['Análisis de costos por producto/servicio', 'Benchmark de precios de competencia', 'Análisis de elasticidad histórica'],
          ['Política formal de pricing por segmento', 'Modelo de cotización estandarizado', 'Capacitar comercial en nueva política'],
          ['Pilotear nuevos precios en segmento clave', 'Monitorear impacto en margen y volumen', 'Ajuste fino del modelo'],
        ] },
      { label: 'Alianzas, fusiones y adquisiciones',                  status: 'high',
        explicacion: 'Sin estrategia explícita de crecimiento inorgánico. Las alianzas surgen oportunistamente, sin filtros estructurados de fit estratégico.',
        plan: [
          ['Definir estrategia de crecimiento inorgánico', 'Criterios de evaluación de oportunidades', 'Identificar 5–10 targets potenciales'],
          ['Acercamiento exploratorio a top 3 targets', 'Modelo de valuación estandarizado', 'Equipo M&A interno o asesor'],
          ['Iniciar due diligence con target priorizado', 'LOI con condiciones acordadas', 'Plan de integración preliminar'],
        ] },
      { label: 'Portafolio de productos óptimo',                      status: 'high',
        explicacion: 'Mix de productos heredado, sin análisis periódico de rentabilidad por SKU ni racionalización de líneas de baja contribución.',
        plan: [
          ['Análisis ABC de productos por margen y volumen', 'Identificar SKUs de baja contribución', 'Mapeo de canibalización entre productos'],
          ['Plan de racionalización de portafolio', 'Decisión de productos a descontinuar', 'Estrategia de migración de clientes'],
          ['Ejecutar racionalización en mercado', 'Monitorear impacto en ventas', 'Revisar portafolio cada 6 meses'],
        ] },
      { label: 'Análisis de ventas',                                  status: 'high',
        explicacion: 'Reportes de ventas básicos, sin segmentación por cliente, canal o producto que permita decisiones tácticas informadas.',
        plan: [
          ['Levantamiento de datos de ventas por dimensión', 'Definir dashboards prioritarios', 'Asignar analista responsable'],
          ['Dashboard de ventas por canal/cliente/producto', 'Análisis mensual de tendencias', 'Identificar oportunidades de cross-sell'],
          ['Capacitar comercial en uso del dashboard', 'Decisiones tácticas basadas en datos', 'Forecasting comercial estructurado'],
        ] },
      { label: 'Mejores prácticas en ventas',                         status: 'high',
        explicacion: 'Equipo comercial sin metodología estándar. Cada vendedor opera con su propio playbook, dificultando escalamiento y capacitación.',
        plan: [
          ['Identificar top performers internos', 'Documentar su metodología actual', 'Benchmark de mejores prácticas externas'],
          ['Documentar playbook comercial estándar', 'Programa de coaching peer-to-peer', 'Métricas de adherencia al playbook'],
          ['Capacitación masiva al equipo comercial', 'Medir mejora en conversión y ticket', 'Revisión y mejora continua'],
        ] },
    ],
  },
  {
    grupo: 'Generación del Valor del Comité Directivo',
    bloque: 'Crecimiento',
    categoria: 'Mayor Rentabilidad',
    items: [
      { label: 'Oportunidades en gastos',                             status: 'critical',
        explicacion: 'Sin techo presupuestal por área ni proceso formal de autorización de gasto. Los costos crecen sin control vs. el crecimiento de ingresos.',
        plan: [
          ['Análisis de gastos top 20% por monto', 'Identificar gastos no estratégicos', 'Quick wins de reducción inmediata'],
          ['Política de techo presupuestal por área', 'Proceso de aprobación por monto', 'Reporte mensual de ejecución'],
          ['Extender cultura de control de gastos', 'Programa de identificación de ahorros', 'Bono por contribución a ahorros'],
        ] },
      { label: 'Oportunidades en costos de los proyectos',            status: 'high',
        explicacion: 'Proyectos sin estimación formal previa ni control de variaciones. El costo final se conoce hasta el cierre, sin margen para corregir.',
        plan: [
          ['Análisis de proyectos cerrados último año', 'Identificar fuentes recurrentes de sobrecosto', 'Métricas estándar de control de proyecto'],
          ['Metodología formal de gestión de proyectos', 'Estimación previa estandarizada', 'Comité de aprobación de cambios'],
          ['Aplicar metodología a proyectos vigentes', 'Reporte semanal de avance vs plan', 'Cierre formal con lecciones aprendidas'],
        ] },
      { label: 'Seguimiento proyecto vs presupuesto',                 status: 'critical',
        explicacion: 'No existe disciplina de comparación plan vs real. Los desvíos se descubren tarde, sin posibilidad de acciones correctivas oportunas.',
        plan: [
          ['Definir formato estándar de reporte', 'Validar línea base de proyectos actuales', 'Asignar PM por proyecto crítico'],
          ['Reporte semanal plan vs real por proyecto', 'Sesión semanal de revisión con líderes', 'Acciones correctivas documentadas'],
          ['Tablero ejecutivo de portafolio', 'Cultura de accountability instalada', 'Revisión mensual del Consejo'],
        ] },
      { label: 'Oportunidades en costos y gastos financieros',        status: 'critical',
        explicacion: 'Financiamiento por necesidad inmediata, sin estrategia de mezcla óptima de pasivos ni negociación sistemática de tasas.',
        plan: [
          ['Inventario de pasivos y tasas actuales', 'Análisis de mezcla óptima de financiamiento', 'Benchmark de tasas con instituciones'],
          ['Estrategia formal de tesorería', 'Renegociar líneas con mejor tasa', 'Diversificar fuentes de financiamiento'],
          ['Política de tesorería operativa', 'Reporte mensual al CFO', 'Reducción medible en costo financiero'],
        ] },
      { label: 'Mejora de efectividad y eficiencia en procesos',      status: 'critical',
        explicacion: 'Sin métricas de productividad ni programa de mejora continua. Los procesos no se optimizan sistemáticamente, perpetuando ineficiencias.',
        plan: [
          ['Identificar 5 procesos críticos a optimizar', 'Mapear AS-IS de procesos seleccionados', 'Definir métricas de productividad'],
          ['Diseñar TO-BE optimizado', 'Plan de implementación con quick wins', 'Capacitar dueños de proceso'],
          ['Implementar cambios en procesos piloto', 'Medir mejora en KPIs', 'Programa permanente de mejora continua'],
        ] },
      { label: 'Alternativas de fondeo de capital / pasivos',         status: 'low',
        explicacion: 'Acceso adecuado a líneas de crédito tradicionales que cubren las necesidades operativas actuales del negocio.',
        plan: [
          ['Validar líneas vigentes y disponibilidad', 'Identificar necesidades de crecimiento', 'Análisis de cobertura de servicio'],
          ['Explorar alternativas no tradicionales', 'Negociar mejores condiciones existentes', 'Documentar capacidad de fondeo'],
          ['Estructura de capital optimizada', 'Plan de fondeo a 12 meses', 'Monitoreo trimestral de necesidades'],
        ] },
    ],
  },
  {
    grupo: 'Generación del Valor del Comité Directivo',
    bloque: 'Crecimiento',
    categoria: 'Excelencia',
    items: [
      { label: 'Equipo motivado y alto desempeño',                                 status: 'low',
        explicacion: 'Cultura organizacional positiva con compromiso del personal. Fortaleza relevante del negocio sobre la cual capitalizar el crecimiento.',
        plan: [
          ['Validar resultados de clima reciente', 'Identificar pilares de motivación actual', 'Detectar áreas de oportunidad'],
          ['Programa formal de reconocimiento', 'Plan de desarrollo por talento clave', 'Iniciativas de bienestar laboral'],
          ['Lanzar iniciativas seleccionadas', 'Medir engagement post-cambios', 'Ciclo anual de mejora cultural'],
        ] },
      { label: 'Uso eficiente de activos',                                          status: 'high',
        explicacion: 'Activos sin métricas de rotación ni utilización. Existe oportunidad clara de optimizar el capital invertido en activos productivos.',
        plan: [
          ['Inventario completo de activos productivos', 'Métricas actuales de utilización', 'Identificar activos subutilizados'],
          ['Métricas estándar de utilización por activo', 'Plan de optimización de activos críticos', 'Política de adquisición y desincorporación'],
          ['Tablero de utilización de activos', 'Decisiones de inversión basadas en datos', 'Mejora medible en ROA'],
        ] },
      { label: 'Valuación, custodia, control y plan de activos e inmuebles',       status: 'high',
        explicacion: 'Inventario y control de activos básico, sin plan formal de mantenimiento, renovación o estrategia de uso óptimo.',
        plan: [
          ['Inventario físico completo de activos e inmuebles', 'Validar valuaciones actuales', 'Estado físico y depreciación'],
          ['Plan formal de mantenimiento por activo', 'Estrategia de uso óptimo de inmuebles', 'Política de control y custodia'],
          ['Implementar plan de mantenimiento', 'Optimizar uso de inmuebles (rentar/vender)', 'Reporte semestral de activos'],
        ] },
      { label: 'Nuevos negocios, capitalización e inversiones',                     status: 'high',
        explicacion: 'Decisiones de inversión sin análisis formal de retorno. Las oportunidades se evalúan por intuición directiva, no por modelos.',
        plan: [
          ['Definir criterios de evaluación de inversiones', 'Pipeline de oportunidades vigentes', 'Capacidad de inversión disponible'],
          ['Modelo formal de evaluación de retorno', 'Comité de inversiones operativo', 'Política de aprobación por monto'],
          ['Aplicar modelo a oportunidades del trimestre', 'Decisiones documentadas en comité', 'Monitoreo de retorno realizado'],
        ] },
      { label: 'Ventajas competitivas, innovación, desarrollo y benchmarking',     status: 'high',
        explicacion: 'Sin proceso sistemático de comparación con líderes del sector. La innovación es ad-hoc y no responde a una estrategia de diferenciación.',
        plan: [
          ['Análisis competitivo del sector', 'Identificar ventajas y vulnerabilidades', 'Áreas con potencial de innovación'],
          ['Programa formal de innovación', 'Proceso de benchmarking trimestral', 'Equipo o comité de innovación'],
          ['Pipeline de iniciativas de innovación', 'Pilotos de propuestas seleccionadas', 'Métricas de innovación reportadas'],
        ] },
      { label: 'Derechos y marcas',                                                 status: 'high',
        explicacion: 'Activos intangibles registrados pero sin estrategia formal de protección, valuación o monetización en mercados secundarios.',
        plan: [
          ['Inventario completo de marcas y derechos', 'Validar registros y vigencias', 'Identificar marcas no protegidas'],
          ['Estrategia formal de protección de IP', 'Renovaciones y nuevos registros priorizados', 'Valuación de activos intangibles clave'],
          ['Ejecutar registros pendientes', 'Política de licenciamiento y monetización', 'Monitoreo de uso indebido'],
        ] },
    ],
  },
  // Operación del Consejo
  {
    grupo: 'Logística del Consejo de Administración',
    bloque: 'Operación del Consejo',
    categoria: 'Logística del Consejo de Administración',
    items: [
      { label: 'Actas y libro de registro',                                    status: 'critical',
        explicacion: 'Sin libro de actas formal del consejo. Las decisiones críticas no quedan documentadas con valor probatorio frente a terceros o autoridades.',
        plan: [
          ['Recopilar minutas existentes último año', 'Definir formato estándar de acta', 'Asignar secretario formal del consejo'],
          ['Libro de actas formalizado y al corriente', 'Política de conservación documental', 'Capacitar al secretario en buenas prácticas'],
          ['Actas firmadas en cada sesión', 'Repositorio digital con respaldo legal', 'Auditoría anual del libro'],
        ] },
      { label: 'Proceso de convocatoria e integración de memorias',            status: 'critical',
        explicacion: 'Reuniones del consejo sin protocolo formal de convocatoria, agenda previa ni memorias estandarizadas que preserven continuidad.',
        plan: [
          ['Definir calendario anual de sesiones', 'Formato estándar de convocatoria', 'Lista de asistentes formalizada'],
          ['Reglamento operativo del consejo aprobado', 'Plantilla de memoria estandarizada', 'Anticipación mínima de convocatoria definida'],
          ['Aplicar reglamento a sesiones del trimestre', 'Memorias entregadas con anticipación', 'Evaluar adherencia al proceso'],
        ] },
      { label: 'Seguimiento y comunicación con dirección y socios',            status: 'critical',
        explicacion: 'Canal informal de comunicación entre consejo, dirección y socios. Sin reportería estructurada que asegure alineación.',
        plan: [
          ['Definir reportería mensual al consejo', 'Canales formales de comunicación', 'Responsables por tipo de información'],
          ['Paquete ejecutivo mensual estandarizado', 'Sesiones formales con socios mayoritarios', 'Bitácora de comunicaciones materiales'],
          ['Cadencia de reporte cumplida sistemáticamente', 'Reuniones trimestrales con socios', 'Encuesta de satisfacción del consejo'],
        ] },
      { label: 'Coaching directivo y evaluación de los comités',               status: 'critical',
        explicacion: 'No existe evaluación periódica del desempeño del consejo ni programa formal de desarrollo de habilidades para consejeros.',
        plan: [
          ['Definir competencias esperadas en consejeros', 'Programa básico de inducción', 'Identificar consejero líder evaluador'],
          ['Evaluación anual formal del consejo', 'Plan de desarrollo individual por consejero', 'Coaching ejecutivo para presidente'],
          ['Primer ciclo de evaluación completado', 'Acciones de desarrollo en ejecución', 'Indicadores de efectividad del consejo'],
        ] },
      { label: 'Información, estudio previo y soporte automatizado del comité', status: 'critical',
        explicacion: 'Sin paquete de información previa estandarizado, los consejeros deciden con información improvisada o sin tiempo de análisis.',
        plan: [
          ['Definir paquete mínimo de información previa', 'Anticipación mínima de envío (7 días)', 'Formato ejecutivo estandarizado'],
          ['Plataforma digital para consejeros (board portal)', 'Capacitación en uso de la plataforma', 'Información histórica disponible'],
          ['Operación 100% digital del consejo', 'Información oportuna en cada sesión', 'Métricas de uso de la plataforma'],
        ] },
      { label: 'Dinámica de voto y juntas efectivas',                          status: 'critical',
        explicacion: 'Sin reglas formales de quórum, votación y resolución. Las decisiones dependen del consenso informal, no de gobernanza estructurada.',
        plan: [
          ['Definir reglas de quórum y votación', 'Roles formales en sesión', 'Formato de resolución estándar'],
          ['Reglamento de operación formalizado', 'Capacitación a consejeros en reglamento', 'Pruebas en próximas sesiones'],
          ['Operar bajo reglamento consistentemente', 'Decisiones documentadas con votación', 'Revisión anual de efectividad'],
        ] },
    ],
  },
];

const MAPA_STATUS = {
  critical: { color: '#A6192E', label: 'Crítico',          bg: '#FAEFF1' },
  high:     { color: '#C68214', label: 'Alto',             bg: '#FBF3DC' },
  medium:   { color: '#9B7E1F', label: 'Medio',            bg: '#F4EDC9' },
  low:      { color: '#2B5A35', label: 'Adecuado',         bg: '#E4ECDF' },
};

// ============================================================
//  9 MACROPROCESOS · DETALLE COMPLETO
//  Cada uno con: subprocesos · enfoque · actividades Nivel 3 · riesgos
// ============================================================
const MACROPROCESOS = [
  // ===========================================================
  // M01 · MARCA Y GENERACIÓN DE DEMANDA
  // ===========================================================
  {
    id: 'm01',
    code: 'M01',
    nombre: 'Marca y Generación de Demanda',
    nombreCorto: 'Marca y Demanda',
    score: 1.25,
    criticidad: 'critical',
    riesgosTotal: 8,
    statusGlobal: 'Insuficiente · brechas críticas en canales digitales y pauta pagada',
    descripcion: 'Cómo el mercado percibe a Hello SOLTICOM y cómo la empresa atrae prospectos calificados a través de marketing, redes, pauta y eventos.',
    subprocesos: [
      {
        id: '1.1',
        nombre: 'Estrategia de Marketing y Posicionamiento',
        score: 2.0,
        status: 'Implementado, con muchas oportunidades de mejora',
        enfoque: 'Definir el rumbo, presupuesto y mensajes clave del esfuerzo comercial anual.',
        grupos: [
          { id: '1.1', titulo: 'Manual de Identidad Corporativa', actividades: [
            { id: '1.1.1', nombre: 'Definición de Elementos Visuales Base',     status: 'high' },
            { id: '1.1.2', nombre: 'Estandarización de Aplicaciones',           status: 'high' },
            { id: '1.1.3', nombre: 'Protocolo de Autorización de Materiales',   status: 'high' },
          ]},
          { id: '1.2', titulo: 'Plan Anual de Marketing', actividades: [
            { id: '1.2.1', nombre: 'Establecimiento de Objetivos',              status: 'high' },
            { id: '1.2.2', nombre: 'Asignación y Control de Presupuesto',       status: 'high' },
            { id: '1.2.3', nombre: 'Calendario Táctico de Campañas',            status: 'high' },
            { id: '1.2.4', nombre: 'Definición de KPIs de Desempeño',           status: 'high' },
          ]},
          { id: '1.3', titulo: 'Análisis de Competencia', actividades: [
            { id: '1.3.1', nombre: 'Aplicación de Análisis PESTEL',             status: 'high' },
            { id: '1.3.2', nombre: 'Comparativa de Productos y Precios',        status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Identidad poco diferenciada',
            desc: 'Riesgo de proyectar una imagen poco profesional o fragmentada al no contar con un manual de identidad aplicado en todos los puntos de contacto con el cliente.',
            plan: [
              [
                'Auditar aplicación actual del manual de marca en sitio web, redes y propuestas comerciales',
                'Levantar 5 entrevistas cortas a clientes clave sobre cómo perciben a Hello SOLTICOM',
                'Benchmark visual de 3 competidores directos (color, tipografía, mensajes y propuesta de valor)',
                'Definir 3 atributos diferenciadores prioritarios del negocio (mesa con Dirección)',
              ],
              [
                'Construir Brand Pyramid (propósito, promesa, atributos, beneficios racionales y emocionales)',
                'Actualizar manual de identidad con casos de uso reales: web, redes, propuestas y firma de correo',
                'Definir tone of voice y mensajes pilares por sector (Industrial, Comercial, Institucional)',
                'Diseñar plantillas de propuesta comercial v2 y firma de correo institucional',
              ],
              [
                'Rollout de nueva identidad en sitio web, firma de correo y propuestas activas del trimestre',
                'Capacitación de 2 horas al equipo comercial en los nuevos mensajes pilares',
                'Aplicar identidad a las 5 propuestas comerciales activas más relevantes',
                'Encuesta de recordación de marca a 10 prospectos atendidos (baseline vs nuevo)',
              ],
            ],
          },
          {
            nombre: 'Plan de marketing sin presupuesto formal',
            desc: 'Riesgo de operar el esfuerzo comercial por inercia y no por planeación, sin asignación clara de recursos ni KPIs comprometidos.',
            plan: [
              [
                'Recopilar gasto de marketing últimos 12 meses por canal y categoría (Excel base)',
                'Calcular costo por lead (CPL) actual por canal con datos disponibles',
                'Identificar 3–5 iniciativas estratégicas con mayor potencial de ROI',
                'Definir techo presupuestal sugerido como % de ingresos (benchmark sector: 3–5%)',
              ],
              [
                'Construir Plan Anual de Marketing con presupuesto desglosado por iniciativa y mes',
                'Asignar responsables y KPIs por iniciativa (leads generados, conversión, CAC)',
                'Presentar plan al Comité Directivo y aprobar formalmente con firma',
                'Set-up de reportería mensual de plan vs real en Google Sheets / dashboard',
              ],
              [
                'Ejecutar iniciativas Q1 según calendario aprobado, con cierre semanal por responsable',
                'Reporte mensual de avance vs presupuesto y KPIs comprometidos a Dirección',
                'Sesión trimestral de recalibración del plan con base en resultados',
                'Ajuste presupuestal de Q2 basado en aprendizajes del primer trimestre',
              ],
            ],
          },
        ],
      },
      {
        id: '1.2',
        nombre: 'Redes Sociales y Comunicación Digital',
        score: 0.0,
        status: 'Inexistente',
        enfoque: 'Operar canales sociales con contenido, atención y métricas que construyan comunidad y reputación.',
        grupos: [
          { id: '2.1', titulo: 'Estrategia de Contenidos', actividades: [
            { id: '2.1.1', nombre: 'Definición de Pilares de Contenido',        status: 'critical' },
            { id: '2.1.2', nombre: 'Diseño de Calendario Editorial',            status: 'critical' },
            { id: '2.1.3', nombre: 'Programación y Automatización',             status: 'critical' },
          ]},
          { id: '2.2', titulo: 'Protocolo de Atención a Usuarios', actividades: [
            { id: '2.2.1', nombre: 'Matriz de Preguntas Frecuentes',            status: 'critical' },
            { id: '2.2.2', nombre: 'Establecimiento de Niveles de Servicio',    status: 'critical' },
            { id: '2.2.3', nombre: 'Protocolo de Gestión de Crisis',            status: 'critical' },
            { id: '2.2.4', nombre: 'Flujo de Derivación a Ventas',              status: 'critical' },
          ]},
          { id: '2.3', titulo: 'Monitoreo de Métricas de Engagement', actividades: [
            { id: '2.3.1', nombre: 'Análisis de Interacción',                   status: 'critical' },
            { id: '2.3.2', nombre: 'Monitoreo de Crecimiento de Comunidad',     status: 'critical' },
            { id: '2.3.3', nombre: 'Reporte Mensual de Resultados',             status: 'critical' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Ausencia de presencia digital institucional',
            desc: 'Riesgo de invisibilidad ante prospectos que evalúan proveedores en canales digitales antes del primer contacto comercial.',
            plan: [
              [
                'Auditar huella digital actual: sitio web, redes existentes, reseñas en Google',
                'Benchmark de 5 competidores directos en LinkedIn, Facebook y sitio web',
                'Definir 2 redes prioritarias según audiencia (recomendación: LinkedIn + Facebook)',
                'Asignar responsable interno o cotizar agencia externa para gestión mensual',
              ],
              [
                'Crear/optimizar perfiles institucionales en las 2 redes prioritarias',
                'Diseñar calendario editorial mensual con 3 pilares de contenido (técnico, casos, cultura)',
                'Producir banco inicial de 30 piezas (posts, videos cortos, infografías) para 1 mes',
                'Configurar herramienta de programación (Meta Business Suite o Hootsuite)',
              ],
              [
                'Publicar 3 posts/semana de forma consistente durante 4 semanas',
                'Reporte semanal de alcance, engagement y crecimiento de comunidad',
                'Ajuste del calendario editorial basado en performance del primer mes',
                'Reporte mensual de presencia digital al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Sin canal estructurado de captación digital',
            desc: 'Riesgo de perder prospectos que llegan a redes sin un protocolo de atención ni derivación al equipo comercial.',
            plan: [
              [
                'Mapear todos los puntos de contacto digital actuales del prospecto (web, WhatsApp, redes)',
                'Definir lead magnets por etapa: descarga ficha técnica, demo, cotización',
                'Diseñar formularios de captura cortos (máx 4 campos) para sitio y landing pages',
                'Definir SLA de respuesta a leads digitales: máximo 4 horas hábiles',
              ],
              [
                'Implementar formularios y CTAs en sitio web y crear 2 landing pages segmentadas',
                'Configurar WhatsApp Business con menú automatizado y respuestas rápidas',
                'Construir Matriz de FAQs (top 30 preguntas) y flujo de derivación a ventas',
                'Capacitar a ejecutivo asignado en primer contacto digital (script + SLA)',
              ],
              [
                'Monitoreo diario de leads captados y tiempo real de respuesta vs SLA',
                'Reporte semanal de conversión por canal (web / WhatsApp / redes)',
                'A/B testing y optimización de formularios basada en tasa de conversión',
                'Integración con CRM o herramienta de gestión de pipeline (mín. Excel + recordatorios)',
              ],
            ],
          },
        ],
      },
      {
        id: '1.3',
        nombre: 'Publicidad y Campañas de Pago',
        score: 0.0,
        status: 'Inexistente',
        enfoque: 'Adquirir prospectos calificados de forma medible y rentable a través de medios pagados.',
        grupos: [
          { id: '3.1', titulo: 'Configuración de Campañas', actividades: [
            { id: '3.1.1', nombre: 'Selección y Segmentación de Audiencias',    status: 'critical' },
            { id: '3.1.2', nombre: 'Estructura de Campañas y Grupos de Anuncios', status: 'critical' },
          ]},
          { id: '3.2', titulo: 'Diseño de Landing Pages y Conversión', actividades: [
            { id: '3.2.1', nombre: 'Optimización de la Experiencia de Usuario', status: 'critical' },
            { id: '3.2.2', nombre: 'Implementación de Call to Action',          status: 'critical' },
            { id: '3.2.3', nombre: 'Diseño de Formularios de Captura Eficientes', status: 'critical' },
          ]},
          { id: '3.3', titulo: 'Medición del Retorno de Inversión', actividades: [
            { id: '3.3.1', nombre: 'Definición de Conversiones y Atribución',    status: 'critical' },
            { id: '3.3.2', nombre: 'Cálculo del Costo por Adquisición',          status: 'critical' },
            { id: '3.3.3', nombre: 'Análisis de Retorno sobre la Inversión',     status: 'critical' },
            { id: '3.3.4', nombre: 'Reporte de Ciclo Cerrado',                   status: 'critical' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Sin estrategia de medios pagados',
            desc: 'Riesgo de depender exclusivamente de la prospección directiva, generando una operación "de picos" sin flujo constante de leads.',
            plan: [
              [
                'Definir Buyer Persona detallado por segmento (Industrial y Comercial): cargo, dolor, journey',
                'Evaluar 3 plataformas candidatas: Meta Ads, Google Ads, LinkedIn Ads (fit vs audiencia)',
                'Definir objetivo de campaña piloto: awareness vs lead generation',
                'Aprobar presupuesto piloto de USD $1k–3k para los próximos 60 días',
              ],
              [
                'Diseñar creativos para A/B testing: 3 variantes por audiencia y mensaje',
                'Construir 2 landing pages segmentadas con tracking GA4 + Meta Pixel',
                'Lanzar campañas piloto en la plataforma prioritaria seleccionada',
                'Configurar pixels, eventos de conversión y UTMs estándar por canal',
              ],
              [
                'Análisis semanal de CPL, CTR, frecuencia y conversión por campaña',
                'Pausar campañas de bajo rendimiento, escalar las ganadoras (+20% budget)',
                'Documentar playbook de pauta con audiencias, creativos y bidding ganadores',
                'Construir Plan Anual de Medios con presupuesto trimestral comprometido',
              ],
            ],
          },
          {
            nombre: 'Inversión publicitaria sin ROI medible',
            desc: 'Riesgo de gastar presupuesto sin saber qué campaña, audiencia o canal genera retorno real, perpetuando decisiones por intuición.',
            plan: [
              [
                'Definir 4 KPIs centrales: CPL, CAC, ROAS y LTV (con fórmulas y fuente de datos)',
                'Implementar Google Analytics 4 y Meta Pixel en todas las páginas del sitio',
                'Configurar UTMs estándar por canal / campaña / creativo / audiencia',
                'Asignar analista responsable de reportería semanal y mensual',
              ],
              [
                'Definir modelo de atribución: last-click inicial, multi-touch hacia el Q2',
                'Construir reporte semanal de performance por canal y por campaña',
                'Tracking de leads desde primer click hasta cierre del deal en CRM',
                'Crear dashboard ejecutivo (Looker Studio o Sheets) con inversión vs retorno',
              ],
              [
                'Revisión trimestral de ROI por canal con decisiones de reasignación de budget',
                'A/B test mensual de creativos para optimizar CPL en campañas activas',
                'Formalizar playbook de medición con responsables y cadencia documentada',
                'Reporte de ROI publicitario al Comité Directivo cada trimestre',
              ],
            ],
          },
        ],
      },
      {
        id: '1.4',
        nombre: 'Eventos, Relaciones Públicas y Branding Offline',
        score: 3.0,
        status: 'Implementado, con algunas oportunidades de mejora',
        enfoque: 'Posicionar la marca en foros físicos y construir alianzas estratégicas con socios clave del sector.',
        grupos: [
          { id: '4.1', titulo: 'Gestión de Eventos y Exposiciones', actividades: [
            { id: '4.1.1', nombre: 'Selección Estratégica de Foros',              status: 'low' },
            { id: '4.1.2', nombre: 'Logística y Montaje Institucional',           status: 'low' },
            { id: '4.1.3', nombre: 'Protocolo de Captación de Leads en Sitio',    status: 'high' },
            { id: '4.1.4', nombre: 'Seguimiento Post-Evento',                     status: 'low' },
          ]},
          { id: '4.2', titulo: 'Materiales y Presentaciones', actividades: [
            { id: '4.2.1', nombre: 'Desarrollo de Brochure y Fichas Técnicas',    status: 'low' },
            { id: '4.2.2', nombre: 'Estandarización de Presentaciones Ejecutivas', status: 'low' },
            { id: '4.2.3', nombre: 'Producción de Video Institucional y Demos',   status: 'low' },
            { id: '4.2.4', nombre: 'Gestión de Artículos Promocionales',          status: 'low' },
          ]},
          { id: '4.3', titulo: 'Gestión de Alianzas Estratégicas', actividades: [
            { id: '4.3.1', nombre: 'Mapeo de Aliados Clave',                       status: 'low' },
            { id: '4.3.2', nombre: 'Protocolo de Networking y Relaciones Públicas', status: 'low' },
            { id: '4.3.3', nombre: 'Acuerdos de Colaboración',                     status: 'low' },
            { id: '4.3.4', nombre: 'Vigilancia de Reputación de Socios',           status: 'low' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Eventos sin protocolo formal de captación de leads',
            desc: 'Riesgo de asistir a foros o exposiciones sin un proceso para capturar y calificar prospectos, convirtiendo el evento en gasto y no en inversión.',
            plan: [
              [
                'Auditar últimos 3 eventos asistidos: leads capturados vs cerrados (ROI por evento)',
                'Definir criterios de calificación de lead en sitio (metodología DANT: Dinero, Autoridad, Necesidad, Tiempo)',
                'Diseñar formulario digital de captura con QR escaneable desde el stand',
                'Asignar rol "Lead Capturer" para cada evento (responsable único)',
              ],
              [
                'Pilotar el protocolo de captación en los próximos 2 eventos asistidos',
                'Capacitar al staff de stand (1 hora) en script de primer contacto y calificación',
                'Integrar el formulario de captura con CRM para registro automático del lead',
                'Definir SLA de seguimiento post-evento: máximo 24h para primer contacto',
              ],
              [
                'Estandarizar el protocolo en todos los eventos asistidos por la empresa',
                'Reporte de ROI por evento: costo de asistencia vs pipeline generado vs ventas cerradas',
                'Decisión data-driven de qué eventos repetir, reducir o salir en 2027',
                'Plan anual de eventos con KPIs comprometidos por evento (leads, costo, conversión)',
              ],
            ],
          },
          {
            nombre: 'Alianzas dependientes de relaciones personales',
            desc: 'Riesgo de que las alianzas estratégicas se pierdan si rota la persona que las gestiona, al no estar institucionalizadas en acuerdos formales.',
            plan: [
              [
                'Mapear todas las alianzas activas y su nivel actual de formalidad (verbal vs contractual)',
                'Identificar alianzas críticas dependientes de una sola persona (riesgo de continuidad)',
                'Definir criterios de salud por alianza: volumen, contribución a ingresos, calidad relacional',
                'Priorizar top 5 alianzas estratégicas para institucionalizar primero',
              ],
              [
                'Redactar acuerdos formales con top 5 socios: alcance, KPIs y responsables por ambas partes',
                'Establecer Quarterly Business Review (QBR) formal con cada socio estratégico',
                'Crear ficha institucional de cada alianza en repositorio interno compartido',
                'Designar back-up por alianza para reducir riesgo de "persona única"',
              ],
              [
                'Firmar acuerdos formales con top 5 socios (ceremonial + legal)',
                'Ejecutar el primer QBR con cada uno de los 5 socios estratégicos',
                'Plan de expansión: identificar 5 nuevas alianzas potenciales con criterios definidos',
                'Reporte semestral de health de alianzas al Comité Directivo',
              ],
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================
  // M02 · GESTIÓN COMERCIAL
  // ===========================================================
  {
    id: 'm02',
    code: 'M02',
    nombre: 'Gestión Comercial y Desarrollo de Negocios',
    nombreCorto: 'Comercial',
    score: 2.4,
    criticidad: 'high',
    riesgosTotal: 10,
    statusGlobal: 'Implementado con algunas oportunidades de mejora',
    descripcion: 'Cómo Hello SOLTICOM prospecta, califica, cotiza, cierra y retiene a sus clientes, asegurando rentabilidad por proyecto.',
    subprocesos: [
      {
        id: '2.1',
        nombre: 'Prospección y Calificación',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Llenar el embudo con prospectos que tengan perfil técnico y solvencia financiera.',
        grupos: [
          { id: '1.1', titulo: 'Segmentación del Mercado', actividades: [
            { id: '1.1.1', nombre: 'Criterios de Segmentación',         status: 'low' },
            { id: '1.1.2', nombre: 'Identificación de la Persona Clave', status: 'low' },
            { id: '1.1.3', nombre: 'Geolocalización Estratégica',        status: 'low' },
          ]},
          { id: '1.2', titulo: 'Estrategia de Atracción', actividades: [
            { id: '1.2.1', nombre: 'Estrategia Outbound',                status: 'low' },
            { id: '1.2.2', nombre: 'Estrategia Inbound',                 status: 'high' },
            { id: '1.2.3', nombre: 'Gestión de Referidos',               status: 'low' },
          ]},
          { id: '1.3', titulo: 'Calificación DANT', actividades: [
            { id: '1.3.1', nombre: 'Presupuesto',                        status: 'low' },
            { id: '1.3.2', nombre: 'Identificación de la Autoridad',     status: 'low' },
            { id: '1.3.3', nombre: 'Identificación de la Necesidad',     status: 'low' },
            { id: '1.3.4', nombre: 'Identificación del Tiempo',          status: 'low' },
          ]},
          { id: '1.4', titulo: 'Pipeline Management', actividades: [
            { id: '1.4.1', nombre: 'Estandarización del Registro',       status: 'low' },
            { id: '1.4.2', nombre: 'Pipeline Management',                status: 'low' },
            { id: '1.4.3', nombre: 'Alertas de Seguimiento',             status: 'low' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Dependencia de Prospección Directiva',
            desc: 'Riesgo de parálisis comercial si el Director General no atrae prospectos, debido a la falta de un sistema institucional de generación de leads.',
            plan: [
              [
                'Mapear los últimos 20 deals: identificar % originados por el DG vs por sistema',
                'Documentar el "playbook" actual de prospección del DG (canales, mensajes, contactos)',
                'Definir cuota mensual de leads por canal institucional (outbound, inbound, referidos)',
                'Asignar SDR / BDR dedicado a prospección outbound',
              ],
              [
                'Implementar secuencias de outbound (email + LinkedIn + llamada) en HubSpot o similar',
                'Activar canal de referidos formales: política de incentivo a clientes actuales',
                'Establecer reuniones semanales de pipeline con metas por SDR',
                'Capacitar al SDR en mensajes pilares y descalificación temprana',
              ],
              [
                'Medir contribución del DG vs canales institucionales (target: < 30% DG)',
                'Optimizar secuencias según tasa de respuesta y conversión a SQL',
                'Escalar el equipo de prospección si métricas confirman ROI positivo',
                'Reporte mensual de pipeline coverage al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Falta de Calificación DANT',
            desc: 'Riesgo de invertir tiempo de ingeniería y ventas en prospectos que no tienen presupuesto asignado o poder de decisión, generando un alto costo de adquisición sin retorno.',
            plan: [
              [
                'Auditar deals perdidos último año: cuántos descalificaron por presupuesto vs autoridad',
                'Formalizar matriz DANT con criterios cuantificables por cada letra',
                'Diseñar formato de calificación (digital) que el comercial debe llenar',
                'Definir umbral mínimo para escalar a propuesta técnica (mín 3/4 DANT)',
              ],
              [
                'Capacitar al equipo comercial en preguntas DANT (1 sesión + role-play)',
                'Implementar campo DANT obligatorio en CRM antes de mover a "Cotización"',
                'Sesiones semanales de revisión de pipeline para validar calidad de SQLs',
                'Definir SLA: si DANT incompleto, no se asignan recursos de ingeniería',
              ],
              [
                'Medir tasa de conversión SQL → Cierre antes y después del cambio',
                'Calcular ROI: tiempo de ingeniería ahorrado por deals descalificados temprano',
                'Refinar criterios DANT por sector (Industrial vs Comercial vs Institucional)',
                'Reporte mensual de calidad de pipeline al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '2.2',
        nombre: 'Cotización y Cierre',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Asegurar la rentabilidad del proyecto desde su concepción.',
        grupos: [
          { id: '2.1', titulo: 'Levantamiento Técnico', actividades: [
            { id: '2.1.1', nombre: 'Visita de Diagnóstico en Sitio',     status: 'high' },
            { id: '2.1.2', nombre: 'Matriz de Responsabilidades',        status: 'high' },
            { id: '2.1.3', nombre: 'Documento de "Fuera de Alcance"',    status: 'high' },
          ]},
          { id: '2.2', titulo: 'Ingeniería de Costos', actividades: [
            { id: '2.2.1', nombre: 'Cálculo de Costos Directos e Indirectos', status: 'high' },
            { id: '2.2.2', nombre: 'Visto Bueno de Operaciones',              status: 'high' },
            { id: '2.2.3', nombre: 'Análisis de Margen de Contribución',      status: 'high' },
          ]},
          { id: '2.3', titulo: 'Elaboración de Propuesta', actividades: [
            { id: '2.3.1', nombre: 'Uso de Plantilla Institucional',          status: 'high' },
            { id: '2.3.2', nombre: 'Propuesta Técnica vs Económica',          status: 'high' },
            { id: '2.3.3', nombre: 'Manejo de Objeciones Basado en Valor',    status: 'high' },
          ]},
          { id: '2.4', titulo: 'Formalización Contractual', actividades: [
            { id: '2.4.1', nombre: 'Revisión de Contrato por Área Legal',     status: 'high' },
            { id: '2.4.2', nombre: 'Validación Fiscal del Cliente',           status: 'high' },
            { id: '2.4.3', nombre: 'Protocolo de Anticipo',                   status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Venta con Margen Negativo',
            desc: 'Riesgo de error en la ingeniería de costos (viáticos, materiales o mano de obra subestimada) que resulte en proyectos que consumen el flujo de la empresa en lugar de generar utilidad.',
            plan: [
              [
                'Auditar últimas 10 cotizaciones cerradas: comparar costo estimado vs costo real ejecutado',
                'Identificar las 3 categorías de costo más subestimadas (mano obra, viáticos, consumibles)',
                'Definir margen mínimo aceptable por tipo de proyecto (mín 25% contribución)',
                'Bloquear la emisión de propuestas con margen < umbral sin autorización DG',
              ],
              [
                'Construir plantilla de costeo estandarizada con catálogo de costos actualizado',
                'Implementar visto bueno obligatorio de Operaciones antes de enviar propuesta',
                'Capacitar a comerciales en lectura de margen y análisis de sensibilidad',
                'Establecer comité semanal de revisión de propuestas > $500k MXN',
              ],
              [
                'Medir margen real vs estimado de los proyectos cerrados con nuevo proceso',
                'Refinar plantilla con aprendizajes del primer trimestre',
                'Dashboard de margen por comercial y por sector para identificar patrones',
                'Bonus comercial atado a margen real, no solo a volumen de venta',
              ],
            ],
          },
          {
            nombre: 'Compromisos Inviables con Operaciones',
            desc: 'Riesgo de prometer alcances técnicos o fechas de entrega que Operaciones no puede cumplir por falta de capacidad instalada o materiales, dañando la reputación de la marca.',
            plan: [
              [
                'Mapear casos del último año donde se prometió algo que Operaciones no cumplió',
                'Definir capacidad instalada real semanal por tipo de servicio',
                'Crear matriz de "lo que sí se puede / lo que requiere validación / lo que no"',
                'Establecer protocolo: toda promesa de fecha requiere check con líder de Operaciones',
              ],
              [
                'Implementar flujo de "Visto Bueno Operativo" obligatorio en CRM',
                'Capacitar comerciales en alcances técnicos comunes y restricciones operativas',
                'Reunión semanal Comercial + Operaciones para coordinar promesas y capacidades',
                'Documento "Fuera de Alcance" estándar en cada propuesta firmada',
              ],
              [
                'Medir NPS interno (Operaciones evalúa al comercial post-handoff)',
                'Reducir incidencia de "promesas imposibles" en proyectos del trimestre',
                'Métricas de cumplimiento de fechas comprometidas vs reales',
                'Bonus comercial sujeto a cumplimiento de Operaciones en los primeros 60 días',
              ],
            ],
          },
        ],
      },
      {
        id: '2.3',
        nombre: 'Ejecución y Cobranza',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Asegurar el flujo de efectivo y la correcta transición a la operación.',
        grupos: [
          { id: '3.1', titulo: 'Handoff Comercial → Operativo', actividades: [
            { id: '3.1.1', nombre: 'Entrega del Expediente Comercial',     status: 'low' },
            { id: '3.1.2', nombre: 'Explicación de "Promesas Especiales"', status: 'high' },
            { id: '3.1.3', nombre: 'Validación de Fechas de Entrega',      status: 'low' },
          ]},
          { id: '3.2', titulo: 'Seguimiento del Proyecto Vendido', actividades: [
            { id: '3.2.1', nombre: 'Control de Avance vs Cronograma',      status: 'low' },
            { id: '3.2.2', nombre: 'Gestión de Órdenes de Cambio',         status: 'high' },
            { id: '3.2.3', nombre: 'Recopilación de Evidencias de Entrega', status: 'low' },
          ]},
          { id: '3.3', titulo: 'Facturación y Cobranza', actividades: [
            { id: '3.3.1', nombre: 'Emisión de CFDI',                       status: 'low' },
            { id: '3.3.2', nombre: 'Conciliación de Pagos y Complementos',  status: 'low' },
            { id: '3.3.3', nombre: 'Gestión de Cobranza Preventiva',        status: 'low' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Teléfono Descompuesto en el Kick-off',
            desc: 'Riesgo de que el equipo operativo ignore promesas específicas hechas por el vendedor, generando insatisfacción inmediata en el cliente al inicio del servicio.',
            plan: [
              [
                'Auditar últimos 5 kick-offs: identificar gaps entre lo prometido y lo entregado',
                'Diseñar formato estándar de "Acta de Handoff" Comercial → Operaciones',
                'Definir lista de promesas críticas que deben transferirse explícitamente',
                'Establecer reunión obligatoria de handoff antes de iniciar proyecto',
              ],
              [
                'Implementar Acta de Handoff firmada por Comercial, Operaciones y PM',
                'Capacitar al equipo operativo en lectura del expediente comercial',
                'Definir SLA: kick-off interno máximo 48h después de firma de contrato',
                'Reunión tripartita Cliente + Comercial + Operaciones en primera semana',
              ],
              [
                'Medir tiempo entre firma y kick-off interno (target: < 48h)',
                'NPS interno del PM hacia la calidad del handoff comercial',
                'Reportar incidencias de "promesas no transferidas" en revisión semanal',
                'Refinar formato según retroalimentación de los primeros 5 proyectos',
              ],
            ],
          },
          {
            nombre: 'Fuga de Cobranza por Falta de Evidencias',
            desc: 'Riesgo de no poder facturar o cobrar hitos debido a la falta de firmas en actas de entrega o bitácoras de obra que respalden el trabajo realizado.',
            plan: [
              [
                'Auditar cobros pendientes > 90 días: identificar % bloqueado por falta de evidencia',
                'Definir formato estándar de Acta de Entrega por hito (con campos obligatorios)',
                'Construir checklist de evidencias requeridas para facturar cada tipo de hito',
                'Asignar responsable de "evidencias" en cada proyecto (rol formal)',
              ],
              [
                'Implementar Acta de Entrega digital con firma electrónica del cliente',
                'Capacitar PMs en recopilación oportuna de evidencias (no esperar al cierre)',
                'Bloquear emisión de CFDI si el expediente de evidencias está incompleto',
                'Repositorio digital por proyecto con evidencias accesibles en tiempo real',
              ],
              [
                'Reducir cartera bloqueada por falta de evidencias > 50% en 90 días',
                'DSO (Days Sales Outstanding) baja medible mes a mes',
                'Auditoría trimestral aleatoria de expedientes vs evidencias',
                'Reporte de cumplimiento de evidencias al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '2.4',
        nombre: 'Postventa y Satisfacción',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Retención del cliente y maximización de su valor de vida.',
        grupos: [
          { id: '4.1', titulo: 'Medición de Satisfacción', actividades: [
            { id: '4.1.1', nombre: 'Encuesta de Transacción',              status: 'high' },
            { id: '4.1.2', nombre: 'Clasificación de Clientes',            status: 'high' },
            { id: '4.1.3', nombre: 'Análisis de Satisfacción del Cliente', status: 'high' },
          ]},
          { id: '4.2', titulo: 'Gestión Interna del Cierre', actividades: [
            { id: '4.2.1', nombre: 'Reunión de Cierre Directiva',          status: 'high' },
            { id: '4.2.2', nombre: 'Documentación de Fallas Técnicas',     status: 'high' },
            { id: '4.2.3', nombre: 'Minuta de Mejora Interna',             status: 'high' },
          ]},
          { id: '4.3', titulo: 'Inteligencia Comercial Post-Venta', actividades: [
            { id: '4.3.1', nombre: 'Entrevista de Salida / Cartas de Recomendación', status: 'high' },
            { id: '4.3.2', nombre: 'Análisis Comparativo / Casos de Éxito',          status: 'high' },
            { id: '4.3.3', nombre: 'Ajuste de la Estrategia de Pricing',             status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Ceguera de Satisfacción',
            desc: 'Riesgo de tener "detractores silenciosos" (clientes insatisfechos que no se quejan pero no vuelven) por no aplicar métricas de satisfacción de forma sistemática.',
            plan: [
              [
                'Diseñar encuesta NPS de 3 preguntas para enviar al cierre de cada proyecto',
                'Definir umbral de alerta (NPS < 7) que dispare acción correctiva inmediata',
                'Identificar clientes inactivos últimos 12 meses para llamada de feedback',
                'Asignar responsable de Customer Success (puede ser part-time inicial)',
              ],
              [
                'Implementar encuesta automatizada (Typeform/Google Forms) post-entrega',
                'Establecer SLA: respuesta a detractor en < 24h por DG o líder asignado',
                'Capacitar al CSM en script de llamadas de feedback a clientes inactivos',
                'Dashboard mensual de NPS por sector y por tipo de servicio',
              ],
              [
                'Tasa de respuesta a encuestas > 30% en proyectos cerrados',
                'Recuperar 2-3 clientes inactivos a través de llamadas de feedback',
                'Refinar oferta de servicios basado en hallazgos de detractores',
                'Reporte trimestral de NPS y voz del cliente al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Casos de Éxito y Cartas de Recomendación sin Documentar',
            desc: 'Riesgo de no capitalizar comercialmente las entregas exitosas por no documentar casos de éxito ni solicitar cartas formales de clientes satisfechos.',
            plan: [
              [
                'Identificar los 5 mejores proyectos del año pasado (impacto + cliente reconocido)',
                'Definir template estándar de caso de éxito (reto / solución / resultado)',
                'Diseñar formato de solicitud de carta de recomendación',
                'Asignar responsable de documentación comercial',
              ],
              [
                'Producir 5 casos de éxito completos con quotes y métricas',
                'Solicitar cartas de recomendación a 10 clientes satisfechos',
                'Integrar casos en propuestas comerciales activas',
                'Publicar 2-3 casos en sitio web y LinkedIn',
              ],
              [
                'Establecer cadencia: 1 caso de éxito producido por mes',
                'Medir uso de casos en propuestas (% de propuestas con caso relevante)',
                'Tasa de conversión de propuestas con vs sin casos de éxito',
                'Reporte semestral de inteligencia comercial al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '2.5',
        nombre: 'Fidelización y Recompra',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Retención del cliente y maximización de su valor de vida.',
        grupos: [
          { id: '5.1', titulo: 'Garantías y Soporte', actividades: [
            { id: '5.1.1', nombre: 'Protocolo de Reclamaciones',           status: 'high' },
            { id: '5.1.2', nombre: 'Matriz de Garantías por Servicio',     status: 'high' },
            { id: '5.1.3', nombre: 'Análisis de Fallas Recurrentes',       status: 'high' },
          ]},
          { id: '5.2', titulo: 'Customer Success', actividades: [
            { id: '5.2.1', nombre: 'Calendario de Contacto Preventivo',    status: 'high' },
            { id: '5.2.2', nombre: 'Boletines de Valor Agregado',          status: 'high' },
            { id: '5.2.3', nombre: 'Auditorías de Uso',                    status: 'high' },
          ]},
          { id: '5.3', titulo: 'Cross-sell y Up-sell', actividades: [
            { id: '5.3.1', nombre: 'Identificación de Oportunidades',      status: 'high' },
            { id: '5.3.2', nombre: 'Estrategia de Escalamiento',           status: 'high' },
            { id: '5.3.3', nombre: 'Renovaciones Anticipadas',             status: 'high' },
          ]},
          { id: '5.4', titulo: 'Programas de Lealtad', actividades: [
            { id: '5.4.1', nombre: 'Incentivos por Recomendación',         status: 'high' },
            { id: '5.4.2', nombre: 'Eventos de Fidelización',              status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Pérdida de Recompra por Omisión',
            desc: 'Riesgo de que el cliente contrate servicios complementarios o mantenimientos con la competencia porque Hello SOLTICOM no realizó una estrategia de venta cruzada oportuna.',
            plan: [
              [
                'Mapear cartera de clientes activos: tiempo desde último servicio y oportunidades latentes',
                'Identificar 3-5 servicios complementarios típicos al servicio principal',
                'Definir trigger de contacto preventivo (ej: 60 días post-entrega, anual)',
                'Asignar responsable de relación por cuenta clave (Account Manager)',
              ],
              [
                'Construir Calendario de Contacto Preventivo por cuenta clave',
                'Diseñar boletines mensuales con casos de uso y nuevos servicios',
                'Capacitar al Account Manager en script de up-sell y cross-sell',
                'Implementar CRM con recordatorios automáticos de contacto periódico',
              ],
              [
                'Tasa de recompra (% clientes que vuelven a contratar en 12 meses)',
                'Métricas de cross-sell: ticket promedio incremental por cliente',
                'NPS de clientes con Account Manager vs sin Account Manager',
                'Reporte trimestral de Customer Success al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Incumplimiento de Garantías',
            desc: 'Riesgo de una respuesta lenta ante fallas post-entrega por no tener un protocolo de soporte técnico institucional, deteriorando la lealtad del cliente.',
            plan: [
              [
                'Auditar últimas 10 reclamaciones: tiempo de respuesta y resolución',
                'Documentar matriz de garantías por tipo de servicio (cobertura y vigencia)',
                'Definir SLA de respuesta a reclamación: < 24h primer contacto, < 72h resolución',
                'Asignar canal único de reclamaciones (email / WhatsApp dedicado)',
              ],
              [
                'Implementar protocolo formal de reclamaciones con tickets y trazabilidad',
                'Capacitar equipo técnico en respuesta a reclamaciones bajo garantía',
                'Comunicar al cliente la cobertura de garantía al cierre de cada proyecto',
                'Análisis trimestral de fallas recurrentes para mejora de servicio',
              ],
              [
                'Cumplimiento de SLA de garantías > 95% (medido en CRM)',
                'NPS específico de clientes que activaron garantía',
                'Reducción medible de fallas recurrentes por categoría',
                'Reporte mensual de garantías al Comité Directivo',
              ],
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================
  // M03 · OPERACIÓN Y ENTREGA DE VALOR
  // ===========================================================
  {
    id: 'm03',
    code: 'M03',
    nombre: 'Operación y Entrega de Valor',
    nombreCorto: 'Operación',
    score: 2.0,
    criticidad: 'high',
    riesgosTotal: 8,
    statusGlobal: 'Implementado con muchas oportunidades de mejora',
    descripcion: 'Ejecución de los proyectos contratados: planeación, ejecución en campo, control de calidad y cierre formal con el cliente.',
    subprocesos: [
      {
        id: '3.1',
        nombre: 'Planeación y Kick-off',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Asegurar que los recursos (humanos y materiales) estén listos antes de arrancar.',
        grupos: [
          { id: '1.1', titulo: 'Recepción Formal del Proyecto', actividades: [
            { id: '1.1.1', nombre: 'Validación de la Carpeta Comercial',           status: 'high' },
            { id: '1.1.2', nombre: 'Sesión de Transferencia de Conocimiento',      status: 'high' },
            { id: '1.1.3', nombre: 'Cotejo de Alcance vs Cotización',              status: 'high' },
            { id: '1.1.4', nombre: 'Formalización de Aceptación Operativa',        status: 'high' },
          ]},
          { id: '1.2', titulo: 'Asignación de Recursos', actividades: [
            { id: '1.2.1', nombre: 'Análisis de Capacidad Instalada',              status: 'high' },
            { id: '1.2.2', nombre: 'Designación del Project Manager',              status: 'high' },
            { id: '1.2.3', nombre: 'Inventario de Herramientas y Equipo',          status: 'high' },
            { id: '1.2.4', nombre: 'Matriz de Responsabilidades',                  status: 'high' },
          ]},
          { id: '1.3', titulo: 'Planeación Detallada', actividades: [
            { id: '1.3.1', nombre: 'Desglose de Estructura de Trabajo',            status: 'high' },
            { id: '1.3.2', nombre: 'Establecimiento de la Ruta Crítica',           status: 'high' },
            { id: '1.3.3', nombre: 'Definición de Hitos de Control y Facturación', status: 'high' },
            { id: '1.3.4', nombre: 'Plan de Comunicación y Reportabilidad',        status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Desfase en la Ruta Crítica',
            desc: 'Riesgo de no identificar interdependencias entre tareas, provocando que el retraso de un proveedor o una entrega de material detenga al equipo operativo, incrementando costos fijos.',
            plan: [
              [
                'Auditar últimos 5 proyectos: identificar causas más frecuentes de retraso',
                'Mapear dependencias críticas típicas (materiales, permisos, validaciones cliente)',
                'Definir plantilla estándar de plan de proyecto con ruta crítica',
                'Asignar PM con autoridad real sobre cronograma y recursos',
              ],
              [
                'Implementar herramienta de planeación (MS Project o ClickUp/Notion)',
                'Establecer reunión semanal de revisión de ruta crítica con stakeholders',
                'Definir protocolo de alerta temprana: 7 días antes de hito crítico',
                'Capacitar PMs en gestión de dependencias y construcción de buffer',
              ],
              [
                'Medir desviación de cronograma real vs plan en proyectos del trimestre',
                'Dashboard de proyectos activos con semáforo de ruta crítica',
                'Reducir incidencia de paros por dependencia no anticipada',
                'Reporte mensual de cumplimiento de cronogramas al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Subestimación de Recursos',
            desc: 'Riesgo de asignar personal insuficiente o sin las competencias técnicas necesarias para el tipo de obra, derivando en errores de ejecución y posibles accidentes.',
            plan: [
              [
                'Mapear matriz de competencias del personal técnico actual',
                'Documentar requerimientos de capacidad por tipo de proyecto',
                'Auditar proyectos del año pasado: análisis de capacity real vs requerido',
                'Definir protocolo de asignación basado en complejidad y competencias',
              ],
              [
                'Implementar herramienta de capacity planning (mín. Sheets compartido)',
                'Validar disponibilidad y competencias antes de comprometer fechas a comercial',
                'Capacitar líderes técnicos en evaluación de complejidad de proyecto',
                'Establecer "ratio mínimo" de personal senior por proyecto',
              ],
              [
                'Métricas de productividad por proyecto y por equipo',
                'Reducir incidencia de "proyectos con personal insuficiente"',
                'Plan de capacitación para cerrar gaps de competencias críticas',
                'Revisión mensual de utilización del equipo técnico',
              ],
            ],
          },
        ],
      },
      {
        id: '3.2',
        nombre: 'Ejecución y Bitácora',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Garantizar que el trabajo en campo se realice bajo estándares de calidad y seguridad.',
        grupos: [
          { id: '2.1', titulo: 'Logística y Materiales', actividades: [
            { id: '2.1.1', nombre: 'Explosión de Insumos por Proyecto',            status: 'high' },
            { id: '2.1.2', nombre: 'Solicitud y Logística de Abastecimiento',      status: 'high' },
            { id: '2.1.3', nombre: 'Control de Salidas y Devoluciones de Almacén', status: 'high' },
            { id: '2.1.4', nombre: 'Gestión de Stock de Emergencia',               status: 'high' },
          ]},
          { id: '2.2', titulo: 'Avance en Sitio', actividades: [
            { id: '2.2.1', nombre: 'Registro Diario de Actividades (Bitácora)',    status: 'high' },
            { id: '2.2.2', nombre: 'Medición de Avance Físico vs Financiero',      status: 'high' },
            { id: '2.2.3', nombre: 'Gestión de Órdenes de Cambio',                 status: 'high' },
            { id: '2.2.4', nombre: 'Reporte de Estatus al Cliente',                status: 'high' },
          ]},
          { id: '2.3', titulo: 'Calidad y Seguridad', actividades: [
            { id: '2.3.1', nombre: 'Inspecciones de Calidad en Proceso',           status: 'high' },
            { id: '2.3.2', nombre: 'Análisis de Riesgos por Tarea',                status: 'high' },
            { id: '2.3.3', nombre: 'Gestión de No Conformidades Técnicas',         status: 'high' },
            { id: '2.3.4', nombre: 'Protocolo de Orden y Limpieza',                status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Desviación del Alcance (Extras No Cobrables)',
            desc: 'Riesgo de realizar trabajos adicionales solicitados por el cliente en sitio sin generar orden de cambio cobrable, mermando la utilidad del proyecto.',
            plan: [
              [
                'Auditar últimos 10 proyectos: cuantificar "extras no facturados" en MXN',
                'Identificar las categorías de extras más comunes solicitados por clientes',
                'Diseñar formato simple de "Orden de Cambio" firmable en sitio',
                'Capacitar líderes de obra en identificación de cambios de alcance',
              ],
              [
                'Implementar Orden de Cambio digital (firma electrónica) accesible desde móvil',
                'Definir SLA: ningún extra se ejecuta sin OC firmada por cliente',
                'Script de comunicación al cliente: "esto requiere OC adicional"',
                'Reunión semanal Operaciones + Comercial para validar OC en flight',
              ],
              [
                'Reducir extras no facturados > 50% en 90 días',
                'Métrica: ingreso adicional capturado por OCs ejecutadas',
                'Refinar formato según retroalimentación de líderes en sitio',
                'Reporte mensual de OCs al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Falta de Supervisión de Seguridad (QHSE)',
            desc: 'Riesgo de incidentes laborales por omisión de uso de EPP o protocolos de seguridad, lo que puede derivar en multas de la STPS, IMSS o clausuras de obra.',
            plan: [
              [
                'Auditar cumplimiento actual de EPP y protocolos en 3 obras activas',
                'Inventariar EPP existente vs requerido por tipo de trabajo',
                'Documentar análisis de riesgos por tarea (ART) crítica',
                'Definir rol de "Supervisor de Seguridad" en cada obra',
              ],
              [
                'Implementar checklist diario de seguridad firmado por supervisor en sitio',
                'Capacitar al 100% del personal operativo en uso correcto de EPP',
                'Reuniones de seguridad ("toolbox talk") de 5 min al inicio de cada turno',
                'Sistema de reporte de "casi-accidentes" con análisis y acción correctiva',
              ],
              [
                'Cero accidentes incapacitantes en el trimestre',
                'Cumplimiento de checklist diario > 95% (auditado aleatoriamente)',
                'Reducir incidentes reportables vs trimestre anterior',
                'Reporte mensual QHSE al Comité Directivo + revisión legal STPS',
              ],
            ],
          },
        ],
      },
      {
        id: '3.3',
        nombre: 'Calidad y Pruebas',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Validar que lo instalado o entregado funciona según las especificaciones.',
        grupos: [
          { id: '3.1', titulo: 'Protocolos de Validación', actividades: [
            { id: '3.1.1', nombre: 'Pruebas de Aceptación (FAT)',                  status: 'high' },
            { id: '3.1.2', nombre: 'Pruebas de Aceptación en Sitio (SAT)',         status: 'high' },
            { id: '3.1.3', nombre: 'Checklist de Criterios de Éxito',              status: 'high' },
            { id: '3.1.4', nombre: 'Certificación de Parámetros Técnicos',         status: 'high' },
          ]},
          { id: '3.2', titulo: 'Gestión de Hallazgos', actividades: [
            { id: '3.2.1', nombre: 'Registro y Clasificación de Hallazgos',        status: 'high' },
            { id: '3.2.2', nombre: 'Análisis de Causa Raíz',                       status: 'high' },
            { id: '3.2.3', nombre: 'Plan de Acción y Retrabajo',                   status: 'high' },
            { id: '3.2.4', nombre: 'Validación de Cierre',                         status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Uso de Instrumentos No Calibrados',
            desc: 'Riesgo de mediciones erróneas en instalaciones críticas que invaliden certificaciones técnicas o pongan en riesgo la infraestructura del cliente.',
            plan: [
              [
                'Inventario completo de instrumentos de medición y prueba',
                'Identificar fecha de última calibración y vigencia por instrumento',
                'Contratar laboratorio de calibración acreditado (EMA)',
                'Definir frecuencia de calibración por tipo de instrumento',
              ],
              [
                'Programa anual de calibración con calendario formal',
                'Etiquetado físico de cada instrumento con fecha y vigencia',
                'Bitácora digital de calibración accesible al equipo técnico',
                'Bloqueo de uso de instrumentos fuera de calibración',
              ],
              [
                '100% de instrumentos críticos calibrados al día',
                'Cero certificaciones rechazadas por instrumentos no aptos',
                'Auditoría interna trimestral de cumplimiento de calibración',
                'Reporte de calibración al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Retrabajos por Falta de Autocontrol',
            desc: 'Riesgo de costos elevados por corregir trabajos mal ejecutados desde el origen por no tener puntos de inspección durante la ejecución.',
            plan: [
              [
                'Mapear top 5 procesos donde más ocurren retrabajos',
                'Definir puntos de control intermedios (hold points) por proceso',
                'Diseñar checklist de autocontrol firmable por el operario',
                'Cuantificar costo de retrabajos del año pasado (baseline)',
              ],
              [
                'Implementar autocontrol obligatorio con firma del operario en cada hito',
                'Capacitar a operarios en uso de checklist y consecuencias de omisiones',
                'Validación de supervisor en puntos críticos antes de avanzar',
                'Repositorio de evidencias por proyecto para auditoría',
              ],
              [
                'Reducir costo de retrabajos > 30% en 90 días',
                'Métricas de cumplimiento de autocontrol > 95%',
                'Análisis mensual de causas raíz de no conformidades',
                'Reporte de calidad al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '3.4',
        nombre: 'Cierre y Retroalimentación',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Formalizar la terminación y transferir la responsabilidad al cliente.',
        grupos: [
          { id: '4.1', titulo: 'Acta de Entrega Final', actividades: [
            { id: '4.1.1', nombre: 'Elaboración del Documento Legal de Entrega',   status: 'high' },
            { id: '4.1.2', nombre: 'Recopilación de Evidencias y Anexos',          status: 'high' },
            { id: '4.1.3', nombre: 'Firma Mancomunada (Cliente y Hello SOLTICOM)', status: 'high' },
            { id: '4.1.4', nombre: 'Declaración de Inicio de Garantía',            status: 'high' },
          ]},
          { id: '4.2', titulo: 'Desmovilización y Cierre Administrativo', actividades: [
            { id: '4.2.1', nombre: 'Liquidación de Órdenes de Compra de Terceros', status: 'high' },
            { id: '4.2.2', nombre: 'Retorno y Auditoría de Herramientas y Equipos', status: 'high' },
            { id: '4.2.3', nombre: 'Liberación de Capital Humano',                 status: 'high' },
            { id: '4.2.4', nombre: 'Resguardo del Expediente Técnico',             status: 'high' },
          ]},
          { id: '4.3', titulo: 'Retroalimentación de Mejora', actividades: [
            { id: '4.3.1', nombre: 'Aplicación de Encuestas de Satisfacción',      status: 'high' },
            { id: '4.3.2', nombre: 'Entrevista de Cierre con el Cliente',          status: 'high' },
            { id: '4.3.3', nombre: 'Análisis de Desempeño Operativo (KPIs)',       status: 'high' },
            { id: '4.3.4', nombre: 'Retroalimentación al Proceso Comercial',       status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Cierre Administrativo Lento',
            desc: 'Riesgo de retrasar la facturación final debido a que el equipo operativo no entrega los reportes, fotos y evidencias necesarias a la oficina central de manera oportuna.',
            plan: [
              [
                'Auditar últimos 10 cierres: tiempo entre fin de obra y facturación final',
                'Identificar bloqueadores típicos del cierre (evidencias, firmas, reportes)',
                'Diseñar checklist de cierre con todos los entregables requeridos',
                'Definir SLA: cierre administrativo máximo 10 días post-entrega física',
              ],
              [
                'Implementar formato de Acta de Cierre digital con firma del cliente',
                'Capacitar PMs en recopilación de evidencias durante (no después de) la obra',
                'Bloquear liberación del personal hasta completar expediente de cierre',
                'Repositorio digital por proyecto con todas las evidencias',
              ],
              [
                'Reducir tiempo de cierre a < 10 días promedio',
                'Cobranza final acelerada (impacto en DSO)',
                'Auditoría trimestral de calidad de expedientes de cierre',
                'Reporte mensual de cierres al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Pérdida de Materiales Sobrantes y Herramientas',
            desc: 'Riesgo de fuga de activos (herramientas o materiales) al finalizar la obra por no tener un protocolo de inventario de retorno y limpieza de sitio.',
            plan: [
              [
                'Inventario actual de herramientas y equipos asignados a obras',
                'Auditar últimas 5 desmovilizaciones: % de activos no retornados',
                'Diseñar formato de "Salida" y "Retorno" de herramientas por persona',
                'Definir responsable de almacén con autoridad de recepción',
              ],
              [
                'Implementar bitácora digital de salidas/retornos con firma del responsable',
                'Capacitar líderes de obra en protocolo de retorno y limpieza',
                'Auditoría física al cierre de cada obra con conteo',
                'Política de penalización al responsable por pérdida injustificada',
              ],
              [
                'Reducir pérdida de activos > 70% en 90 días',
                'Inventario físico vs sistema con discrepancia < 5%',
                'Auditoría mensual aleatoria de inventario en almacén',
                'Reporte de pérdidas al Comité Directivo',
              ],
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================
  // M04 · RECURSOS HUMANOS
  // ===========================================================
  {
    id: 'm04',
    code: 'M04',
    nombre: 'Gestión del Recurso Humano',
    nombreCorto: 'Recursos Humanos',
    score: 2.6,
    criticidad: 'medium',
    riesgosTotal: 10,
    statusGlobal: 'Implementado con algunas oportunidades de mejora',
    descripcion: 'Atracción, desarrollo, evaluación, compensación y retención del talento, con énfasis en cumplimiento normativo (NOM-035, IMSS, STPS).',
    subprocesos: [
      {
        id: '4.1',
        nombre: 'Reclutamiento y Selección',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Asegurar que el talento que ingresa sea técnica y culturalmente apto.',
        grupos: [
          { id: '1.1', titulo: 'Definición de la Vacante', actividades: [
            { id: '1.1.1', nombre: 'Definición de Perfil y Descripción de Puesto', status: 'high' },
            { id: '1.1.2', nombre: 'Aprobación de la Vacante',                     status: 'high' },
            { id: '1.1.3', nombre: 'Estrategia y Canales de Búsqueda',             status: 'high' },
            { id: '1.1.4', nombre: 'Publicación de Oferta',                        status: 'high' },
            { id: '1.1.5', nombre: 'Recepción y Filtro Curricular',                status: 'high' },
          ]},
          { id: '1.2', titulo: 'Proceso de Selección', actividades: [
            { id: '1.2.1', nombre: 'Entrevista Inicial (RRHH)',                    status: 'high' },
            { id: '1.2.2', nombre: 'Pruebas Técnicas y Psicométricas',             status: 'high' },
            { id: '1.2.3', nombre: 'Entrevista con el Jefe Directo',               status: 'high' },
            { id: '1.2.4', nombre: 'Verificación de Referencias Laborales',        status: 'high' },
            { id: '1.2.5', nombre: 'Examen Médico / Polígrafo (si aplica)',        status: 'high' },
          ]},
          { id: '1.3', titulo: 'Contratación e Inducción', actividades: [
            { id: '1.3.1', nombre: 'Oferta Formal al Candidato',                   status: 'high' },
            { id: '1.3.2', nombre: 'Recolección de Documentos',                    status: 'high' },
            { id: '1.3.3', nombre: 'Elaboración y Firma de Contrato',              status: 'high' },
            { id: '1.3.4', nombre: 'Inducción y Onboarding',                       status: 'high' },
            { id: '1.3.5', nombre: 'Seguimiento Post-Contratación (30-90 días)',   status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Falta de Onboarding Formal',
            desc: 'Riesgo de una curva de aprendizaje prolongada y errores operativos críticos en los primeros días por personal que entra "directo a operar" sin conocer normas y procesos.',
            plan: [
              [
                'Auditar últimas 5 contrataciones: tiempo a productividad y errores en primeros 30 días',
                'Mapear conocimiento crítico que debe transferirse en primera semana',
                'Definir plan de onboarding por nivel (operativo / técnico / administrativo)',
                'Asignar responsable de onboarding (HR + buddy en el área)',
              ],
              [
                'Construir Manual de Onboarding institucional (PDF + videos)',
                'Implementar checklist de onboarding firmado por el nuevo colaborador',
                'Programa de "buddy" durante primeros 30 días por área',
                'Reunión formal a los 30, 60 y 90 días con HR + jefe directo',
              ],
              [
                'Reducir tiempo a productividad > 30% vs baseline',
                'Tasa de retención del nuevo personal a 90 días > 90%',
                'NPS del nuevo colaborador sobre el onboarding',
                'Reporte mensual de onboarding al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Contratación Reactiva por Urgencia',
            desc: 'Riesgo de omitir pruebas psicométricas o técnicas por la presión de cubrir vacantes operativas, resultando en personal que no cumple con el perfil de seguridad o calidad.',
            plan: [
              [
                'Auditar últimas 10 contrataciones de urgencia: % que renunció o falló',
                'Mapear vacantes recurrentes y construir banco de candidatos pre-calificados',
                'Definir SLA mínimo de proceso de selección (no menos de 5 días)',
                'Establecer "pruebas obligatorias" que no se pueden saltar',
              ],
              [
                'Implementar banco de talento pre-calificado para roles operativos',
                'Acuerdo con consultora de RH para arranque rápido cuando se requiera',
                'Capacitar a jefes directos en entrevista estructurada',
                'Política: ninguna contratación sin pruebas y referencias',
              ],
              [
                'Reducir rotación temprana (renuncias en primeros 90 días) > 50%',
                'Cumplimiento del proceso completo en 100% de contrataciones',
                'Métricas de calidad de contratación (desempeño a 6 meses)',
                'Reporte trimestral de RH al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '4.2',
        nombre: 'Capacitación y Desarrollo',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Mantener al equipo actualizado y certificado para las exigencias del mercado.',
        grupos: [
          { id: '2.1', titulo: 'Detección de Necesidades', actividades: [
            { id: '2.1.1', nombre: 'Análisis de Indicadores de Desempeño',         status: 'high' },
            { id: '2.1.2', nombre: 'Evaluación de Competencias (Gap Analysis)',    status: 'high' },
            { id: '2.1.3', nombre: 'Entrevistas y Encuestas al Personal',          status: 'high' },
            { id: '2.1.4', nombre: 'Elaboración del Plan Anual de Capacitación',   status: 'high' },
          ]},
          { id: '2.2', titulo: 'Ejecución y Evaluación', actividades: [
            { id: '2.2.1', nombre: 'Diseño y Contenido de Cursos',                 status: 'high' },
            { id: '2.2.2', nombre: 'Ejecución y Logística de la Capacitación',     status: 'high' },
            { id: '2.2.3', nombre: 'Evaluación de Reacción y Aprendizaje',         status: 'high' },
            { id: '2.2.4', nombre: 'Evaluación de Impacto en el Puesto',           status: 'high' },
          ]},
          { id: '2.3', titulo: 'Sucesión y Carrera', actividades: [
            { id: '2.3.1', nombre: 'Identificación de Puestos Clave y Talento',    status: 'high' },
            { id: '2.3.2', nombre: 'Desarrollo de Competencias de Liderazgo',      status: 'high' },
            { id: '2.3.3', nombre: 'Comunicación y Gestión de Expectativas',       status: 'high' },
            { id: '2.3.4', nombre: 'Plan de Sucesión Formal',                      status: 'high' },
            { id: '2.3.5', nombre: 'Revisión Anual del Plan',                      status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Capacitación Basada en "Bomberazos"',
            desc: 'Riesgo de invertir en cursos que no resuelven brechas reales por no realizar una Detección de Necesidades de Capacitación (DNC) sistemática.',
            plan: [
              [
                'Auditar capacitaciones del año pasado: costo vs impacto en desempeño',
                'Aplicar Gap Analysis de competencias críticas por puesto',
                'Encuesta breve a jefes directos: brechas que detectan en su equipo',
                'Priorizar top 5 brechas con mayor impacto en resultados',
              ],
              [
                'Construir Plan Anual de Capacitación basado en DNC + estrategia',
                'Negociar paquete con instituto técnico o universidad para cursos clave',
                'Implementar evaluación de impacto (no solo asistencia) por curso',
                'Asignar presupuesto formal anual de capacitación',
              ],
              [
                'Medir mejora en desempeño post-capacitación (vs baseline)',
                'Tasa de aplicación de aprendizajes en el puesto',
                'ROI de capacitación por curso (mejora vs inversión)',
                'Reporte semestral de capacitación al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Fuga de Conocimiento Crítico',
            desc: 'Riesgo de que el "know-how" técnico resida solo en personas específicas y no en manuales institucionales, dejando a la empresa vulnerable si el personal clave renuncia.',
            plan: [
              [
                'Identificar 5-10 personas con conocimiento técnico crítico',
                'Mapear el "know-how" único de cada una (procesos, contactos, técnicas)',
                'Priorizar conocimientos a documentar por urgencia de captura',
                'Definir formato estándar de documentación de conocimiento',
              ],
              [
                'Sesiones de captura de conocimiento (1h/semana con cada experto)',
                'Documentar procesos críticos con video + manual escrito',
                'Programa formal de "buddy" o sucesor en posiciones críticas',
                'Repositorio institucional accesible al equipo',
              ],
              [
                'Documentar 10 procesos críticos en formato institucional',
                'Realizar transferencia de conocimiento a 5 personas (back-ups)',
                'Auditoría: simular ausencia de persona crítica y validar continuidad',
                'Reporte trimestral de captura de conocimiento al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '4.3',
        nombre: 'Evaluación del Desempeño',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Incentivar la productividad y asegurar la equidad interna.',
        grupos: [
          { id: '3.1', titulo: 'Definición de Objetivos', actividades: [
            { id: '3.1.1', nombre: 'Alineación Estratégica de Objetivos',          status: 'low' },
            { id: '3.1.2', nombre: 'Definición de Indicadores SMART',              status: 'low' },
            { id: '3.1.3', nombre: 'Monitoreo Continuo de Avances',                status: 'low' },
            { id: '3.1.4', nombre: 'Documentación de Evidencias',                  status: 'low' },
          ]},
          { id: '3.2', titulo: 'Proceso de Evaluación', actividades: [
            { id: '3.2.1', nombre: 'Autoevaluación del Empleado',                  status: 'low' },
            { id: '3.2.2', nombre: 'Evaluación 360° (si aplica)',                  status: 'low' },
            { id: '3.2.3', nombre: 'Reunión Formal de Retroalimentación',          status: 'low' },
            { id: '3.2.4', nombre: 'Calibración de Resultados',                    status: 'low' },
            { id: '3.2.5', nombre: 'Vinculación con Compensación y Desarrollo',    status: 'low' },
          ]},
          { id: '3.3', titulo: 'Gestión del Bajo Desempeño', actividades: [
            { id: '3.3.1', nombre: 'Identificación Oportuna y Documentación',      status: 'low' },
            { id: '3.3.2', nombre: 'Definición de un Plan de Mejora',              status: 'low' },
            { id: '3.3.3', nombre: 'Seguimiento Estricto al Plan',                 status: 'low' },
            { id: '3.3.4', nombre: 'Toma de Decisiones y Cierre',                  status: 'low' },
            { id: '3.3.5', nombre: 'Análisis de Causas Raíz',                      status: 'low' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Subjetividad en Ascensos y Bonos',
            desc: 'Riesgo de desmotivación y rotación del personal de alto desempeño al percibir que las recompensas se dan por "percepción" y no por indicadores objetivos.',
            plan: [
              [
                'Auditar ascensos y bonos del último año: % con justificación documentada',
                'Definir KPIs individuales por puesto vinculados a resultados de negocio',
                'Construir política de compensación variable con criterios cuantificables',
                'Sesión de calibración entre líderes para evitar sesgos',
              ],
              [
                'Implementar sistema de gestión de desempeño con KPIs medibles',
                'Reuniones trimestrales de revisión 1-a-1 con cada colaborador',
                'Capacitar a líderes en feedback efectivo y conversaciones difíciles',
                'Vincular bono variable a logro de KPIs (mín 40% del bono)',
              ],
              [
                'Aplicar primera evaluación formal con nuevo sistema',
                'Encuesta de percepción de justicia post-evaluación (target > 80%)',
                'Medir retención de top performers',
                'Reporte semestral al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Desalineación de Objetivos Individuales',
            desc: 'Riesgo de que el personal trabaje sin entender cómo su desempeño impacta en la rentabilidad de los proyectos, diluyendo el sentido de responsabilidad.',
            plan: [
              [
                'Mapear cómo cada puesto contribuye a los objetivos estratégicos',
                'Definir 3-5 KPIs por puesto alineados a OKRs de la empresa',
                'Diseñar formato de Acuerdo de Desempeño individual',
                'Capacitar líderes en cascadeo de objetivos',
              ],
              [
                'Sesión 1-a-1 con cada colaborador para fijar Acuerdo de Desempeño anual',
                'Implementar dashboard personal de KPIs accesible al colaborador',
                'Revisión trimestral de progreso con feedback formal',
                'Comunicación regular del impacto de cada área en resultados globales',
              ],
              [
                '100% de colaboradores con KPIs personales documentados',
                'Encuesta de claridad de propósito (target > 85%)',
                'Correlación entre logro de KPIs individuales y resultados de área',
                'Reporte anual de alineamiento al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '4.4',
        nombre: 'Compensación y Nómina',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Garantizar equidad interna y competitividad externa de la compensación.',
        grupos: [
          { id: '4.1', titulo: 'Estructura Salarial', actividades: [
            { id: '4.1.1', nombre: 'Análisis y Valoración de Puestos',             status: 'low' },
            { id: '4.1.2', nombre: 'Estudios de Mercado Salarial',                 status: 'low' },
            { id: '4.1.3', nombre: 'Definición de Políticas Salariales',           status: 'low' },
            { id: '4.1.4', nombre: 'Revisión y Aprobación de Ajustes',             status: 'low' },
          ]},
          { id: '4.2', titulo: 'Compensación Total', actividades: [
            { id: '4.2.1', nombre: 'Diseño de Paquetes de Beneficios',             status: 'low' },
            { id: '4.2.2', nombre: 'Programas de Compensación Emocional',          status: 'low' },
            { id: '4.2.3', nombre: 'Administración de Incentivos Variables',       status: 'low' },
          ]},
          { id: '4.3', titulo: 'Administración de Nómina', actividades: [
            { id: '4.3.1', nombre: 'Captura y Cálculo de Incidencias',             status: 'low' },
            { id: '4.3.2', nombre: 'Proceso de Nómina y Dispersión',               status: 'low' },
            { id: '4.3.3', nombre: 'Emisión de Recibos y Timbrado',                status: 'low' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Tabuladores Inexistentes',
            desc: 'Carecer de rangos salariales mínimos y máximos por nivel jerárquico, lo que descontrola el presupuesto de nómina y genera inequidad interna.',
            plan: [
              [
                'Inventario de puestos actuales con sueldo y antigüedad',
                'Contratar benchmark salarial sectorial (Hays, Mercer)',
                'Mapear inequidades internas evidentes (mismo puesto, distinto sueldo)',
                'Definir niveles jerárquicos formales (mín 5 niveles)',
              ],
              [
                'Construir Tabulador Salarial con rangos por nivel y banda',
                'Política de incrementos basada en mérito + mercado',
                'Plan de ajuste de inequidades en 12 meses (fased)',
                'Comunicar política a líderes (no a colaboradores aún)',
              ],
              [
                'Aplicar primera ronda de ajustes salariales bajo nuevo tabulador',
                'Métricas de equidad interna (% dentro de banda por nivel)',
                'Comparación anual de tabulador vs mercado',
                'Reporte de compensación al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Incentivos que Premian Cantidad sobre Calidad/Seguridad',
            desc: 'Premiar la rapidez en la entrega ignorando fallas técnicas o falta de seguridad (QHSE), incentivando conductas riesgosas.',
            plan: [
              [
                'Auditar política actual de incentivos: qué métricas se premian',
                'Identificar comportamientos riesgosos incentivados implícitamente',
                'Definir mix balanceado de KPIs (volumen + calidad + seguridad)',
                'Validar con líderes operativos la nueva estructura',
              ],
              [
                'Rediseñar fórmula de bono variable: 50% volumen, 30% calidad, 20% QHSE',
                'Comunicar nuevos criterios a todo el equipo operativo',
                'Capacitar líderes en feedback equilibrado',
                'Tracking mensual de los 3 ejes por colaborador',
              ],
              [
                'Aplicar primer bono con nueva fórmula',
                'Métricas de calidad y QHSE mejoran sin caer volumen',
                'Encuesta de percepción del nuevo esquema',
                'Refinamiento basado en aprendizajes del primer trimestre',
              ],
            ],
          },
        ],
      },
      {
        id: '4.5',
        nombre: 'Clima Laboral y Salida',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Blindar a la empresa ante riesgos jurídicos y mantener la paz laboral.',
        grupos: [
          { id: '5.1', titulo: 'Seguridad y Bienestar', actividades: [
            { id: '5.1.1', nombre: 'Programas de Seguridad e Higiene (NOMs)',      status: 'low' },
            { id: '5.1.2', nombre: 'Atención al Riesgo Psicosocial (NOM-035)',     status: 'low' },
            { id: '5.1.3', nombre: 'Programas de Bienestar y Salud',               status: 'low' },
          ]},
          { id: '5.2', titulo: 'Clima Organizacional', actividades: [
            { id: '5.2.1', nombre: 'Medición de Clima Laboral',                    status: 'low' },
            { id: '5.2.2', nombre: 'Planes de Acción y Seguimiento',               status: 'low' },
            { id: '5.2.3', nombre: 'Comunicación Interna Efectiva',                status: 'low' },
            { id: '5.2.4', nombre: 'Código de Conducta y Ética',                   status: 'low' },
          ]},
          { id: '5.3', titulo: 'Gestión de Salida', actividades: [
            { id: '5.3.1', nombre: 'Entrevista de Salida (Exit Interview)',        status: 'low' },
            { id: '5.3.2', nombre: 'Cálculo y Finiquito',                          status: 'low' },
            { id: '5.3.3', nombre: 'Baja y Documentación Legal',                   status: 'low' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Incumplimiento de Normas de Seguridad (QHSE)',
            desc: 'Riesgo de accidentes graves y responsabilidad solidaria ante el IMSS por falta de supervisión en uso de EPP y certificaciones de seguridad industrial del personal.',
            plan: [
              [
                'Auditar cumplimiento actual de NOMs aplicables (NOM-035, NOM-030)',
                'Inventariar certificaciones DC-3 vigentes vs requeridas por puesto',
                'Identificar brechas de EPP y capacitación en seguridad',
                'Contratar consultor especializado en seguridad industrial',
              ],
              [
                'Plan formal de cumplimiento normativo con calendario',
                'Programa anual de capacitación en seguridad con certificación DC-3',
                'Formación de brigadas de emergencia (mín 10% del personal)',
                'Simulacros periódicos según NOM aplicable',
              ],
              [
                'Cumplimiento 100% de capacitaciones obligatorias',
                'Documentación auditable lista para revisión STPS/IMSS',
                'Cero observaciones críticas en auditoría interna QHSE',
                'Reporte trimestral de cumplimiento al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Cultura de Reacción ante Conflictos',
            desc: 'Riesgo de un clima laboral tóxico que afecte la productividad por no tener canales institucionales de quejas o resolución de conflictos internos.',
            plan: [
              [
                'Aplicar encuesta de clima laboral (diagnóstico baseline)',
                'Mapear conflictos conocidos del último año y su escalación',
                'Definir canal formal de denuncias (email + buzón anónimo)',
                'Capacitar a 2-3 mediadores internos (HR + 1 líder confiable)',
              ],
              [
                'Lanzar canal de denuncias con política clara (no represalias)',
                'Protocolo formal de gestión de denuncias con tiempos de respuesta',
                'Sesiones de comunicación: "cómo usar el canal y qué esperar"',
                'Capacitación a líderes en manejo de conflictos',
              ],
              [
                'Medir uso del canal (debería haber casos, eso es buena señal)',
                'Encuesta de seguimiento: percepción de seguridad psicológica',
                'Reducir denuncias informales/rumores no documentados',
                'Reporte trimestral de clima al Comité Directivo',
              ],
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================
  // M05 · FINANZAS Y CONTROL PATRIMONIAL
  // ===========================================================
  {
    id: 'm05',
    code: 'M05',
    nombre: 'Gestión Financiera y Control Patrimonial',
    nombreCorto: 'Finanzas',
    score: 2.0,
    criticidad: 'critical',
    riesgosTotal: 10,
    statusGlobal: 'Implementado con muchas oportunidades de mejora',
    descripcion: 'Administración integral del flujo, presupuesto, control interno y gestión de riesgos para proteger el patrimonio del negocio.',
    subprocesos: [
      {
        id: '5.1',
        nombre: 'Contabilidad y Cumplimiento Fiscal',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Garantizar la razonabilidad de las cifras financieras y el blindaje ante autoridades fiscales.',
        grupos: [
          { id: '1.1', titulo: 'Cierre Contable Mensual', actividades: [
            { id: '1.1.1', nombre: 'Checklist de Actividades de Cierre',           status: 'high' },
            { id: '1.1.2', nombre: 'Corte de Documentación',                       status: 'high' },
            { id: '1.1.3', nombre: 'Ajustes y Provisiones',                        status: 'high' },
            { id: '1.1.4', nombre: 'Emisión de Estados Financieros',               status: 'high' },
          ]},
          { id: '1.2', titulo: 'Conciliaciones', actividades: [
            { id: '1.2.1', nombre: 'Conciliación Bancaria Diaria/Mensual',         status: 'high' },
            { id: '1.2.2', nombre: 'Circularización Clientes/Proveedores',         status: 'high' },
            { id: '1.2.3', nombre: 'Depuración de Partidas Antiguas',              status: 'high' },
            { id: '1.2.4', nombre: 'Conciliación de Inventarios y Activos',        status: 'critical' },
          ]},
          { id: '1.3', titulo: 'Obligaciones Fiscales', actividades: [
            { id: '1.3.1', nombre: 'Determinación de Impuestos (IVA, ISR)',        status: 'high' },
            { id: '1.3.2', nombre: 'Opinión de Cumplimiento',                      status: 'high' },
            { id: '1.3.3', nombre: 'Conciliación Visor SAT vs Contabilidad',       status: 'high' },
            { id: '1.3.4', nombre: 'Resguardo y Auditoría de XML/PDF',             status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Inconsistencia en la Integración de Libros',
            desc: 'Riesgo de discrepancias entre los módulos auxiliares (ventas/compras) y el libro mayor, dificultando la trazabilidad de las operaciones en caso de auditoría fiscal.',
            plan: [
              [
                'Auditar conciliación auxiliares vs mayor último cierre: cuantificar discrepancias',
                'Mapear causas raíz (asientos manuales, módulos desconectados, error de captura)',
                'Definir matriz de validaciones obligatorias en cierre mensual',
                'Asignar responsable de integración auxiliares (no operador de capturas)',
              ],
              [
                'Implementar checklist de cierre con validaciones automáticas en ERP',
                'Establecer corte oficial mensual: día 5 hábil, sin excepciones',
                'Capacitar contadores en uso correcto de módulos vs registros manuales',
                'Bitácora de ajustes con justificación documentada',
              ],
              [
                'Cierres mensuales con discrepancia auxiliares-mayor < 0.5%',
                'Tiempo de cierre reducido a 5 días hábiles',
                'Auditoría interna trimestral del proceso de cierre',
                'Reporte de cierres al Comité Directivo con métricas de calidad',
              ],
            ],
          },
          {
            nombre: 'Diferencias en Inventarios vs Contabilidad',
            desc: 'Riesgo de discrepancias entre la existencia física de herramientas/materiales y el registro contable, ocultando mermas, daños o robos hormiga.',
            plan: [
              [
                'Conteo físico completo de inventarios y comparación con sistema',
                'Cuantificar discrepancia actual en MXN (baseline)',
                'Identificar familias con mayor desviación (top 3)',
                'Definir frecuencia de inventarios cíclicos por categoría ABC',
              ],
              [
                'Implementar inventarios cíclicos rotativos (semanales) ABC',
                'Conciliación obligatoria mensual física vs contable',
                'Protocolo de investigación de discrepancias > umbral',
                'Capacitar almacenistas y contabilidad en proceso conjunto',
              ],
              [
                'Reducir discrepancia inventario físico-contable < 2%',
                'Identificar y dar de baja inventario obsoleto o dañado',
                'Bitácora de mermas con análisis de causa raíz',
                'Reporte trimestral de inventarios al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '5.2',
        nombre: 'Tesorería y Flujo de Efectivo',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Optimizar la liquidez y asegurar la disponibilidad de efectivo para la continuidad operativa.',
        grupos: [
          { id: '2.1', titulo: 'Planeación del Flujo', actividades: [
            { id: '2.1.1', nombre: 'Elaboración del Flujo de Caja Semanal',        status: 'high' },
            { id: '2.1.2', nombre: 'Análisis de Antigüedad de Saldos',             status: 'high' },
            { id: '2.1.3', nombre: 'Escenarios de Sensibilidad (Plan B)',          status: 'high' },
            { id: '2.1.4', nombre: 'Conciliación de Pronóstico vs Real',           status: 'high' },
          ]},
          { id: '2.2', titulo: 'Gestión de Pagos', actividades: [
            { id: '2.2.1', nombre: 'Calendario Institucional de Pagos',            status: 'high' },
            { id: '2.2.2', nombre: 'Priorización de Pagos Críticos',               status: 'high' },
            { id: '2.2.3', nombre: 'Protocolo de Validación y Autorización',       status: 'high' },
            { id: '2.2.4', nombre: 'Ejecución y Confirmación de Transferencias',   status: 'high' },
          ]},
          { id: '2.3', titulo: 'Administración Bancaria', actividades: [
            { id: '2.3.1', nombre: 'Control de Saldos y Arqueos Diarios',          status: 'high' },
            { id: '2.3.2', nombre: 'Administración de Inversiones Corto Plazo',    status: 'high' },
            { id: '2.3.3', nombre: 'Gestión de Facultades y Poderes Bancarios',    status: 'high' },
            { id: '2.3.4', nombre: 'Negociación de Condiciones Bancarias',         status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Crisis de Liquidez por Mala Estimación',
            desc: 'Riesgo de insolvencia técnica al no anticipar semanas de alta dispersión (nómina, aguinaldos) frente a ciclos de cobranza lentos o retrasos de clientes clave.',
            plan: [
              [
                'Construir Flujo de Caja semanal con visibilidad a 13 semanas',
                'Mapear todas las salidas fijas (nómina, IMSS, impuestos, aguinaldos)',
                'Identificar concentración de cobros vs concentración de pagos',
                'Definir saldo mínimo de operación (mín 30 días de gastos fijos)',
              ],
              [
                'Implementar herramienta de cash flow forecast con actualización semanal',
                'Reunión semanal de Tesorería + Cobranza para validar entradas esperadas',
                'Líneas de crédito revolvente pre-aprobadas para cubrir gaps',
                'Capacitar contralor en lectura de cash flow proyectado',
              ],
              [
                'Cero eventos de insolvencia técnica en el trimestre',
                'Desviación pronóstico vs real < 10% semanal',
                'Reporte semanal de cash flow al DG y Comité Directivo',
                'Plan de contingencia para escenarios de stress (3 escenarios)',
              ],
            ],
          },
          {
            nombre: 'Desconocimiento del Ciclo de Conversión de Efectivo',
            desc: 'Riesgo de financiar la operación de forma ineficiente por no alinear los plazos de pago a proveedores con los plazos de recuperación de cartera.',
            plan: [
              [
                'Calcular Ciclo de Conversión de Efectivo (DSO + DIO – DPO) actual',
                'Comparar con benchmark del sector',
                'Mapear top 10 clientes por antigüedad de saldo',
                'Mapear top 10 proveedores por plazo de crédito',
              ],
              [
                'Negociar extensión de crédito con top 5 proveedores (target +15 días)',
                'Implementar incentivos por pronto pago de clientes (descuento 1-2%)',
                'Política de anticipos en proyectos > $500k (mín 30%)',
                'Capacitar tesorería en análisis de capital de trabajo',
              ],
              [
                'Reducir Ciclo de Conversión > 15 días',
                'DSO reducido vs baseline',
                'Liberación de capital de trabajo medible en MXN',
                'Reporte mensual de working capital al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '5.3',
        nombre: 'Presupuesto y Análisis de Costos',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Controlar la rentabilidad y asegurar que cada proyecto contribuya al crecimiento estratégico.',
        grupos: [
          { id: '3.1', titulo: 'Elaboración del Presupuesto', actividades: [
            { id: '3.1.1', nombre: 'Definición de Premisas Macroeconómicas',       status: 'high' },
            { id: '3.1.2', nombre: 'Recolección de Necesidades Departamentales',   status: 'high' },
            { id: '3.1.3', nombre: 'Negociación y Ajuste de Partidas',             status: 'high' },
            { id: '3.1.4', nombre: 'Aprobación del Presupuesto Maestro',           status: 'high' },
          ]},
          { id: '3.2', titulo: 'Control Presupuestal', actividades: [
            { id: '3.2.1', nombre: 'Reporte Mensual de Comparativa',               status: 'critical' },
            { id: '3.2.2', nombre: 'Identificación de Desviaciones Significativas', status: 'critical' },
            { id: '3.2.3', nombre: 'Juntas de Revisión de Resultados',             status: 'critical' },
            { id: '3.2.4', nombre: 'Pronóstico de Cierre (Forecast)',              status: 'critical' },
          ]},
          { id: '3.3', titulo: 'Análisis de Costos y Rentabilidad', actividades: [
            { id: '3.3.1', nombre: 'Cálculo del Costo Unitario/Proyecto',          status: 'high' },
            { id: '3.3.2', nombre: 'Determinación del Margen de Contribución',     status: 'high' },
            { id: '3.3.3', nombre: 'Análisis de Punto de Equilibrio',              status: 'high' },
            { id: '3.3.4', nombre: 'Monitoreo de Indicadores de Rentabilidad',     status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Operación Bajo Gasto Ciego',
            desc: 'Riesgo de crecimiento desordenado de los costos fijos por no tener un techo presupuestal asignado y autorizado para cada departamento.',
            plan: [
              [
                'Análisis de gastos último año por área y categoría',
                'Identificar gastos no estratégicos y oportunidades de reducción inmediata',
                'Definir techo presupuestal por área basado en histórico + ajuste',
                'Validar techos con líderes de área (negociación bottom-up)',
              ],
              [
                'Política de autorización de gasto por monto y nivel jerárquico',
                'Implementar control presupuestal en ERP con alertas automáticas',
                'Reporte mensual de plan vs real por área (visible a líderes)',
                'Capacitar líderes en lectura de su P&L y control de gasto',
              ],
              [
                'Cumplimiento de techos presupuestales > 95%',
                'Reducción de gasto no estratégico vs baseline',
                'Cultura de accountability presupuestal instalada',
                'Reporte mensual al Comité Directivo con semáforos por área',
              ],
            ],
          },
          {
            nombre: 'Falta de Accountability de Líderes',
            desc: 'Riesgo de que los responsables de proyecto no asuman el control del gasto al no existir un reporte mensual que los confronte con su presupuesto original.',
            plan: [
              [
                'Definir dashboard P&L mensual por área y por proyecto',
                'Asignar dueño formal del presupuesto por área (no Finanzas)',
                'Diseñar formato de revisión mensual de desempeño financiero',
                'Capacitar líderes en interpretación de su P&L',
              ],
              [
                'Implementar dashboard P&L con datos en tiempo real',
                'Sesiones mensuales 1-a-1 Finanzas con cada líder de área',
                'Comité mensual de Resultados con cada líder presentando su P&L',
                'KPIs personales atados a desempeño financiero del área',
              ],
              [
                '100% de líderes presentando su P&L mensualmente',
                'Mejora medible en desviación presupuestal por área',
                'Cultura de "los números son míos" instalada',
                'Reporte trimestral de desempeño por área al Comité',
              ],
            ],
          },
        ],
      },
      {
        id: '5.4',
        nombre: 'Control Interno y Auditoría',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Implementar candados administrativos para proteger el patrimonio y evitar malas prácticas.',
        grupos: [
          { id: '4.1', titulo: 'Control de Fondos Pequeños', actividades: [
            { id: '4.1.1', nombre: 'Ejecución de Arqueos Sorpresa',                status: 'high' },
            { id: '4.1.2', nombre: 'Validación de Comprobantes',                   status: 'high' },
            { id: '4.1.3', nombre: 'Establecimiento de Límites de Gasto',          status: 'high' },
            { id: '4.1.4', nombre: 'Protocolo de Reposición de Fondo',             status: 'high' },
          ]},
          { id: '4.2', titulo: 'Poderes y Autorizaciones', actividades: [
            { id: '4.2.1', nombre: 'Inventario de Poderes Legales',                status: 'high' },
            { id: '4.2.2', nombre: 'Matriz de Firmas Autorizadas Bancarias',       status: 'high' },
            { id: '4.2.3', nombre: 'Control de Niveles de Autorización',           status: 'critical' },
            { id: '4.2.4', nombre: 'Protocolo de Revocación Inmediata',            status: 'high' },
          ]},
          { id: '4.3', titulo: 'Auditoría Externa', actividades: [
            { id: '4.3.1', nombre: 'Contratación de Despacho Independiente',       status: 'high' },
            { id: '4.3.2', nombre: 'Preparación de Cédulas de Auditoría',          status: 'high' },
            { id: '4.3.3', nombre: 'Revisión de Dictamen Fiscal',                  status: 'high' },
            { id: '4.3.4', nombre: 'Implementación de Recomendaciones',            status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Concentración de Autoridad (Cuello de Botella)',
            desc: 'Riesgo de parálisis operativa porque solo el Director General puede autorizar pagos o contratos, retrasando la ejecución de proyectos.',
            plan: [
              [
                'Mapear todas las autorizaciones que pasan por el DG en último mes',
                'Identificar las que podrían delegarse por monto/tipo',
                'Diseñar Tabla de Facultades preliminar (3 niveles)',
                'Validar con DG la propuesta de delegación',
              ],
              [
                'Tabla de Facultades formal aprobada y publicada',
                'Configurar workflow de autorizaciones en ERP por monto',
                'Capacitar líderes en sus nuevos límites de autoridad',
                'Política de revocación inmediata si hay mal uso',
              ],
              [
                'Reducir > 50% las autorizaciones que escalan al DG',
                'Tiempo de respuesta de aprobaciones reducido medible',
                'Auditoría trimestral de cumplimiento de la Tabla',
                'Reporte de delegación efectiva al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Debilidad en el Sistema de Control Interno (SCI)',
            desc: 'Riesgo de que las fallas operativas se vuelvan sistémicas al no contar con una evaluación externa periódica que obligue a la mejora continua.',
            plan: [
              [
                'Diagnóstico baseline del SCI actual (autoaplicación COSO/Andersen)',
                'Priorizar 5 brechas más críticas identificadas',
                'Cotizar despacho de auditoría interna externalizada',
                'Definir plan anual de auditoría interna',
              ],
              [
                'Contratar auditor interno (interno o externo) con plan formal',
                'Primera auditoría: proceso financiero crítico',
                'Implementar recomendaciones del primer reporte',
                'Establecer Comité de Auditoría que reporte al Consejo',
              ],
              [
                'Ciclo anual de auditoría interna en marcha',
                'Hallazgos críticos reducidos vs auditoría anterior',
                'Score SCI mejorado en evaluación de seguimiento',
                'Reporte semestral de auditoría al Consejo',
              ],
            ],
          },
        ],
      },
      {
        id: '5.5',
        nombre: 'Gestión de Riesgos y Continuidad',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Anticipar y mitigar eventos que pongan en peligro la continuidad y reputación del negocio.',
        grupos: [
          { id: '5.1', titulo: 'Matriz de Riesgos Institucional', actividades: [
            { id: '5.1.1', nombre: 'Inventario de Riesgos por Proceso',            status: 'high' },
            { id: '5.1.2', nombre: 'Evaluación de Probabilidad e Impacto',         status: 'high' },
            { id: '5.1.3', nombre: 'Diseño de Controles Mitigantes',               status: 'high' },
            { id: '5.1.4', nombre: 'Monitoreo y Actualización del Mapa de Calor',  status: 'high' },
          ]},
          { id: '5.2', titulo: 'Continuidad del Negocio', actividades: [
            { id: '5.2.1', nombre: 'Análisis de Impacto al Negocio',               status: 'critical' },
            { id: '5.2.2', nombre: 'Protocolo de Recuperación de Desastres',       status: 'critical' },
            { id: '5.2.3', nombre: 'Definición de Equipos de Respuesta',           status: 'critical' },
            { id: '5.2.4', nombre: 'Pruebas de Estrés y Simulacros',               status: 'critical' },
          ]},
          { id: '5.3', titulo: 'Cumplimiento Regulatorio', actividades: [
            { id: '5.3.1', nombre: 'Vigilancia de Obligaciones de Ley',            status: 'high' },
            { id: '5.3.2', nombre: 'Prevención de Lavado de Dinero',               status: 'high' },
            { id: '5.3.3', nombre: 'Código de Ética y Canal de Denuncia',          status: 'high' },
            { id: '5.3.4', nombre: 'Auditorías de Cumplimiento',                   status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Cultura de Reacción Permanente',
            desc: 'Riesgo de operar bajo un esquema de "bomberazos" que impide la planeación estratégica y desgasta al equipo administrativo.',
            plan: [
              [
                'Auditar incidentes último trimestre: cuántos requirieron "bomberazo"',
                'Identificar causas raíz repetitivas que no se atacan',
                'Definir top 5 riesgos a institucionalizar primero',
                'Asignar dueño formal de cada riesgo crítico',
              ],
              [
                'Implementar Matriz de Riesgos viva (actualizada mensualmente)',
                'Reuniones mensuales de revisión de riesgos con líderes',
                'Plan de mitigación documentado por cada riesgo crítico',
                'Capacitar líderes en gestión proactiva de riesgos',
              ],
              [
                'Reducir incidencia de "bomberazos" > 40% en 90 días',
                'Tiempo del equipo administrativo en planeación vs reacción',
                'Maduración de cultura preventiva medible',
                'Reporte trimestral de riesgos al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Inexistencia de Protocolos de Gestión de Crisis',
            desc: 'Riesgo de una respuesta errática ante siniestros (incendio, robo de flota, accidentes graves) que escale el daño reputacional y financiero.',
            plan: [
              [
                'Identificar top 5 escenarios de crisis posibles (incendio, robo, accidente fatal)',
                'Análisis de Impacto al Negocio (BIA) por escenario',
                'Definir comité de crisis (DG + RH + Finanzas + Legal + PR)',
                'Mapear seguros vigentes vs cobertura requerida',
              ],
              [
                'Protocolo formal de gestión de crisis por escenario (playbooks)',
                'Cadena de comunicación (interna, externa, autoridades) definida',
                'Contactos clave: bomberos, seguros, abogados, autoridades',
                'Capacitar comité de crisis en uso de los playbooks',
              ],
              [
                'Simulacro de crisis ejecutado (incendio o accidente)',
                'Lecciones aprendidas + refinamiento de playbooks',
                'Pólizas de seguro alineadas a cobertura requerida',
                'Reporte semestral de continuidad al Comité Directivo',
              ],
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================
  // M06 · CALIDAD Y CUMPLIMIENTO NORMATIVO
  // ===========================================================
  {
    id: 'm06',
    code: 'M06',
    nombre: 'Gestión de Calidad y Cumplimiento Normativo',
    nombreCorto: 'Calidad',
    score: 3.0,
    criticidad: 'medium',
    riesgosTotal: 8,
    statusGlobal: 'Implementado con algunas oportunidades de mejora',
    descripcion: 'Sistema de gestión de calidad, normatividades QHSE y mejora continua. Base sólida documental que requiere ejecución activa.',
    subprocesos: [
      {
        id: '6.1',
        nombre: 'Política y Documentación de Calidad',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Establecer la base normativa interna para asegurar que el conocimiento sea institucional y no dependa de las personas.',
        grupos: [
          { id: '1.1', titulo: 'Planeación de Calidad', actividades: [
            { id: '1.1.1', nombre: 'Difusión y Mantenimiento de Política',         status: 'low' },
            { id: '1.1.2', nombre: 'Despliegue de Objetivos Estratégicos',         status: 'low' },
            { id: '1.1.3', nombre: 'Establecimiento de KPIs por Proceso',          status: 'high' },
            { id: '1.1.4', nombre: 'Comunicación y Difusión Institucional',        status: 'low' },
          ]},
          { id: '1.2', titulo: 'Control de Documentos', actividades: [
            { id: '1.2.1', nombre: 'Creación del Listado Maestro',                 status: 'low' },
            { id: '1.2.2', nombre: 'Protocolo de Elaboración, Revisión y Aprobación', status: 'low' },
            { id: '1.2.3', nombre: 'Gestión de Cambios y Versiones',               status: 'low' },
            { id: '1.2.4', nombre: 'Resguardo y Disponibilidad Digital',           status: 'low' },
          ]},
          { id: '1.3', titulo: 'Procesos y Procedimientos', actividades: [
            { id: '1.3.1', nombre: 'Mapeo de Procesos Críticos',                   status: 'low' },
            { id: '1.3.2', nombre: 'Redacción de Procedimientos Estándar',         status: 'low' },
            { id: '1.3.3', nombre: 'Diseño de Formatos de Registro',               status: 'low' },
            { id: '1.3.4', nombre: 'Validación en Campo de la Documentación',      status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Normatividades Documentadas pero no Ejecutadas',
            desc: 'Sesgo entre lo que dicen los manuales y lo que se realiza en campo. No se respetan los manuales: cultura documental y no de gestión.',
            plan: [
              [
                'Auditar 3 procesos críticos: comparar manual vs ejecución real',
                'Identificar gaps específicos entre lo documentado y la práctica',
                'Entrevistas con personal operativo: por qué no se sigue el manual',
                'Priorizar top 5 procesos donde el gap genera más impacto',
              ],
              [
                'Rediseñar 5 procesos con base en la práctica real (simplificación)',
                'Capacitar al personal operativo en el "nuevo" estándar simplificado',
                'Implementar auditoría sorpresa de cumplimiento de manual',
                'Vincular cumplimiento al desempeño individual',
              ],
              [
                'Cumplimiento de manual > 90% (auditado mensualmente)',
                'Cultura de "ejecutar lo documentado" vs "documentar lo ejecutado"',
                'Reducir hallazgos de auditoría por no cumplimiento',
                'Reporte mensual de cumplimiento al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'KPIs no Enfocados a Riesgos Financieros/Estratégicos',
            desc: 'Riesgos documentados en la matriz pero limitados a control y cumplimiento. No se mencionan riesgos financieros, estratégicos o de productividad.',
            plan: [
              [
                'Auditar matriz de riesgos actual: categorías cubiertas vs faltantes',
                'Identificar top 10 riesgos financieros y estratégicos no mapeados',
                'Definir taxonomía completa de riesgos (operativos / financieros / estratégicos)',
                'Asignar dueños por categoría de riesgo',
              ],
              [
                'Ampliar matriz de riesgos con categorías faltantes',
                'Definir KPIs específicos por categoría de riesgo',
                'Implementar dashboard ejecutivo de KPIs por categoría',
                'Sesión de capacitación a líderes en lectura de KPIs',
              ],
              [
                'Matriz integral cubriendo 4 categorías de riesgo mínimo',
                'KPIs por categoría reportados mensualmente',
                'Decisiones directivas basadas en KPIs (no en intuición)',
                'Reporte trimestral de riesgos integrales al Comité',
              ],
            ],
          },
        ],
      },
      {
        id: '6.2',
        nombre: 'QHSE y Gestión Ambiental',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Blindar a la empresa ante riesgos de accidentes laborales, contingencias ambientales y sanciones de autoridades (STPS/IMSS).',
        grupos: [
          { id: '2.1', titulo: 'Seguridad y Salud Ocupacional', actividades: [
            { id: '2.1.1', nombre: 'Matriz de Riesgos por Puesto',                 status: 'low' },
            { id: '2.1.2', nombre: 'Análisis de Riesgos por Tarea',                status: 'low' },
            { id: '2.1.3', nombre: 'Determinación y Entrega de EPP',               status: 'low' },
            { id: '2.1.4', nombre: 'Monitoreo de Salud Ocupacional',               status: 'low' },
          ]},
          { id: '2.2', titulo: 'Capacitación en Seguridad', actividades: [
            { id: '2.2.1', nombre: 'Plan Anual de Capacitación en Seguridad',      status: 'low' },
            { id: '2.2.2', nombre: 'Formación de Brigadas de Emergencia',          status: 'high' },
            { id: '2.2.3', nombre: 'Calendario de Simulacros',                     status: 'high' },
            { id: '2.2.4', nombre: 'Inducción a Visitas y Contratistas',           status: 'low' },
          ]},
          { id: '2.3', titulo: 'Gestión Ambiental', actividades: [
            { id: '2.3.1', nombre: 'Identificación de Aspectos e Impactos',        status: 'low' },
            { id: '2.3.2', nombre: 'Plan de Manejo de Residuos',                   status: 'low' },
            { id: '2.3.3', nombre: 'Protocolo de Respuesta a Derrames',            status: 'low' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Materialización de Accidentes Graves por Omisión',
            desc: 'Riesgo de lesiones incapacitantes o fatales del personal operativo por una deficiente identificación de peligros y evaluación de riesgos en sitio, especialmente en trabajos de alto riesgo (alturas, electricidad).',
            plan: [
              [
                'Auditar 5 obras activas: cumplimiento de identificación de peligros y EPP',
                'Mapear top 10 tareas de alto riesgo y su Análisis de Riesgos por Tarea (ART)',
                'Inventariar EPP actual vs requerido por tipo de obra',
                'Identificar gaps de capacitación en trabajos de alto riesgo',
              ],
              [
                'ART actualizado y socializado para top 10 tareas críticas',
                'Capacitación obligatoria en alturas, eléctrico, espacios confinados',
                'Implementar permiso de trabajo (PTW) para tareas de alto riesgo',
                'Supervisor de seguridad presente en obras críticas',
              ],
              [
                'Cero accidentes incapacitantes en el trimestre',
                'Cumplimiento de PTW > 95% en obras críticas',
                'Reducción de "casi-accidentes" reportados (mejor cultura)',
                'Reporte mensual QHSE al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Responsabilidad Solidaria por Capacitación DC-3 Vencida',
            desc: 'Riesgo de sanciones económicas severas ante el IMSS o la STPS por falta de un programa de capacitación efectivo y brigadas de emergencia sin certificaciones vigentes (DC-3).',
            plan: [
              [
                'Inventario de DC-3 vigentes vs requeridas por puesto',
                'Identificar caducidades en próximos 90 días (urgencia)',
                'Cotizar instituto autorizado para certificaciones masivas',
                'Definir presupuesto anual de capacitación certificada',
              ],
              [
                'Programa de capacitación con instituto autorizado',
                'Calendario de simulacros (incendio, evacuación, primeros auxilios)',
                'Brigadas de emergencia conformadas y capacitadas',
                'Expediente DC-3 por colaborador (físico + digital)',
              ],
              [
                '100% de personal con DC-3 vigentes',
                'Brigadas certificadas operativas',
                'Cero observaciones STPS en visita',
                'Reporte semestral de cumplimiento al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '6.3',
        nombre: 'Calibración y Control de Calidad',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Garantizar que la entrega de valor cumpla con las especificaciones técnicas contratadas para evitar costos de retrabajo.',
        grupos: [
          { id: '3.1', titulo: 'Inspección y Pruebas', actividades: [
            { id: '3.1.1', nombre: 'Plan de Inspección y Muestreo',                status: 'low' },
            { id: '3.1.2', nombre: 'Inspección de Recibo',                         status: 'low' },
            { id: '3.1.3', nombre: 'Inspección en Proceso',                        status: 'high' },
            { id: '3.1.4', nombre: 'Inspección Final y Liberación',                status: 'low' },
          ]},
          { id: '3.2', titulo: 'Calibración de Equipos', actividades: [
            { id: '3.2.1', nombre: 'Inventario de Equipos de Medición',            status: 'low' },
            { id: '3.2.2', nombre: 'Programa Anual de Calibración',                status: 'high' },
            { id: '3.2.3', nombre: 'Verificación Intermedia',                      status: 'low' },
            { id: '3.2.4', nombre: 'Identificación del Estado de Calibración',     status: 'low' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Invalidez de Pruebas por Equipos No Calibrados',
            desc: 'Riesgo de que las mediciones y certificaciones entregadas al cliente sean rechazadas por uso de equipos de medición sin un programa de calibración vigente, comprometiendo la validez técnica de la obra.',
            plan: [
              [
                'Inventario físico de instrumentos de medición y pruebas',
                'Identificar fecha de última calibración por cada instrumento',
                'Contratar laboratorio acreditado EMA para calibración',
                'Definir frecuencia de calibración por tipo de instrumento',
              ],
              [
                'Programa anual de calibración con calendario formal',
                'Etiquetado físico con QR para consultar vigencia',
                'Bitácora digital de calibración y verificación intermedia',
                'Bloqueo de uso de instrumentos fuera de calibración',
              ],
              [
                '100% de instrumentos críticos al día',
                'Cero certificaciones rechazadas por instrumentos no aptos',
                'Auditoría interna trimestral de cumplimiento',
                'Reporte mensual de calibración al Comité',
              ],
            ],
          },
          {
            nombre: 'Incremento de Costos por Retrabajos',
            desc: 'Riesgo de mermas financieras y retrasos en cronograma al no detectar desviaciones de calidad de manera oportuna, obligando a correcciones costosas una vez finalizado el servicio.',
            plan: [
              [
                'Cuantificar costo de retrabajos últimos 12 meses (baseline)',
                'Identificar top 5 procesos donde ocurren más retrabajos',
                'Mapear hold points (puntos de inspección obligatorios)',
                'Definir métricas: tasa de no conformidad por proceso',
              ],
              [
                'Implementar inspección en proceso obligatoria en hold points',
                'Capacitar inspectores en uso de criterios objetivos',
                'Sistema de tickets de no conformidad con seguimiento',
                'Análisis de causa raíz por cada retrabajo recurrente',
              ],
              [
                'Reducir costo de retrabajos > 40% en 90 días',
                'Tasa de no conformidad por proceso reducida',
                'Inspecciones en proceso cumplidas > 95%',
                'Reporte mensual de costos de no calidad al Comité',
              ],
            ],
          },
        ],
      },
      {
        id: '6.4',
        nombre: 'Auditoría Interna y Mejora Continua',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Implementar ciclos de aprendizaje que permitan corregir fallas de raíz y elevar el nivel de madurez de la empresa.',
        grupos: [
          { id: '4.1', titulo: 'Auditoría Interna del SGC', actividades: [
            { id: '4.1.1', nombre: 'Programa Anual de Auditoría',                  status: 'low' },
            { id: '4.1.2', nombre: 'Formación de Auditores Internos',              status: 'low' },
            { id: '4.1.3', nombre: 'Ejecución de Auditorías Basadas en Procesos',  status: 'low' },
            { id: '4.1.4', nombre: 'Informe de Hallazgos y Seguimiento',           status: 'low' },
          ]},
          { id: '4.2', titulo: 'No Conformidades y Acciones Correctivas', actividades: [
            { id: '4.2.1', nombre: 'Identificación y Segregación',                 status: 'low' },
            { id: '4.2.2', nombre: 'Disposición de la No Conformidad',             status: 'low' },
            { id: '4.2.3', nombre: 'Metodología de Análisis de Causa Raíz',        status: 'high' },
            { id: '4.2.4', nombre: 'Implementación y Verificación de Eficacia',    status: 'low' },
          ]},
          { id: '4.3', titulo: 'Revisión por la Dirección', actividades: [
            { id: '4.3.1', nombre: 'Preparación de la Entrada de Información',     status: 'low' },
            { id: '4.3.2', nombre: 'Sesión de Revisión Directiva',                 status: 'high' },
            { id: '4.3.3', nombre: 'Asignación de Recursos para la Mejora',        status: 'low' },
            { id: '4.3.4', nombre: 'Minuta de Compromisos Operativos',             status: 'low' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Recurrencia de Fallas por Análisis de Causa Raíz Deficiente',
            desc: 'Riesgo de repetir los mismos errores operativos al tratar los servicios no conformes solo como "emergencias", sin aplicar acciones correctivas basadas en análisis de causa raíz institucionalizado.',
            plan: [
              [
                'Auditar últimas 20 no conformidades: cuántas se repiten',
                'Identificar top 5 fallas recurrentes en último año',
                'Capacitar equipo en metodologías (5 Por Qués, Ishikawa, A3)',
                'Designar facilitador interno de análisis causa raíz',
              ],
              [
                'Implementar plantilla obligatoria de causa raíz para no conformidades críticas',
                'Sesiones quincenales de análisis con líderes operativos',
                'Plan de acción con responsables y fechas por cada análisis',
                'Verificación de eficacia a los 60 días',
              ],
              [
                'Reducir recurrencia de fallas > 50% en 90 días',
                'Métricas de cumplimiento de acciones correctivas > 90%',
                'Análisis de tendencias trimestral por categoría',
                'Reporte de mejora continua al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Desalineación Estratégica de la Calidad',
            desc: 'Riesgo de que el Sistema de Gestión se vuelva un ente administrativo muerto si no existe una revisión por la dirección periódica que asigne recursos y tome decisiones basadas en el desempeño real.',
            plan: [
              [
                'Diagnóstico actual: cuándo fue la última Revisión por la Dirección',
                'Definir agenda estándar de RPD (NC, auditorías, KPIs, recursos)',
                'Calendario de RPD cuatrimestral con DG y líderes',
                'Construir paquete de información previa estandarizado',
              ],
              [
                'Primera RPD formal con agenda completa',
                'Minuta de compromisos con responsables y fechas',
                'Seguimiento de compromisos en reunión mensual',
                'Vincular hallazgos a planes de mejora con presupuesto',
              ],
              [
                'Ciclo de 3 RPD ejecutadas en el año',
                'Tasa de cumplimiento de compromisos RPD > 80%',
                'SGC reconocido como herramienta estratégica (no administrativa)',
                'Reporte anual de calidad al Comité Directivo',
              ],
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================
  // M07 · AUDITORÍA
  // ===========================================================
  {
    id: 'm07',
    code: 'M07',
    nombre: 'Auditoría',
    nombreCorto: 'Auditoría',
    score: 3.0,
    criticidad: 'medium',
    riesgosTotal: 4,
    statusGlobal: 'Implementado con algunas oportunidades de mejora',
    descripcion: 'Defensa fiscal preventiva ante el SAT y auditoría financiera externa que valida la razonabilidad de las cifras.',
    subprocesos: [
      {
        id: '7.1',
        nombre: 'Defensa Fiscal y Materialidad',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Asegurar la veracidad de las operaciones y el blindaje preventivo ante facultades de comprobación del SAT.',
        grupos: [
          { id: '1.1', titulo: 'Materialidad de Operaciones', actividades: [
            { id: '1.1.1', nombre: 'Integración del Expediente de Defensa',        status: 'high' },
            { id: '1.1.2', nombre: 'Evidencia Fotográfica y Geolocalización',      status: 'low' },
            { id: '1.1.3', nombre: 'Validación de Capacidad Operativa',            status: 'low' },
          ]},
          { id: '1.2', titulo: 'Gestión de CFDI', actividades: [
            { id: '1.2.1', nombre: 'Descarga Masiva de CFDI',                      status: 'low' },
            { id: '1.2.2', nombre: 'Identificación de Facturas Canceladas',        status: 'low' },
            { id: '1.2.3', nombre: 'Conciliación de Complementos de Pago',         status: 'low' },
          ]},
          { id: '1.3', titulo: 'Monitoreo de Listas Negras', actividades: [
            { id: '1.3.1', nombre: 'Cruce Quincenal de RFCs',                      status: 'high' },
            { id: '1.3.2', nombre: 'Protocolo de Sustitución Inmediata',           status: 'high' },
            { id: '1.3.3', nombre: 'Análisis Retroactivo',                         status: 'low' },
          ]},
          { id: '1.4', titulo: 'Control de Activos Fijos', actividades: [
            { id: '1.4.1', nombre: 'Cotejo de Números de Serie',                   status: 'low' },
            { id: '1.4.2', nombre: 'Revisión de Pedimentos',                       status: 'low' },
            { id: '1.4.3', nombre: 'Bitácora de Depreciación',                     status: 'low' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Desconocimiento de Deducciones por Falta de Evidencia',
            desc: 'Riesgo de que la autoridad fiscal considere como "simulados" los servicios subcontratados por no contar con expediente de defensa (entregables, bitácoras, fotos) que demuestre que el servicio existió.',
            plan: [
              [
                'Auditar últimas 20 deducciones críticas: verificar expediente probatorio',
                'Identificar deducciones sin evidencia (riesgo de rechazo)',
                'Definir checklist de materialidad por tipo de gasto/servicio',
                'Asignar responsable de integración de expedientes',
              ],
              [
                'Repositorio digital de expedientes de materialidad por proveedor',
                'Capacitar al equipo en captura de evidencia (fotos, geolocalización)',
                'Protocolo obligatorio: ningún pago sin expediente completo',
                'Vinculación CFDI ↔ Acta de Entrega ↔ Evidencia técnica',
              ],
              [
                '100% de gastos críticos con expediente de defensa al día',
                'Auditoría aleatoria mensual de calidad de expedientes',
                'Simulacro de revisión SAT con expedientes actuales',
                'Reporte trimestral de blindaje fiscal al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Contaminación de la Cadena de Suministro (EFOS)',
            desc: 'Riesgo de realizar operaciones con proveedores listados como EFOS (Empresas que Facturan Operaciones Simuladas) por no contar con monitoreo preventivo y recurrente de las listas negras del SAT.',
            plan: [
              [
                'Cruzar lista actual de proveedores activos vs Listas SAT 69-B',
                'Identificar proveedores en estatus "Presunto" o "Definitivo"',
                'Definir frecuencia obligatoria de cruce (quincenal)',
                'Asignar responsable formal de monitoreo',
              ],
              [
                'Implementar herramienta de cruce automático con SAT (API o manual)',
                'Protocolo de sustitución inmediata ante alerta de EFOS',
                'Política de "Debida Diligencia" en alta de nuevos proveedores',
                'Análisis retroactivo de operaciones con EFOS detectados',
              ],
              [
                'Cero operaciones nuevas con proveedores listados',
                'Histórico limpio post-análisis retroactivo',
                'Auditoría trimestral del cumplimiento de monitoreo',
                'Reporte mensual de EFOS al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '7.2',
        nombre: 'Auditoría Financiera Externa',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Validar de forma independiente la razonabilidad financiera y asegurar la correcta determinación de impuestos.',
        grupos: [
          { id: '2.1', titulo: 'Revisión de Ingresos', actividades: [
            { id: '2.1.1', nombre: 'Rastreo de Depósitos No Identificados',        status: 'low' },
            { id: '2.1.2', nombre: 'Validación de Préstamos y Aportaciones',       status: 'low' },
          ]},
          { id: '2.2', titulo: 'Revisión de Nómina e Impuestos', actividades: [
            { id: '2.2.1', nombre: 'Amarre de Nómina vs SAT',                      status: 'high' },
            { id: '2.2.2', nombre: 'Auditoría de Retenciones a Terceros',          status: 'low' },
          ]},
          { id: '2.3', titulo: 'Revisión de Gastos', actividades: [
            { id: '2.3.1', nombre: 'Pruebas Selectivas de Gastos',                 status: 'low' },
            { id: '2.3.2', nombre: 'Opinión sobre Contingencias',                  status: 'low' },
          ]},
          { id: '2.4', titulo: 'Cierre de Auditoría', actividades: [
            { id: '2.4.1', nombre: 'Reunión de Hallazgos con Dirección',           status: 'low' },
            { id: '2.4.2', nombre: 'Plan de Acción con Contabilidad',              status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Errores en la Retención de Sueldos y Salarios',
            desc: 'Riesgo de que la empresa deba absorber el costo de impuestos no retenidos correctamente a los empleados, incrementando el gasto de nómina de forma imprevista.',
            plan: [
              [
                'Auditar cálculo de ISR retenido últimos 6 meses (muestreo)',
                'Identificar discrepancias entre Nómina vs Visor SAT',
                'Validar tablas vigentes en sistema de nómina',
                'Cuantificar exposición potencial (baseline)',
              ],
              [
                'Capacitar al área de Nómina en cambios fiscales 2026',
                'Implementar conciliación mensual Nómina vs Visor SAT',
                'Protocolo de revisión cruzada antes de timbrado',
                'Auditoría externa especializada en nómina (1 vez al año)',
              ],
              [
                'Cero diferencias en conciliación Nómina-SAT',
                'Reducir exposición a recargos por mala retención',
                'Documentación auditable lista para revisión',
                'Reporte trimestral de cumplimiento de nómina al Comité',
              ],
            ],
          },
          {
            nombre: 'Falta de Seguimiento a las Acciones Correctivas',
            desc: 'Riesgo de que los hallazgos de auditoría se repitan año tras año, evidenciando falta de compromiso institucional con la mejora continua y el cumplimiento.',
            plan: [
              [
                'Revisar carta a la administración de los últimos 2 ejercicios',
                'Identificar hallazgos repetidos (no remediados)',
                'Asignar responsable por hallazgo con fecha compromiso',
                'Cuantificar riesgo de cada hallazgo en MXN',
              ],
              [
                'Plan de remediación documentado con seguimiento mensual',
                'Sesiones bimestrales de seguimiento Contralor + Líderes',
                'Documentar evidencias de cambio por cada hallazgo',
                'Sesión preparatoria con auditor externo antes de próxima auditoría',
              ],
              [
                'Cero hallazgos repetidos en próxima auditoría',
                'Reducción medible de observaciones críticas',
                'Cultura de "cero hallazgos repetidos" instalada',
                'Reporte semestral de remediación al Comité Directivo',
              ],
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================
  // M08 · COMPRAS Y ABASTECIMIENTO
  // ===========================================================
  {
    id: 'm08',
    code: 'M08',
    nombre: 'Gestión de Compras y Abastecimiento',
    nombreCorto: 'Compras',
    score: 2.4,
    criticidad: 'high',
    riesgosTotal: 10,
    statusGlobal: 'Implementado con muchas oportunidades de mejora',
    descripcion: 'Cadena de suministro: desde la planeación de demanda hasta la estrategia de adquisición y el desarrollo de proveedores estratégicos.',
    subprocesos: [
      {
        id: '8.1',
        nombre: 'Planeación de la Demanda',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Anticipar requerimientos para evitar compras de pánico y proteger el margen de los proyectos.',
        grupos: [
          { id: '1.1', titulo: 'Pronóstico de Demanda', actividades: [
            { id: '1.1.1', nombre: 'Análisis de Series de Tiempo',                 status: 'low' },
            { id: '1.1.2', nombre: 'Retroalimentación Compras/Ventas/Operaciones', status: 'high' },
            { id: '1.1.3', nombre: 'Clasificación ABC de Insumos',                 status: 'low' },
            { id: '1.1.4', nombre: 'Ajuste por Factores Externos',                 status: 'low' },
          ]},
          { id: '1.2', titulo: 'Consolidación de Necesidades', actividades: [
            { id: '1.2.1', nombre: 'Identificación de Artículos Transversales',    status: 'low' },
            { id: '1.2.2', nombre: 'Catálogo de Artículos Estándar',               status: 'high' },
            { id: '1.2.3', nombre: 'Plan de Compras Anual / Semestral',            status: 'low' },
          ]},
          { id: '1.3', titulo: 'Punto de Reorden', actividades: [
            { id: '1.3.1', nombre: 'Cálculo de Inventario Mínimo y Máximo',        status: 'low' },
            { id: '1.3.2', nombre: 'Definición del Punto de Reorden',              status: 'low' },
            { id: '1.3.3', nombre: 'Análisis de Variabilidad de la Demanda',       status: 'low' },
          ]},
          { id: '1.4', titulo: 'Presupuesto por Proyecto', actividades: [
            { id: '1.4.1', nombre: 'Presupuesto por Centro de Costos',             status: 'high' },
            { id: '1.4.2', nombre: 'Protocolo de Validación Pre-Compra',           status: 'high' },
            { id: '1.4.3', nombre: 'Análisis de Desviaciones Real vs Presupuesto', status: 'low' },
            { id: '1.4.4', nombre: 'Flujo de Autorización por Jerarquías',         status: 'low' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Cultura de "Bomberazos" en Compras',
            desc: 'Riesgo de ineficiencia operativa y falta de control financiero por persistencia de compras de última hora que no permiten consolidación estratégica de necesidades.',
            plan: [
              [
                'Análisis de compras último trimestre: % urgentes vs planeadas',
                'Identificar usuarios y categorías con más compras urgentes',
                'Mapear consumibles recurrentes para consolidación',
                'Definir SLA de planeación: requisiciones con mín. 5 días anticipación',
              ],
              [
                'Implementar Plan Semestral de Compras consolidadas',
                'Punto de reorden automático para top 20 consumibles',
                'Política: compras urgentes requieren justificación y autorización adicional',
                'Capacitar líderes de proyecto en planeación de necesidades',
              ],
              [
                'Reducir compras urgentes > 50% en 90 días',
                'Ahorros medibles por consolidación de pedidos',
                'Reporte mensual de compras planeadas vs urgentes',
                'Reporte trimestral de eficiencia al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Desconocimiento de Techos Presupuestales',
            desc: 'Riesgo de sobrecostos en los proyectos al no tener acceso directo a los presupuestos anuales (centralizados en la Dirección), lo que impide al comprador validar si una requisición excede los márgenes antes de ejecutarla.',
            plan: [
              [
                'Mapear presupuestos por proyecto y por área (datos centralizados en DG)',
                'Migrar techos presupuestales a ERP accesible a compradores',
                'Definir matriz de visibilidad: quién ve qué presupuesto',
                'Validar políticas de confidencialidad con DG y Finanzas',
              ],
              [
                'Cargar techos presupuestales en ERP por proyecto/área',
                'Implementar alerta automática si requisición excede % del presupuesto',
                'Capacitar compradores en lectura de presupuesto por centro de costo',
                'Protocolo de escalación si requisición rebasa techo',
              ],
              [
                'Cero requisiciones aprobadas sin validación contra presupuesto',
                'Reducir sobrecostos por desconocimiento medible',
                'Cultura de "todo lo compras es contra un presupuesto"',
                'Reporte mensual de cumplimiento presupuestal al Comité',
              ],
            ],
          },
        ],
      },
      {
        id: '8.2',
        nombre: 'Selección y Alta de Proveedores',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Institucionalizar la transparencia y el blindaje fiscal en la adquisición de bienes.',
        grupos: [
          { id: '2.1', titulo: 'Cotización y Selección', actividades: [
            { id: '2.1.1', nombre: 'Solicitud de Cotización',                      status: 'low' },
            { id: '2.1.2', nombre: 'Elaboración del Cuadro Comparativo',           status: 'high' },
            { id: '2.1.3', nombre: 'Evaluación Técnica y Comercial',               status: 'low' },
            { id: '2.1.4', nombre: 'Negociación Final',                            status: 'low' },
          ]},
          { id: '2.2', titulo: 'Contratación', actividades: [
            { id: '2.2.1', nombre: 'Emisión del Documento Maestro (OC)',           status: 'low' },
            { id: '2.2.2', nombre: 'Cláusulas de Penalización y Garantía',         status: 'low' },
            { id: '2.2.3', nombre: 'Gestión de Contratos de Suministro',           status: 'low' },
            { id: '2.2.4', nombre: 'Aceptación Formal del Proveedor',              status: 'low' },
          ]},
          { id: '2.3', titulo: 'Alta y Validación Fiscal', actividades: [
            { id: '2.3.1', nombre: 'Verificación de Opinión de Cumplimiento',      status: 'high' },
            { id: '2.3.2', nombre: 'Cruce con Listas Negras (69-B)',               status: 'high' },
            { id: '2.3.3', nombre: 'Validación de Cédula Fiscal y Domicilio',      status: 'low' },
            { id: '2.3.4', nombre: 'Archivo de Materialidad Preventiva',           status: 'low' },
          ]},
          { id: '2.4', titulo: 'Seguimiento Logístico', actividades: [
            { id: '2.4.1', nombre: 'Monitoreo de Estatus de Operación',            status: 'low' },
            { id: '2.4.2', nombre: 'Gestión de Incidencias en Tránsito',           status: 'low' },
            { id: '2.4.3', nombre: 'Actualización del Plan de Operaciones',        status: 'low' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Centralización de Autorización en el Director',
            desc: 'Riesgo de parálisis comercial y operativa (cuello de botella) al requerir el visto bueno del Director General incluso para compras menores, limitando la agilidad del área de compras.',
            plan: [
              [
                'Mapear compras último mes: cuáles requirieron autorización del DG',
                'Identificar montos y categorías delegables',
                'Diseñar Tabla de Facultades de compras (3 niveles)',
                'Validar propuesta con DG y Finanzas',
              ],
              [
                'Tabla de Facultades formal aprobada',
                'Configurar workflow de aprobación en ERP por monto',
                'Capacitar líderes en sus nuevos límites',
                'Política de revocación si hay mal uso de la facultad',
              ],
              [
                'Reducir > 60% autorizaciones que escalan al DG',
                'Tiempo de aprobación de compras menores reducido',
                'Auditoría trimestral de cumplimiento',
                'Reporte mensual de delegación al Comité',
              ],
            ],
          },
          {
            nombre: 'Debilidad en el Alta de Proveedores (Fiscal)',
            desc: 'Riesgo de contingencias fiscales al no contar con proceso estandarizado de recopilación de documentación fiscal y validación de cumplimiento normativo antes de dar de alta proveedores.',
            plan: [
              [
                'Auditar últimos 20 proveedores dados de alta: documentación recopilada',
                'Identificar gaps de validación (Opinión, 69-B, materialidad)',
                'Definir checklist obligatorio de alta de proveedor',
                'Asignar responsable de validación fiscal del alta',
              ],
              [
                'Implementar formulario de alta con todos los campos obligatorios',
                'Bloqueo en ERP si falta cualquier validación',
                'Cruce automático con Listas 69-B antes de aprobar alta',
                'Repositorio digital de expedientes fiscales por proveedor',
              ],
              [
                '100% de altas con expediente completo',
                'Cero altas a proveedores en Listas SAT',
                'Auditoría trimestral de calidad de expedientes',
                'Reporte de cumplimiento al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '8.3',
        nombre: 'Almacén e Inventarios',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Resguardar el patrimonio y asegurar el flujo eficiente de materiales hacia los proyectos.',
        grupos: [
          { id: '3.1', titulo: 'Recepción de Mercancías', actividades: [
            { id: '3.1.1', nombre: 'Cotejo de Documentación',                      status: 'high' },
            { id: '3.1.2', nombre: 'Inspección Física y de Calidad',               status: 'high' },
            { id: '3.1.3', nombre: 'Generación del "Aviso de Recibo"',             status: 'high' },
            { id: '3.1.4', nombre: 'Identificación y Etiquetado',                  status: 'high' },
          ]},
          { id: '3.2', titulo: 'Control de Inventarios', actividades: [
            { id: '3.2.1', nombre: 'Implementación de PEPS',                       status: 'high' },
            { id: '3.2.2', nombre: 'Ejecución de Inventarios Cíclicos',            status: 'critical' },
            { id: '3.2.3', nombre: 'Conciliación de Diferencias',                  status: 'critical' },
            { id: '3.2.4', nombre: 'Análisis de Inventario Obsoleto',              status: 'high' },
          ]},
          { id: '3.3', titulo: 'Almacenamiento', actividades: [
            { id: '3.3.1', nombre: 'Diseño de Layout por Velocidad',               status: 'high' },
            { id: '3.3.2', nombre: 'Control de Accesos y Seguridad Física',        status: 'high' },
            { id: '3.3.3', nombre: 'Gestión de Ubicaciones Logísticas',            status: 'high' },
            { id: '3.3.4', nombre: 'Mantenimiento de Condiciones de Almacenaje',   status: 'high' },
          ]},
          { id: '3.4', titulo: 'Salidas y Distribución', actividades: [
            { id: '3.4.1', nombre: 'Validación de Requisición de Salida',          status: 'critical' },
            { id: '3.4.2', nombre: 'Picking y Packing',                            status: 'high' },
            { id: '3.4.3', nombre: 'Logística de Distribución (Última Milla)',     status: 'high' },
            { id: '3.4.4', nombre: 'Retorno de Materiales no Utilizados',          status: 'critical' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Falta de Disciplina en Recepción y Salida',
            desc: 'Riesgo de mermas y activos no localizados porque el personal operativo "salta" el proceso institucional, tomando productos sin la presencia o validación del almacén.',
            plan: [
              [
                'Auditar diferencias inventario físico vs sistema (baseline)',
                'Identificar usuarios y categorías con más "salidas no autorizadas"',
                'Diseñar formato de Pase de Salida obligatorio con firma',
                'Asignar control de accesos al almacén (1 entrada autorizada)',
              ],
              [
                'Implementar Pase de Salida digital con firma electrónica',
                'Capacitar personal operativo: "ningún material se saca sin pase"',
                'Cámaras y bitácora de acceso al almacén',
                'Política de consecuencia: sanción documentada por salto de proceso',
              ],
              [
                'Reducir mermas no documentadas > 70% en 90 días',
                'Cumplimiento de Pase de Salida > 95%',
                'Auditoría aleatoria mensual',
                'Reporte de mermas al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Desconexión de Inventarios en Sistema',
            desc: 'Riesgo de compras duplicadas de consumibles por no tener integración real entre existencias físicas del almacén y los saldos registrados en Microcip.',
            plan: [
              [
                'Diagnóstico de integración Microcip vs realidad física',
                'Conteo cíclico completo para sincronizar baseline',
                'Mapear flujos de información: entrada, salida, traspaso',
                'Definir frecuencia de actualización (target: tiempo real)',
              ],
              [
                'Configurar entradas/salidas obligatoriamente en sistema',
                'Inventario cíclico semanal por categoría ABC',
                'Validación pre-compra obligatoria contra saldo en sistema',
                'Capacitar almacenistas en captura disciplinada',
              ],
              [
                'Discrepancia físico-sistema < 3%',
                'Reducción de compras duplicadas medible',
                'Sistema confiable como única fuente de verdad',
                'Reporte de inventarios al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '8.4',
        nombre: 'Desarrollo de Proveedores',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Asegurar la calidad del suministro y reducir la dependencia de fuentes únicas.',
        grupos: [
          { id: '4.1', titulo: 'Evaluación de Desempeño', actividades: [
            { id: '4.1.1', nombre: 'Definición de KPIs de Abastecimiento',         status: 'high' },
            { id: '4.1.2', nombre: 'Generación de Reportes Periódicos',            status: 'high' },
            { id: '4.1.3', nombre: 'Sesiones de Retroalimentación',                status: 'high' },
          ]},
          { id: '4.2', titulo: 'Homologación', actividades: [
            { id: '4.2.1', nombre: 'Visitas Técnicas a Instalaciones',             status: 'high' },
            { id: '4.2.2', nombre: 'Homologación Documental',                      status: 'high' },
            { id: '4.2.3', nombre: 'Evaluación de Riesgo Financiero',              status: 'high' },
          ]},
          { id: '4.3', titulo: 'Alianzas Estratégicas', actividades: [
            { id: '4.3.1', nombre: 'Transferencia de Conocimiento',                status: 'high' },
            { id: '4.3.2', nombre: 'Acuerdos de Largo Plazo',                      status: 'high' },
            { id: '4.3.3', nombre: 'Incentivos por Mejora',                        status: 'high' },
          ]},
          { id: '4.4', titulo: 'Reducción de Dependencia', actividades: [
            { id: '4.4.1', nombre: 'Mapeo de Insumos Críticos Fuente Única',       status: 'critical' },
            { id: '4.4.2', nombre: 'Desarrollo de Segundas Fuentes',               status: 'critical' },
            { id: '4.4.3', nombre: 'Análisis de Localización (Nearshoring)',       status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Dependencia de Proveedores Específicos',
            desc: 'Riesgo de vulnerabilidad operativa al concentrar el 70% de los materiales en un solo proveedor, lo que otorga poco poder de negociación y deja expuesta a la empresa ante fallas de ese único suministro.',
            plan: [
              [
                'Análisis de gasto (spend analysis) por proveedor último año',
                'Identificar top 10 insumos con dependencia > 70% de un proveedor',
                'Mapeo de proveedores alternativos por categoría',
                'Cuantificar riesgo: impacto si proveedor único falla',
              ],
              [
                'Desarrollar 2da fuente para top 5 insumos críticos',
                'Negociar contratos marco con proveedores alternativos',
                'Pilotear 20% del volumen con proveedor alternativo',
                'Política: máx 60% del volumen con un solo proveedor',
              ],
              [
                'Reducir concentración a < 60% en insumos críticos',
                'Mejor poder de negociación con proveedores principales',
                'Plan de contingencia activo por categoría crítica',
                'Reporte trimestral de diversificación al Comité',
              ],
            ],
          },
          {
            nombre: 'Inexistencia de Indicadores de Desempeño de Proveedores',
            desc: 'Riesgo de mantener proveedores deficientes al no contar con registro histórico de cumplimiento (Fill Rate, calidad, servicio) que permita decisiones de sustitución basadas en datos.',
            plan: [
              [
                'Definir 5 KPIs de proveedores: Fill Rate, OTD, calidad, servicio, precio',
                'Recopilar histórico último año por proveedor top 20',
                'Construir scorecard inicial con datos disponibles',
                'Definir umbral de "proveedor de bajo desempeño"',
              ],
              [
                'Implementar scorecard mensual con KPIs automatizados',
                'Sesión trimestral con top 10 proveedores: presentar scorecard',
                'Plan de mejora documentado para proveedores en bajo desempeño',
                'Política de sustitución si no hay mejora en 6 meses',
              ],
              [
                'Sustituir o mejorar 3-5 proveedores de bajo desempeño',
                'Mejora medible en Fill Rate y OTD promedio',
                'Decisiones basadas en datos, no en "confianza"',
                'Reporte semestral de desempeño al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '8.5',
        nombre: 'Estrategia de Compras',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Maximizar la liquidez y rentabilidad mediante la gestión inteligente del capital de trabajo.',
        grupos: [
          { id: '5.1', titulo: 'Análisis del Gasto (Spend)', actividades: [
            { id: '5.1.1', nombre: 'Extracción y Limpieza de Datos',               status: 'high' },
            { id: '5.1.2', nombre: 'Identificación del Top de Proveedores',        status: 'high' },
            { id: '5.1.3', nombre: 'Detección de Compras no Autorizadas',          status: 'high' },
          ]},
          { id: '5.2', titulo: 'Estrategia de Ahorro', actividades: [
            { id: '5.2.1', nombre: 'Negociación por Volumen',                      status: 'high' },
            { id: '5.2.2', nombre: 'Ingeniería de Valor y Sustitución',            status: 'high' },
            { id: '5.2.3', nombre: 'Cost Avoidance',                               status: 'high' },
          ]},
          { id: '5.3', titulo: 'Total Cost of Ownership', actividades: [
            { id: '5.3.1', nombre: 'Cálculo de Costos Ocultos',                    status: 'high' },
            { id: '5.3.2', nombre: 'Evaluación de Consumibles y Energía',          status: 'high' },
            { id: '5.3.3', nombre: 'Disposición Final',                            status: 'high' },
          ]},
          { id: '5.4', titulo: 'Capital de Trabajo', actividades: [
            { id: '5.4.1', nombre: 'Extensión de Días de Crédito',                 status: 'critical' },
            { id: '5.4.2', nombre: 'Gestión de Inventarios en Consignación',       status: 'high' },
            { id: '5.4.3', nombre: 'Descuento por Pronto Pago',                    status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Predominio de Compras de Contado',
            desc: 'Riesgo de estrés en el flujo de caja operativo al no contar con líneas de crédito activas con los proveedores principales, obligando a la empresa a descapitalizarse para adquisiciones inmediatas.',
            plan: [
              [
                'Análisis de compras último trimestre: % de contado vs crédito',
                'Mapear top 10 proveedores y sus condiciones de crédito',
                'Calcular impacto en flujo de caja del modelo actual',
                'Identificar proveedores con apertura a negociar plazo',
              ],
              [
                'Negociar líneas de crédito con top 5 proveedores (target 30-60 días)',
                'Solicitar referencias comerciales para apoyar negociación',
                'Política: nuevas compras deben buscar crédito mínimo 30 días',
                'Capacitar compradores en negociación de plazos',
              ],
              [
                'Reducir % de compras de contado > 40%',
                'Días Pagados a Proveedor (DPO) extendido',
                'Liberación de capital de trabajo medible',
                'Reporte trimestral de capital de trabajo al Comité',
              ],
            ],
          },
          {
            nombre: 'Falta de Análisis de Gasto por Familia',
            desc: 'Riesgo de perder ahorros por volumen al no analizar en qué categorías se gasta más, impidiendo negociaciones anuales que reduzcan el costo unitario de los insumos más recurrentes.',
            plan: [
              [
                'Extraer data de compras último año por familia y proveedor',
                'Análisis ABC del gasto: identificar top 10 familias (80% del gasto)',
                'Mapear oportunidades de consolidación por familia',
                'Definir meta de ahorro anual por familia',
              ],
              [
                'Negociar contrato anual por volumen en top 5 familias',
                'Implementar Spend Dashboard mensual visible al CFO',
                'Plan de ahorros documentado por familia con responsable',
                'Capacitar compradores en negociación basada en volumen',
              ],
              [
                'Ahorros por volumen medibles > 5% del gasto top 5 familias',
                'Cultura de "compras estratégicas vs transaccionales"',
                'Reporte trimestral de ahorros logrados al Comité',
                'Plan anual de procurement con metas comprometidas',
              ],
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================
  // M09 · FACTURACIÓN Y COBRANZA
  // ===========================================================
  {
    id: 'm09',
    code: 'M09',
    nombre: 'Gestión de Facturación y Cobranza',
    nombreCorto: 'Facturación y Cobranza',
    score: 2.6,
    criticidad: 'medium',
    riesgosTotal: 10,
    statusGlobal: 'Implementado con algunas oportunidades de mejora',
    descripcion: 'Ciclo de conversión a efectivo: del origen del cobro a la conciliación final y el resguardo del dossier probatorio ante el SAT.',
    subprocesos: [
      {
        id: '9.1',
        nombre: 'Origen del Cobro',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Asegurar que el origen del cobro sea técnica y contractualmente impecable para evitar rechazos.',
        grupos: [
          { id: '1.1', titulo: 'Aviso de Facturación', actividades: [
            { id: '1.1.1', nombre: 'Emisión del Ticket / Aviso de Facturación',    status: 'low' },
            { id: '1.1.2', nombre: 'Notificación de Condiciones de Cierre',        status: 'low' },
            { id: '1.1.3', nombre: 'Verificación de Vigencia Contractual',         status: 'low' },
          ]},
          { id: '1.2', titulo: 'Validación Contractual', actividades: [
            { id: '1.2.1', nombre: 'Validación OC Cliente vs OC Sistema',          status: 'high' },
            { id: '1.2.2', nombre: 'Validación de Evidencia de Entrega',           status: 'high' },
            { id: '1.2.3', nombre: 'Revisión de Suficiencia Presupuestal Cliente', status: 'low' },
          ]},
          { id: '1.3', titulo: 'Datos Fiscales del Cliente', actividades: [
            { id: '1.3.1', nombre: 'Verificación de la Constancia Fiscal',         status: 'low' },
            { id: '1.3.2', nombre: 'Confirmación del Uso de CFDI',                 status: 'low' },
            { id: '1.3.3', nombre: 'Validación de Correos Institucionales',        status: 'low' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Discrepancia entre Cotización y Entrega',
            desc: 'Riesgo de que el cliente rechace la factura al detectar que los conceptos o montos no coinciden con la Orden de Compra o el contrato maestro firmado.',
            plan: [
              [
                'Auditar últimas 20 facturas: identificar rechazos por discrepancia',
                'Mapear puntos comunes de divergencia (cantidades, descripción, OC)',
                'Diseñar checklist pre-facturación de validación cruzada',
                'Asignar responsable de validación pre-emisión',
              ],
              [
                'Implementar workflow obligatorio de validación pre-CFDI',
                'Capacitar al equipo de facturación en lectura de OC y contrato',
                'Bloqueo en sistema si OC sistema ≠ OC cliente',
                'Comunicación previa con cliente: pre-validar concepto/monto',
              ],
              [
                'Reducir rechazos de facturas > 70% en 90 días',
                'DSO mejorado por aceleración del ciclo',
                'Auditoría aleatoria mensual de facturas emitidas',
                'Reporte mensual de calidad de facturación al Comité',
              ],
            ],
          },
          {
            nombre: 'Falta de Evidencia de Aceptación (Materialidad)',
            desc: 'Riesgo de no poder sustentar el cobro ante una disputa legal por carecer de actas de entrega o bitácoras firmadas por el cliente.',
            plan: [
              [
                'Auditar últimos 10 cobros disputados: % por falta de evidencia',
                'Definir formato estándar de Acta de Entrega por tipo de servicio',
                'Mapear evidencias requeridas por hito de facturación',
                'Asignar PM como responsable de captura oportuna',
              ],
              [
                'Implementar Acta de Entrega digital con firma electrónica',
                'Capacitar PMs en recopilación de evidencias durante (no al final) la obra',
                'Bloqueo en ERP: no emitir CFDI sin expediente de evidencias completo',
                'Repositorio digital por proyecto con evidencias accesibles',
              ],
              [
                'Reducir cobros bloqueados por falta de evidencias > 60%',
                'Expediente probatorio listo para defensa legal/fiscal',
                'Auditoría trimestral de expedientes vs facturado',
                'Reporte mensual al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '9.2',
        nombre: 'Emisión del CFDI',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Garantizar el cumplimiento de los estándares del SAT y la precisión de los datos fiscales.',
        grupos: [
          { id: '2.1', titulo: 'Configuración Fiscal', actividades: [
            { id: '2.1.1', nombre: 'Selección del Uso de CFDI y Régimen Fiscal',   status: 'low' },
            { id: '2.1.2', nombre: 'Determinación del Método de Pago',             status: 'low' },
            { id: '2.1.3', nombre: 'Asignación de la Forma de Pago',               status: 'low' },
          ]},
          { id: '2.2', titulo: 'Timbrado y Validación', actividades: [
            { id: '2.2.1', nombre: 'Carga de Conceptos, Cantidades y Unidades',    status: 'low' },
            { id: '2.2.2', nombre: 'Ejecución del Timbrado a través del PAC',      status: 'low' },
            { id: '2.2.3', nombre: 'Verificación de la Relación de CFDI',          status: 'high' },
          ]},
          { id: '2.3', titulo: 'Distribución del Comprobante', actividades: [
            { id: '2.3.1', nombre: 'Generación de la Representación Impresa (PDF)', status: 'low' },
            { id: '2.3.2', nombre: 'Envío Masivo XML + PDF',                       status: 'low' },
            { id: '2.3.3', nombre: 'Carga en Portal de Proveedores del Cliente',   status: 'low' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Errores en Datos Fiscales (Rechazo de Timbrado)',
            desc: 'Riesgo de retrasos operativos por facturar con datos de la Constancia de Situación Fiscal obsoletos, provocando cancelaciones y reexpediciones.',
            plan: [
              [
                'Auditar último mes: % de CFDI rechazados por error en datos fiscales',
                'Identificar clientes con CSF desactualizada en sistema',
                'Definir frecuencia de actualización (semestral)',
                'Asignar responsable de mantenimiento de catálogo fiscal',
              ],
              [
                'Solicitar CSF actualizada a clientes activos (campaña masiva)',
                'Implementar validación automática contra Visor SAT',
                'Política: no se factura sin CSF vigente en sistema',
                'Capacitar facturación en verificación pre-timbrado',
              ],
              [
                'Reducir rechazos por datos fiscales > 80%',
                'Tiempo de timbrado reducido (sin reprocesos)',
                'Catálogo fiscal de clientes 100% al día',
                'Reporte mensual de calidad de timbrado al Comité',
              ],
            ],
          },
          {
            nombre: 'Pérdida de Trazabilidad por Sustitución',
            desc: 'Riesgo de duplicidad de ingresos ante el SAT al cancelar facturas y no relacionar correctamente el UUID del nuevo comprobante con el anterior.',
            plan: [
              [
                'Auditar últimas 30 cancelaciones: validar relación de CFDI',
                'Identificar CFDI sustituidos sin relación correcta',
                'Mapear el proceso actual de sustitución',
                'Definir protocolo de sustitución con campos obligatorios',
              ],
              [
                'Implementar workflow obligatorio: cancelación + sustitución relacionada',
                'Capacitar facturación en uso correcto del nodo "Relación de CFDI"',
                'Bloqueo en sistema: no emitir CFDI sustituto sin UUID anterior',
                'Bitácora digital de cancelaciones y sustituciones',
              ],
              [
                '100% de sustituciones con relación correcta',
                'Cero duplicidades en Visor SAT',
                'Auditoría trimestral del proceso de cancelación',
                'Reporte de cumplimiento al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '9.3',
        nombre: 'Seguimiento de Cobranza',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Monitorear proactivamente el vencimiento para reducir el ciclo de conversión de efectivo (DSO).',
        grupos: [
          { id: '3.1', titulo: 'Gestión Preventiva', actividades: [
            { id: '3.1.1', nombre: 'Confirmación de Recepción y Aceptación',       status: 'high' },
            { id: '3.1.2', nombre: 'Conciliación de Fechas',                       status: 'low' },
            { id: '3.1.3', nombre: 'Recordatorios Automáticos Pre-Vencimiento',    status: 'low' },
          ]},
          { id: '3.2', titulo: 'Gestión Correctiva', actividades: [
            { id: '3.2.1', nombre: 'Antigüedad de Saldos',                         status: 'low' },
            { id: '3.2.2', nombre: 'Cobranza Directa al Cliente',                  status: 'low' },
            { id: '3.2.3', nombre: 'Gestión de Aclaraciones',                      status: 'low' },
          ]},
          { id: '3.3', titulo: 'Recuperación y Escalamiento', actividades: [
            { id: '3.3.1', nombre: 'Convenios y Planes de Pago',                   status: 'low' },
            { id: '3.3.2', nombre: 'Gestión de Cuentas Estratégicas (Escalamiento)', status: 'low' },
            { id: '3.3.3', nombre: 'Suspensión de Servicios a Morosos',            status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Envejecimiento de Cartera (Cuentas Incobrables)',
            desc: 'Riesgo de pérdida financiera al no contar con gestión preventiva, permitiendo que las facturas superen los 60 o 90 días sin acciones de recuperación.',
            plan: [
              [
                'Análisis de antigüedad de cartera actual (> 30, > 60, > 90 días)',
                'Identificar top 10 clientes morosos y monto adeudado',
                'Definir política de cobranza por rango de antigüedad',
                'Asignar gestor de cobranza dedicado',
              ],
              [
                'Implementar recordatorios automáticos 5 y 1 días antes del vencimiento',
                'Cobranza activa diaria de cartera > 30 días',
                'Escalación documentada en cartera > 60 días',
                'Convenios formales para casos > 90 días',
              ],
              [
                'Reducir cartera > 60 días > 50% en 90 días',
                'DSO (Days Sales Outstanding) reducido medible',
                'Provisión por incobrables reducida',
                'Reporte semanal de cartera al CFO + Comité',
              ],
            ],
          },
          {
            nombre: 'Falta de Confirmación de Aceptación de la Factura',
            desc: 'Riesgo de enterarse de que una factura fue rechazada por el cliente hasta el día del vencimiento, perdiendo valiosos días de crédito.',
            plan: [
              [
                'Auditar últimas 30 facturas: % con confirmación de aceptación',
                'Mapear clientes con portal de proveedores vs sin portal',
                'Definir SLA: confirmación de aceptación máx 5 días post-emisión',
                'Asignar responsable de seguimiento de aceptación',
              ],
              [
                'Protocolo formal: llamada/correo de confirmación día 3 post-envío',
                'Implementar checklist en CRM de "factura confirmada"',
                'Integrar carga automática a portales de clientes principales',
                'Capacitar gestor en script de seguimiento',
              ],
              [
                'Tasa de confirmación > 90% en 5 días post-emisión',
                'Detección temprana de rechazos (no esperar al vencimiento)',
                'Aceleración del ciclo de cobro (DSO mejor)',
                'Reporte mensual de aceptación al Comité Directivo',
              ],
            ],
          },
        ],
      },
      {
        id: '9.4',
        nombre: 'Conciliación y Complemento de Pago (REP)',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Conciliar el ingreso bancario y dar cumplimiento a las obligaciones de cierre fiscal.',
        grupos: [
          { id: '4.1', titulo: 'Identificación del Pago', actividades: [
            { id: '4.1.1', nombre: 'Monitoreo Diario de Estados de Cuenta',        status: 'high' },
            { id: '4.1.2', nombre: 'Aplicación del Pago en el ERP',                status: 'high' },
            { id: '4.1.3', nombre: 'Gestión de Remanentes',                        status: 'high' },
          ]},
          { id: '4.2', titulo: 'Emisión del REP', actividades: [
            { id: '4.2.1', nombre: 'Timbrado del CFDI con Complemento de Pago',    status: 'critical' },
            { id: '4.2.2', nombre: 'Validación de Nodos de Pago',                  status: 'critical' },
            { id: '4.2.3', nombre: 'Envío Automatizado del REP al Cliente',        status: 'high' },
          ]},
          { id: '4.3', titulo: 'Conciliación Final', actividades: [
            { id: '4.3.1', nombre: 'Cotejo Mensual Estado de Cuenta vs Sistema',   status: 'high' },
            { id: '4.3.2', nombre: 'Identificación de Partidas no Conciliadas',    status: 'high' },
            { id: '4.3.3', nombre: 'Reporte de Flujo Real vs Proyectado',          status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Omisión del Complemento de Pago (REP)',
            desc: 'Riesgo de sanciones por parte del SAT y molestias al cliente (quien no podrá acreditar el IVA) por no emitir el REP en los plazos legales (máx 5 días naturales del mes siguiente).',
            plan: [
              [
                'Auditar último trimestre: % de REPs emitidos en plazo legal',
                'Identificar pagos pendientes de REP del mes anterior',
                'Mapear causas del retraso (información, sistema, prioridad)',
                'Asignar responsable de monitoreo diario de REPs',
              ],
              [
                'Implementar reporte automático de pagos pendientes de REP',
                'Definir cierre diario de REPs (no acumular hasta el día 5)',
                'Capacitar facturación en reglas del REP (PUE vs PPD)',
                'Validación automática de nodos antes del timbrado',
              ],
              [
                '100% de REPs emitidos dentro del plazo legal',
                'Cero sanciones SAT por omisión de REP',
                'Auditoría mensual de cumplimiento',
                'Reporte mensual al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Aplicación de Pagos Errónea',
            desc: 'Riesgo de desorden en los estados de cuenta del cliente al aplicar abonos globales a facturas equivocadas, complicando aclaraciones futuras y deteriorando la relación.',
            plan: [
              [
                'Auditar últimos 20 pagos aplicados: % con error de aplicación',
                'Mapear causas más comunes (pagos consolidados, sin referencia)',
                'Definir protocolo de validación previa a la aplicación',
                'Solicitar a clientes referencia de factura en pagos',
              ],
              [
                'Implementar validación cruzada CFDI ↔ pago antes de aplicar',
                'Capacitar tesorería en lectura de comprobantes SPEI',
                'Notificar al cliente la aplicación realizada para confirmar',
                'Bitácora de aplicaciones con justificación documentada',
              ],
              [
                'Reducir errores de aplicación > 80%',
                'Estados de cuenta de clientes limpios',
                'Reducir tiempo en aclaraciones',
                'Reporte de calidad de conciliación al Comité',
              ],
            ],
          },
        ],
      },
      {
        id: '9.5',
        nombre: 'Dossier de Materialidad y Resguardo',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Blindar a la empresa ante futuras auditorías mediante la integración del expediente probatorio.',
        grupos: [
          { id: '5.1', titulo: 'Expediente del Cliente', actividades: [
            { id: '5.1.1', nombre: 'Vinculación Contrato + OC + Acta + CFDI + REP', status: 'critical' },
            { id: '5.1.2', nombre: 'Resguardo de Evidencia Técnica (bitácoras, fotos)', status: 'critical' },
            { id: '5.1.3', nombre: 'Custodia de Comprobantes de Pago (SPEI)',      status: 'high' },
          ]},
          { id: '5.2', titulo: 'Contabilidad Electrónica', actividades: [
            { id: '5.2.1', nombre: 'Descarga y Validación Masiva de XMLs',         status: 'high' },
            { id: '5.2.2', nombre: 'Monitoreo de Listas Negras (Art. 69-B)',       status: 'critical' },
            { id: '5.2.3', nombre: 'Respaldo de Seguridad',                        status: 'critical' },
          ]},
          { id: '5.3', titulo: 'Reportes Gerenciales', actividades: [
            { id: '5.3.1', nombre: 'Cálculo y Reporte de DSO',                     status: 'high' },
            { id: '5.3.2', nombre: 'Análisis de Efectividad de Cobranza',          status: 'high' },
            { id: '5.3.3', nombre: 'Evaluación de Riesgo de Cartera',              status: 'high' },
          ]},
        ],
        riesgos: [
          {
            nombre: 'Inexistencia del Dossier de Materialidad',
            desc: 'Riesgo de que el SAT considere los ingresos como "indebidos" o desconozca la operación al no resguardar las pruebas de que el servicio realmente se ejecutó.',
            plan: [
              [
                'Auditar últimos 30 ingresos críticos: existencia de dossier completo',
                'Identificar gaps: cuáles ingresos no tienen evidencia suficiente',
                'Definir contenido mínimo del dossier por tipo de ingreso',
                'Asignar responsable de integración del dossier',
              ],
              [
                'Repositorio digital por cliente/proyecto con dossier completo',
                'Vinculación obligatoria: Contrato + OC + Acta + CFDI + REP',
                'Capacitar facturación y operaciones en captura de evidencia',
                'Protocolo: ningún ingreso se considera "cerrado" sin dossier',
              ],
              [
                '100% de ingresos críticos con dossier completo',
                'Simulacro de revisión SAT con dossier actual',
                'Auditoría trimestral de calidad de expedientes',
                'Reporte de blindaje fiscal al Comité Directivo',
              ],
            ],
          },
          {
            nombre: 'Vulnerabilidad ante Listas Negras (Art. 69-B)',
            desc: 'Riesgo de daño reputacional y fiscal al no monitorear si los clientes caen en estatus de "operaciones simuladas" posterior a la venta.',
            plan: [
              [
                'Cruzar cartera actual de clientes vs Listas SAT 69-B (estatus actual)',
                'Identificar clientes en "Presunto" o "Definitivo"',
                'Definir frecuencia obligatoria de cruce (quincenal)',
                'Asignar responsable formal de monitoreo de clientes',
              ],
              [
                'Implementar herramienta de monitoreo automático contra SAT',
                'Protocolo de acción inmediata ante alerta de cliente EFOS',
                'Análisis retroactivo de ingresos con clientes en lista',
                'Política de "Debida Diligencia" en alta de nuevos clientes',
              ],
              [
                'Cero ingresos nuevos de clientes en Listas SAT',
                'Histórico evaluado y documentado',
                'Auditoría trimestral del cumplimiento de monitoreo',
                'Reporte mensual de exposición al Comité Directivo',
              ],
            ],
          },
        ],
      },
    ],
  },
];

// ============================================================
//  RIESGOS POR CATEGORÍA
// ============================================================
const RIESGOS_POR_CATEGORIA = [
  { categoria: 'Operativos',     cantidad: 28, color: '#A6192E' },
  { categoria: 'Financieros',    cantidad: 22, color: '#7A1220' },
  { categoria: 'Comerciales',    cantidad: 18, color: '#2D4F73' },
  { categoria: 'Cumplimiento',   cantidad: 17, color: '#2B5A35' },
  { categoria: 'Humanos',        cantidad: 14, color: '#9B7E1F' },
  { categoria: 'Estratégicos',   cantidad: 12, color: '#5B4673' },
  { categoria: 'Reputacionales', cantidad: 9,  color: '#8C3A5C' },
  { categoria: 'Fiscales',       cantidad: 7,  color: '#C68214' },
];

const TOP_RIESGOS = [
  { id: 'R01', nombre: 'Ausencia de Gobierno Corporativo', cat: 'Estratégico', sev: 'critical', area: 'SCI · Estratégico' },
  { id: 'R02', nombre: 'Inexistencia de Control Presupuestal', cat: 'Financiero', sev: 'critical', area: 'SCI · Directivo' },
  { id: 'R03', nombre: 'Centralización Excesiva (Cuello de Botella)', cat: 'Directivo', sev: 'critical', area: 'SCI · Directivo' },
  { id: 'R04', nombre: 'Operación sin KPIs por Área', cat: 'Directivo', sev: 'critical', area: 'SCI · Directivo' },
  { id: 'R05', nombre: 'Crisis de Liquidez por Mala Estimación', cat: 'Financiero', sev: 'high', area: 'M05 · Tesorería' },
  { id: 'R06', nombre: 'Dossier de Materialidad Inexistente', cat: 'Fiscal', sev: 'high', area: 'M09 · Materialidad' },
  { id: 'R07', nombre: 'Dependencia de Prospección Dueño-Dependiente', cat: 'Comercial', sev: 'high', area: 'M01 · Demanda' },
  { id: 'R08', nombre: 'Falta de Onboarding y Capacitación Formal', cat: 'Humano', sev: 'high', area: 'M04 · RRHH' },
  { id: 'R09', nombre: 'Cultura QHSE Insuficiente', cat: 'Operativo', sev: 'high', area: 'M06 · Calidad' },
  { id: 'R10', nombre: 'Cartera Vencida sin Gestión Preventiva', cat: 'Financiero', sev: 'high', area: 'M09 · Cobranza' },
  { id: 'R11', nombre: 'Dependencia de Proveedores Específicos', cat: 'Operativo', sev: 'high', area: 'M08 · Compras' },
  { id: 'R12', nombre: 'Materialización de Accidentes Graves (QHSE)', cat: 'Cumplimiento', sev: 'high', area: 'M06 · QHSE' },
];

const HEATMAP_RIESGOS = [
  { p: 'Alta',  i: 'Alto',  count: 18, severity: 'critical',
    riesgos: [
      { id: 'R01', nombre: 'Ausencia de Gobierno Corporativo',           area: 'SCI · Estratégico' },
      { id: 'R02', nombre: 'Inexistencia de Control Presupuestal',       area: 'SCI · Directivo' },
      { id: 'R03', nombre: 'Centralización Excesiva (Cuello de Botella)', area: 'SCI · Directivo' },
      { id: 'R04', nombre: 'Operación sin KPIs por Área',                area: 'SCI · Directivo' },
      { id: 'R12', nombre: 'Materialización de Accidentes Graves (QHSE)', area: 'M06 · QHSE' },
    ] },
  { p: 'Alta',  i: 'Medio', count: 14, severity: 'high',
    riesgos: [
      { id: 'R07', nombre: 'Dependencia de Prospección Dueño-Dependiente', area: 'M01 · Demanda' },
      { id: 'R08', nombre: 'Falta de Onboarding y Capacitación Formal',    area: 'M04 · RRHH' },
      { id: 'R10', nombre: 'Cartera Vencida sin Gestión Preventiva',       area: 'M09 · Cobranza' },
      { id: 'R11', nombre: 'Dependencia de Proveedores Específicos',       area: 'M08 · Compras' },
    ] },
  { p: 'Alta',  i: 'Bajo',  count: 7,  severity: 'medium',
    riesgos: [
      { id: 'R28', nombre: 'Duplicidad en Catálogo de Artículos',         area: 'M08 · Compras' },
      { id: 'R31', nombre: 'Retrasos en Reembolsos a Empleados',          area: 'M05 · Tesorería' },
      { id: 'R34', nombre: 'Inconsistencias en Bitácoras de Obra',        area: 'M07 · Ejecución' },
    ] },
  { p: 'Media', i: 'Alto',  count: 16, severity: 'high',
    riesgos: [
      { id: 'R05', nombre: 'Crisis de Liquidez por Mala Estimación',      area: 'M05 · Tesorería' },
      { id: 'R06', nombre: 'Dossier de Materialidad Inexistente',         area: 'M09 · Materialidad' },
      { id: 'R09', nombre: 'Cultura QHSE Insuficiente',                   area: 'M06 · Calidad' },
      { id: 'R42', nombre: 'Subestimación de Recursos en Proyecto',       area: 'M07 · Planeación' },
    ] },
  { p: 'Media', i: 'Medio', count: 22, severity: 'medium',
    riesgos: [
      { id: 'R51', nombre: 'Desfase en Ruta Crítica de Obra',             area: 'M07 · Ejecución' },
      { id: 'R52', nombre: 'Comunicación Reactiva entre Áreas',           area: 'M03 · Operación' },
      { id: 'R53', nombre: 'Rotación de Personal Clave sin Backup',       area: 'M04 · RRHH' },
      { id: 'R54', nombre: 'Evaluación de Desempeño Sin Calibración',     area: 'M04 · RRHH' },
      { id: 'R55', nombre: 'Aprobación Verbal de Compras Recurrentes',    area: 'M08 · Compras' },
    ] },
  { p: 'Media', i: 'Bajo',  count: 11, severity: 'low',
    riesgos: [
      { id: 'R70', nombre: 'Versiones Múltiples de Plantillas Internas',  area: 'M03 · Operación' },
      { id: 'R71', nombre: 'Archivo Físico sin Resguardo Digital',        area: 'M09 · Contabilidad' },
      { id: 'R72', nombre: 'Retrasos en Conciliaciones Menores',          area: 'M05 · Tesorería' },
    ] },
  { p: 'Baja',  i: 'Alto',  count: 9,  severity: 'medium',
    riesgos: [
      { id: 'R80', nombre: 'Fraude Interno por Manipulación de Bitácoras', area: 'M07 · Supervisión' },
      { id: 'R81', nombre: 'Demanda Laboral Colectiva por Prácticas',     area: 'M04 · RRHH' },
      { id: 'R82', nombre: 'Cancelación Anticipada de Contrato Mayor',    area: 'M01 · Comercial' },
    ] },
  { p: 'Baja',  i: 'Medio', count: 17, severity: 'low',
    riesgos: [
      { id: 'R95', nombre: 'Auditoría Fiscal sin Hallazgos Materiales',   area: 'M09 · Fiscal' },
      { id: 'R96', nombre: 'Reclamos de Cliente por Detalles Menores',    area: 'M06 · Calidad' },
      { id: 'R97', nombre: 'Errores Administrativos en Nómina',           area: 'M04 · RRHH' },
    ] },
  { p: 'Baja',  i: 'Bajo',  count: 13, severity: 'low',
    riesgos: [
      { id: 'R110', nombre: 'Daños Menores en Equipo de Oficina',        area: 'M03 · Operación' },
      { id: 'R111', nombre: 'Retraso en Mantenimiento Preventivo Menor', area: 'M03 · Operación' },
      { id: 'R112', nombre: 'Inconsistencias Tipográficas en Reportes',  area: 'M09 · Contabilidad' },
    ] },
];

// ============================================================
//  ROADMAP
// ============================================================
const ROADMAP = [
  {
    fase: 'FASE 1', titulo: 'Estabilización', horizonte: '0–3 meses', color: '#A6192E', tint: '#FAEFF1',
    objetivo: 'Detener la hemorragia. Instalar candados básicos.',
    entregables: [
      'Tabla de facultades y matriz de autorizaciones',
      'Control presupuestal por centro de costos',
      'Canal de denuncia y código de ética',
      'Dossier de materialidad y monitoreo Art. 69-B',
      'Protocolo de cierre administrativo y cobranza preventiva',
    ],
    impacto: '+12% margen operativo · –40% riesgo fiscal',
  },
  {
    fase: 'FASE 2', titulo: 'Institucionalización', horizonte: '3–9 meses', color: '#C68214', tint: '#FBF3DC',
    objetivo: 'Crear los órganos de gobierno y los sistemas de medición.',
    entregables: [
      'Consejo Consultivo + órganos de apoyo',
      'Plan Estratégico formal con KPIs por área',
      'Sistema de evaluación del desempeño',
      'Calificación DANT y embudo comercial institucional',
      'Programa de auditoría interna y matriz de riesgos viva',
    ],
    impacto: '+20% efectividad comercial · +35% rotación de activos',
  },
  {
    fase: 'FASE 3', titulo: 'Optimización', horizonte: '9–18 meses', color: '#2B5A35', tint: '#E4ECDF',
    objetivo: 'Pasar de control a rentabilidad. Apalancar el sistema.',
    entregables: [
      'Tablero único de mando ejecutivo',
      'Programa de desarrollo de proveedores estratégicos',
      'Plan de sucesión y semillero de talento',
      'Certificaciones nacionales/internacionales',
      'Sistema de mejora continua y revisión por dirección',
    ],
    impacto: '+30% utilidad sin incrementar ventas · Antifragilidad operativa',
  },
];

// ============================================================
//  HELPERS
// ============================================================
const getMaturityColor = (score) => {
  if (score < 1) return MATURITY_LEVELS[0].color;
  if (score < 2) return MATURITY_LEVELS[1].color;
  if (score < 2.5) return MATURITY_LEVELS[2].color;
  if (score < 3.5) return MATURITY_LEVELS[3].color;
  if (score < 4.5) return MATURITY_LEVELS[4].color;
  return MATURITY_LEVELS[5].color;
};

const getMaturityLabel = (score) => {
  if (score < 1) return MATURITY_LEVELS[0].label;
  if (score < 2) return MATURITY_LEVELS[1].label;
  if (score < 2.5) return MATURITY_LEVELS[2].label;
  if (score < 3.5) return MATURITY_LEVELS[3].label;
  if (score < 4.5) return MATURITY_LEVELS[4].label;
  return MATURITY_LEVELS[5].label;
};

// Paleta elegante para barras de score: rojos para inmadurez, grises para madurez.
// El gradiente comunica "menos rojo = más maduro".
const getBarColor = (score) => {
  if (score < 1)   return '#7A1220'; // rojo profundo · Inexistente
  if (score < 2)   return '#A6192E'; // rojo institucional · Insuficiente
  if (score < 2.5) return '#8C5961'; // rojo apagado · Muchas oportunidades
  if (score < 3.5) return '#6B6B6B'; // gris medio · Algunas oportunidades
  if (score < 4.5) return '#3D3D3D'; // gris carbón · Bien Implementado
  return '#1A1A1A';                  // negro corporativo · Excelencia
};

// ============================================================
//  COMPONENTES BASE
// ============================================================
const SectionTitle = ({ es, en }) => (
  <div className="mb-6">
    <h2 className="text-3xl font-bold leading-tight tracking-tight"
        style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>{es}</h2>
    <p className="text-sm italic mt-1" style={{ color: COLORS.textMuted, fontFamily: FONT_SERIF }}>{en}</p>
    <div className="mt-3 h-px w-12" style={{ backgroundColor: COLORS.brandRed || COLORS.greenDeep }} />
  </div>
);

const Card = ({ children, className = '', style = {} }) => (
  <div className={`rounded-lg ${className}`}
       style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
                boxShadow: '0 1px 2px rgba(31,34,37,0.04)', ...style }}>
    {children}
  </div>
);

// Semáforo elegante de 3 luces (rojo / ámbar / verde) según score 0–5.
// Tier: <2 rojo · 2–<3.5 ámbar · ≥3.5 verde. La luz activa lleva glow realista.
const TrafficLight = ({ score, size = 'sm', orientation = 'horizontal' }) => {
  const tier = score < 2 ? 'red' : score < 3.5 ? 'amber' : 'green';
  const dot = size === 'lg' ? 16 : size === 'md' ? 12 : 9;
  const pad = size === 'lg' ? 6 : size === 'md' ? 5 : 4;
  const gap = size === 'lg' ? 8 : size === 'md' ? 6 : 5;
  const lights = [
    { id: 'red',   color: '#E63946', glow: '#FF5562' },
    { id: 'amber', color: '#E5A53A', glow: '#FFC861' },
    { id: 'green', color: '#3DAE5A', glow: '#5BD178' },
  ];
  return (
    <div role="img" aria-label={`Semáforo · nivel ${tier}`}
         style={{
           display: 'inline-flex',
           flexDirection: orientation === 'vertical' ? 'column' : 'row',
           alignItems: 'center', gap,
           padding: `${pad + 1}px ${pad + 2}px`,
           background: 'linear-gradient(180deg, #2A2A2A 0%, #161616 100%)',
           borderRadius: 999,
           border: '1px solid #0A0A0A',
           boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.25)',
         }}>
      {lights.map(l => {
        const active = l.id === tier;
        return (
          <span key={l.id} aria-hidden="true"
                style={{
                  width: dot, height: dot, borderRadius: '50%',
                  backgroundColor: active ? l.color : l.color,
                  opacity: active ? 1 : 0.14,
                  background: active
                    ? `radial-gradient(circle at 35% 30%, ${l.glow} 0%, ${l.color} 55%, ${l.color} 100%)`
                    : l.color,
                  boxShadow: active
                    ? `0 0 ${dot * 0.55}px ${dot * 0.18}px ${l.color}AA,
                       0 0 ${dot * 1.4}px ${dot * 0.32}px ${l.glow}55,
                       inset 0 -1px 1px rgba(0,0,0,0.45),
                       inset 0 1px 1px rgba(255,255,255,0.55)`
                    : 'inset 0 1px 1px rgba(0,0,0,0.55)',
                  transition: 'all 250ms ease',
                }} />
        );
      })}
    </div>
  );
};

// Plan de trabajo simulado en 3 ventanas (0-30 / 31-60 / 61-90 días) para un riesgo dado.
// Botón rojo · letras blancas que despliega/oculta el plan al hacer click.
const RiskActionPlan = ({ riskName, plan }) => {
  const [open, setOpen] = useState(false);
  const useCustom = Array.isArray(plan) && plan.length === 3;
  const fases = [
    {
      rango: '0–30 días',
      titulo: 'Diagnóstico y Línea Base',
      color: '#A6192E',
      tint: '#FAEFF1',
      acciones: useCustom ? plan[0] : [
        `Mapear stakeholders y dueños de proceso afectados por "${riskName}"`,
        'Levantar línea base cuantitativa del impacto actual (frecuencia, costo, exposición)',
        'Definir KPI de mitigación y meta a 90 días',
        'Asignar responsable ejecutivo y patrocinador del plan',
      ],
    },
    {
      rango: '31–60 días',
      titulo: 'Diseño e Implementación',
      color: '#C68214',
      tint: '#FBF3DC',
      acciones: useCustom ? plan[1] : [
        `Diseñar control, política o procedimiento específico para mitigar "${riskName}"`,
        'Capacitar al equipo operativo en el nuevo protocolo y matriz de facultades',
        'Pilotar el control en el área de mayor exposición durante 2 semanas',
        'Documentar evidencia en el Sistema de Control Interno (SCI)',
      ],
    },
    {
      rango: '61–90 días',
      titulo: 'Despliegue y Medición',
      color: '#2B5A35',
      tint: '#E4ECDF',
      acciones: useCustom ? plan[2] : [
        'Escalar el control al 100% de los procesos y áreas afectadas',
        'Auditoría interna del control implementado y ajuste de desviaciones',
        'Medir KPI de mitigación vs. línea base y reportar a la Junta de Consejo',
        'Integrar el indicador al tablero de control mensual',
      ],
    },
  ];
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="no-print w-full px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded transition-all duration-200 hover:-translate-y-px"
        style={{ backgroundColor: '#A6192E', color: '#FFFFFF',
                 border: '1px solid #7A1220',
                 boxShadow: '0 1px 2px rgba(122,18,32,0.25)' }}>
        {open ? 'Ocultar Plan de Trabajo' : 'Generar Plan de Trabajo'}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {fases.map((f, i) => (
            <div key={i} className="p-3 rounded"
                 style={{ backgroundColor: f.tint, border: `1px solid ${f.color}40` }}>
              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                     style={{ backgroundColor: f.color, color: '#FFFFFF' }}>
                  Fase · {f.rango}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: f.color }}>
                  {f.titulo}
                </div>
              </div>
              <ul className="space-y-1">
                {f.acciones.map((a, j) => (
                  <li key={j} className="flex items-start gap-2 text-[11px] leading-relaxed"
                      style={{ color: COLORS.inkSoft }}>
                    <span aria-hidden="true"
                          style={{ display: 'inline-block', width: 10, height: 10, minWidth: 10,
                                   marginTop: 3, borderRadius: 2,
                                   border: `1.5px solid ${f.color}`,
                                   backgroundColor: COLORS.bgCard }} />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const KPICard = ({ value, label, sublabel, accent }) => (
  <Card className="p-5 transition-all duration-200 hover:-translate-y-px"
        style={{ borderColor: accent ? `${accent}33` : COLORS.border,
                 borderTop: `3px solid ${accent || COLORS.greenDeep}` }}>
    <div className="text-3xl font-bold tracking-tight" style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>{value}</div>
    <div className="text-sm font-semibold mt-1" style={{ color: COLORS.inkSoft }}>{label}</div>
    {sublabel && <div className="text-xs mt-1" style={{ color: COLORS.textMuted }}>{sublabel}</div>}
  </Card>
);

const TabButton = ({ active, onClick, label, separator }) => (
  <>
    {separator && <div className="h-6 w-px self-center mx-2" style={{ backgroundColor: COLORS.border }} />}
    <button
      onClick={onClick}
      className="flex items-center px-4 py-2 my-2.5 mx-1 text-[11px] font-bold uppercase tracking-widest transition-all duration-200 whitespace-nowrap"
      style={{
        color: active ? COLORS.bgCard : COLORS.inkSoft,
        backgroundColor: active ? COLORS.green : COLORS.bgCard,
        border: `1px solid ${active ? COLORS.greenInk : COLORS.borderStrong}`,
        borderRadius: 4,
        letterSpacing: '0.12em',
        boxShadow: active
          ? `0 0 0 3px ${COLORS.green}22, 0 2px 8px ${COLORS.green}40, inset 0 1px 0 rgba(255,255,255,0.18)`
          : `0 1px 2px rgba(0,0,0,0.05)`,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = COLORS.green;
          e.currentTarget.style.color = COLORS.green;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.green}15, 0 2px 6px ${COLORS.green}25`;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = COLORS.borderStrong;
          e.currentTarget.style.color = COLORS.inkSoft;
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
        }
      }}
    >
      {label}
    </button>
  </>
);

const ScoreGauge = ({ score, size = 'lg' }) => {
  const pct = (score / 5) * 100;
  const color = getMaturityColor(score);
  const radius = size === 'lg' ? 90 : size === 'md' ? 70 : 55;
  const stroke = size === 'lg' ? 12 : size === 'md' ? 10 : 8;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  const dim = size === 'lg' ? 220 : size === 'md' ? 175 : 140;
  const fontSize = size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-4xl' : 'text-2xl';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: dim, height: dim }}>
      <svg width={dim} height={dim} className="transform -rotate-90">
        <circle cx={dim/2} cy={dim/2} r={radius} fill="none" stroke={COLORS.bgSoft} strokeWidth={stroke} />
        <circle cx={dim/2} cy={dim/2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.2s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`${fontSize} font-bold tracking-tight`}
             style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>{score.toFixed(2)}</div>
        {size !== 'sm' && <div className="text-xs mt-1" style={{ color: COLORS.textMuted }}>de 5.00</div>}
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="px-3 py-2 rounded text-xs"
         style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.greenDeep}`,
                  boxShadow: '0 8px 24px rgba(31,34,37,0.12)' }}>
      <div className="font-semibold mb-1" style={{ color: COLORS.ink }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          <span style={{ color: COLORS.textMuted }}>{p.name}:</span>
          <span style={{ color: COLORS.ink }} className="font-semibold">
            {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================================
//  TAB · RESUMEN EJECUTIVO
// ============================================================
const TabResumen = ({ kpis = KPIs }) => (
  <div className="space-y-6">
    <SectionTitle es="Resumen Ejecutivo del Diagnóstico" en="Executive Diagnostic Summary" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard value={kpis.scoreGlobal.toFixed(2)} label="Score SCI Global"
               sublabel="Escala 0–5 · Implementado con oportunidades" accent={COLORS.amber} />
      <KPICard value={kpis.entrevistados} label="Entrevistados"
               sublabel="Niveles estratégico, directivo y operativo" accent={COLORS.greenDeep} />
      <KPICard value={kpis.macroprocesos} label="Macroprocesos Evaluados"
               sublabel="Cobertura integral del negocio" accent={COLORS.blue} />
      <KPICard value={kpis.riesgosIdentificados} label="Riesgos Identificados"
               sublabel="Clasificados por probabilidad e impacto" accent={COLORS.red} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.textMuted }}>
          Madurez del Sistema de Control Interno
        </div>
        <div className="flex flex-col items-center py-4">
          <ScoreGauge score={kpis.scoreGlobal} size="lg" />
          <div className="mt-4 text-center">
            <div className="text-base font-semibold" style={{ color: COLORS.ink }}>
              {getMaturityLabel(kpis.scoreGlobal)}
            </div>
            <div className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
              Estructura institucional frágil con bases documentales operativas
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 lg:col-span-2">
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.textMuted }}>
          Perfil de Madurez por Dimensión de Control
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={RADAR_GLOBAL} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke={COLORS.border} />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: COLORS.ink, fontSize: 12, fontWeight: 600 }} />
            <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: COLORS.textMuted, fontSize: 10 }} stroke={COLORS.border} />
            <Radar name="Score" dataKey="score" stroke={COLORS.greenDeep} fill={COLORS.green} fillOpacity={0.30} strokeWidth={2} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {SCI_DIMENSIONS.map(dim => (
        <Card key={dim.id} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
                {dim.reactivos} reactivos
              </div>
              <div className="text-base font-bold mt-1" style={{ color: COLORS.ink }}>{dim.nombre}</div>
            </div>
            <ScoreGauge score={dim.score} size="sm" />
          </div>
          <div className="text-xs leading-relaxed" style={{ color: COLORS.textMuted }}>{dim.resumen}</div>
          <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${COLORS.borderSoft}` }}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span style={{ color: COLORS.textDim }}>Diagnóstico</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold truncate" style={{ color: getMaturityColor(dim.score) }}>
                  {getMaturityLabel(dim.score)}
                </span>
                <TrafficLight score={dim.score} size="sm" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>

    <Card className="p-6">
      <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: COLORS.textMuted }}>
        Mapa de Madurez · 9 Macroprocesos del Negocio
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MACROPROCESOS.map(p => (
          <div key={p.id} className="p-4 rounded"
               style={{ backgroundColor: COLORS.bgElev, border: `1px solid ${COLORS.borderSoft}` }}>
            <div className="flex items-start justify-between mb-2">
              <div className="text-xs font-mono" style={{ color: COLORS.textMuted }}>{p.code}</div>
              <div className="px-2.5 py-1 rounded font-bold"
                   style={{
                     backgroundColor: `${getMaturityColor(p.score)}1A`,
                     color: getMaturityColor(p.score),
                     fontSize: 16,
                     lineHeight: 1,
                     fontFamily: FONT_SERIF,
                     letterSpacing: '-0.01em',
                   }}>
                {p.score.toFixed(1)}
              </div>
            </div>
            <div className="text-sm font-bold mb-3" style={{ color: COLORS.ink }}>{p.nombre}</div>
            <div className="flex items-center justify-center mb-2">
              <TrafficLight score={p.score} size="md" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: COLORS.textMuted }}>{p.riesgosTotal} riesgos</span>
              <span style={{ color: SEVERITY[p.criticidad].color }} className="font-semibold">
                {SEVERITY[p.criticidad].label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>

    <Card className="p-6" style={{ borderColor: `${COLORS.greenDeep}30`, backgroundColor: COLORS.greenTint }}>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.greenDeep }}>
            Conclusión Ejecutiva
          </div>
          <h3 className="text-xl font-bold mb-3" style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
            De un modelo de "voluntad personal" a uno de "procesos monitoreados"
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.inkSoft }}>
            El Sistema de Control Interno actual cumple con funciones administrativas básicas, pero
            no actúa como un mecanismo de blindaje patrimonial. Para evolucionar hacia la excelencia,
            la empresa debe transitar de un modelo de "voluntad personal" a uno de "procesos
            monitoreados", donde la estrategia, la dirección y la operación se alineen bajo un mismo
            esquema de rendición de cuentas y medición de resultados.
          </p>
      </div>
    </Card>
  </div>
);

// ============================================================
//  TAB · SCI (con telarañas individuales por nivel)
// ============================================================
// ============================================================
//  TAB SCI · Rediseño editorial · "Resultados de la Evaluación del SCI"
// ============================================================
const TabSCI = ({ kpis = KPIs }) => {
  const [selected, setSelected] = useState('estrategico');
  const dim = SCI_DIMENSIONS.find(d => d.id === selected);
  const radarData = dim.radarItems.map(e => ({
    elemento: e.short, fullName: e.nombre, score: e.score, fullMark: 5,
  }));
  const sortedItems = [...dim.radarItems].sort((a, b) => a.score - b.score);

  return (
    <div className="space-y-12">
      {/* ─────────────────────────────────────────────────────── */}
      {/* 01 · HERO EDITORIAL */}
      {/* ─────────────────────────────────────────────────────── */}
      <SCIHero kpis={kpis} />

      {/* ─────────────────────────────────────────────────────── */}
      {/* 02 · MAPA DE VALOR 2026 */}
      {/* ─────────────────────────────────────────────────────── */}
      <SCISection label="Diagnóstico panorámico" title="Mapa de Valor 2026"
                  subtitle="Visión integral del modelo de control.">
        <MapaValor2026 />
      </SCISection>

      {/* ─────────────────────────────────────────────────────── */}
      {/* TRINIDAD DE DIMENSIONES */}
      {/* ─────────────────────────────────────────────────────── */}
      <SCISection label="Las tres dimensiones del control"
                  title="Estratégico · Directivo · Operativo"
                  subtitle="Tres capas concéntricas de madurez. El score baja conforme se acerca a la gobernanza; sube en la operación documentada.">
        <DimensionTrinity selected={selected} onSelect={setSelected} />
      </SCISection>

      {/* ─────────────────────────────────────────────────────── */}
      {/* DEEP DIVE por dimensión */}
      {/* ─────────────────────────────────────────────────────── */}
      <SCISection label={`Detalle · ${dim.nombre}`}
                  title={`${dim.nombre} (${dim.score.toFixed(2)})`}
                  subtitle={dim.resumen}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Radar grande */}
          <Card className="p-6 lg:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: COLORS.textMuted }}>
                Telaraña · {dim.radarItems.length} ejes evaluados
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded"
                    style={{
                      backgroundColor: `${getMaturityColor(dim.score)}1A`,
                      color: getMaturityColor(dim.score),
                      letterSpacing: '0.1em',
                    }}>
                {dim.reactivos} REACTIVOS
              </span>
            </div>
            <ResponsiveContainer width="100%" height={420}>
              <RadarChart data={radarData} margin={{ top: 24, right: 70, bottom: 24, left: 70 }}>
                <PolarGrid stroke={COLORS.border} />
                <PolarAngleAxis dataKey="elemento"
                                tick={{ fill: COLORS.ink, fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={90} domain={[0, 5]}
                                 tick={{ fill: COLORS.textMuted, fontSize: 9 }}
                                 stroke={COLORS.border} />
                <Radar dataKey="score" stroke={getMaturityColor(dim.score)}
                       fill={getMaturityColor(dim.score)} fillOpacity={0.25} strokeWidth={2.5} />
                <Tooltip content={<RadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Ranking de items */}
          <Card className="p-6 lg:col-span-2">
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: COLORS.textMuted }}>
              Ranking · Más débil al más fuerte
            </div>
            <div className="space-y-2">
              {sortedItems.map((it, i) => {
                const pct = (it.score / 5) * 100;
                const c = getMaturityColor(it.score);
                return (
                  <div key={i} className="group">
                    <div className="flex items-baseline justify-between mb-1 gap-2">
                      <span className="text-[12px] font-medium leading-tight"
                            style={{ color: COLORS.ink }}>
                        {it.nombre}
                      </span>
                      <span className="text-[13px] font-bold tabular-nums whitespace-nowrap"
                            style={{ color: c, fontFamily: FONT_SERIF }}>
                        {it.score.toFixed(2)}
                      </span>
                    </div>
                    <div className="rounded-full overflow-hidden"
                         style={{ backgroundColor: COLORS.bgSoft, height: 8 }}>
                      <div className="h-full rounded-full transition-all duration-700"
                           style={{
                             width: `${pct}%`,
                             backgroundColor: c,
                             boxShadow: `0 0 10px ${c}70, inset 0 1px 0 rgba(255,255,255,0.25)`,
                           }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Síntesis */}
        <Card className="p-6 mt-6"
              style={{
                borderColor: `${getMaturityColor(dim.score)}40`,
                backgroundColor: `${getMaturityColor(dim.score)}08`,
                borderLeftWidth: 4,
              }}>
          <div className="flex items-start gap-5">
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              <ScoreGauge score={dim.score} size="md" />
            </div>
            <div className="flex-1 pt-1">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1"
                   style={{ color: getMaturityColor(dim.score) }}>
                Síntesis ejecutiva
              </div>
              <h4 className="text-xl font-bold mb-2"
                  style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
                {getMaturityLabel(dim.score)}
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: COLORS.inkSoft }}>
                {dim.resumen}
              </p>
            </div>
          </div>
        </Card>
      </SCISection>

      {/* ─────────────────────────────────────────────────────── */}
      {/* 05 · HALLAZGOS EDITORIALES */}
      {/* ─────────────────────────────────────────────────────── */}
      <SCISection label={`Principales hallazgos · ${dim.nombre}`}
                  title="El Top 5 áreas que deben mejorar lo antes posible"
                  subtitle="Hallazgos priorizados por score más bajo · acción urgente recomendada.">
        <div className="space-y-4">
          {[...dim.elementos].sort((a, b) => a.score - b.score).slice(0, 5).map((el, i) => (
            <HallazgoEditorialCard key={i} index={i + 1} hallazgo={el} />
          ))}
        </div>
      </SCISection>
    </div>
  );
};

// ============================================================
//  HERO · "Resultados de la Evaluación del SCI"
// ============================================================
const SCIHero = ({ kpis }) => {
  const sciAvg = (SCI_DIMENSIONS.reduce((s, d) => s + d.score, 0) / SCI_DIMENSIONS.length);
  const score = kpis?.scoreGlobal ?? sciAvg;
  const maturityColor = getMaturityColor(score);
  const maturityLabel = getMaturityLabel(score);
  const markerPct = Math.min(100, Math.max(0, (score / 5) * 100));

  return (
    <Card className="p-0 overflow-hidden" style={{ borderColor: COLORS.borderStrong }}>
      <div className="relative" style={{ backgroundColor: COLORS.bgCard }}>
        {/* Banda lateral roja */}
        <div className="absolute top-0 left-0 bottom-0"
             style={{ width: 6, backgroundColor: COLORS.green }} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
          {/* Lado izquierdo · Título editorial */}
          <div className="lg:col-span-3 p-10 pl-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-mono font-bold tracking-widest"
                    style={{ color: COLORS.green }}>
                ANDERSEN CONSULTING
              </span>
              <span className="w-8 h-px" style={{ backgroundColor: COLORS.green }} />
              <span className="text-[10px] font-mono tracking-widest"
                    style={{ color: COLORS.textMuted }}>
                DIAGNÓSTICO · 2026
              </span>
            </div>
            <h1 className="text-5xl font-bold leading-[1.05]"
                style={{ color: COLORS.ink, fontFamily: FONT_SERIF, letterSpacing: '-0.02em' }}>
              Resultados de la
              <br />
              Evaluación del
              <span style={{ color: COLORS.green }}> SCI</span>
            </h1>
          </div>

          {/* Lado derecho · Score & escala */}
          <div className="lg:col-span-2 p-10"
               style={{
                 backgroundColor: COLORS.bgElev,
                 borderLeft: `1px solid ${COLORS.borderSoft}`,
               }}>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2"
                 style={{ color: COLORS.textMuted }}>
              Score SCI Global
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[80px] font-bold leading-none tabular-nums"
                    style={{ color: maturityColor, fontFamily: FONT_SERIF, letterSpacing: '-0.04em' }}>
                {score.toFixed(2)}
              </span>
              <span className="text-2xl font-normal"
                    style={{ color: COLORS.textMuted, fontFamily: FONT_SERIF }}>
                /5
              </span>
            </div>
            <div className="text-sm font-semibold mb-6" style={{ color: maturityColor }}>
              {maturityLabel}
            </div>

            {/* Escala visual */}
            <div className="space-y-2">
              <div className="relative h-2 rounded-full"
                   style={{ backgroundColor: COLORS.bgSoft }}>
                <div className="absolute inset-0 rounded-full"
                     style={{
                       background: `linear-gradient(90deg,
                         ${MATURITY_LEVELS[0].color} 0%,
                         ${MATURITY_LEVELS[1].color} 20%,
                         ${MATURITY_LEVELS[2].color} 40%,
                         ${MATURITY_LEVELS[3].color} 60%,
                         ${MATURITY_LEVELS[4].color} 80%,
                         ${MATURITY_LEVELS[5].color} 100%)`,
                       opacity: 0.35,
                     }} />
                {/* Marker */}
                <div className="absolute -top-1.5"
                     style={{
                       left: `calc(${markerPct}% - 8px)`,
                       width: 16, height: 16, borderRadius: '50%',
                       backgroundColor: COLORS.bgCard,
                       border: `3px solid ${maturityColor}`,
                       boxShadow: `0 0 0 3px ${COLORS.bgElev}, 0 2px 8px ${maturityColor}80`,
                     }} />
              </div>
              <div className="flex justify-between text-[9px] font-mono"
                   style={{ color: COLORS.textDim, letterSpacing: '0.05em' }}>
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Card>
  );
};

// ============================================================
//  SECTION HEADER · numerada, editorial
// ============================================================
const SCISection = ({ label, title, subtitle, children }) => (
  <section>
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1.5">
        <span className="w-6 h-px" style={{ backgroundColor: COLORS.green }} />
        <span className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: COLORS.green }}>
          {label}
        </span>
      </div>
      <h3 className="text-2xl font-bold leading-tight mb-1.5"
          style={{ color: COLORS.ink, fontFamily: FONT_SERIF, letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm leading-relaxed max-w-3xl"
           style={{ color: COLORS.textMuted, fontFamily: FONT_SERIF, fontStyle: 'italic' }}>
          {subtitle}
        </p>
      )}
    </div>
    {children}
  </section>
);

// ============================================================
//  MAPA DE VALOR 2026 · Matriz interactiva
// ============================================================
const MapaValor2026 = () => {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null); // { item, categoria, bloque, grupo }

  // Counts por status para resumen
  const counts = MAPA_VALOR_2026.reduce((acc, row) => {
    row.items.forEach(it => { acc[it.status] = (acc[it.status] || 0) + 1; });
    return acc;
  }, {});
  const total = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <div className="space-y-4">
      {/* Leyenda + resumen */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {['critical', 'high', 'medium', 'low'].map(k => {
              const c = MAPA_STATUS[k];
              const n = counts[k] || 0;
              const pct = total > 0 ? Math.round((n / total) * 100) : 0;
              return (
                <div key={k} className="flex items-center gap-2 px-3 py-1.5 rounded"
                     style={{ backgroundColor: c.bg, border: `1px solid ${c.color}30` }}>
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
                  <span className="text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: c.color }}>
                    {c.label}
                  </span>
                  <span className="text-[11px] tabular-nums font-bold"
                        style={{ color: c.color }}>
                    {n} · {pct}%
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] uppercase tracking-widest font-bold"
               style={{ color: COLORS.textMuted }}>
            {total} ítems evaluados
          </div>
        </div>
      </Card>

      {/* Matriz */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 980 }}>
            {(() => {
              const grupos = [
                { label: 'Sustentabilidad', filter: r => r.bloque === 'Sustentabilidad' },
                { label: 'Crecimiento',     filter: r => r.bloque === 'Crecimiento' },
                { label: 'Operación del Consejo', filter: r => r.bloque === 'Operación del Consejo' },
              ];
              return grupos.map((g, gi) => {
                const rows = MAPA_VALOR_2026.filter(g.filter);
                if (rows.length === 0) return null;
                return (
                  <div key={gi}
                       style={{
                         borderTop: gi > 0 ? `2px solid ${COLORS.border}` : 'none',
                       }}>
                    {/* Banda del bloque */}
                    <div className="px-5 py-2.5 flex items-center justify-between"
                         style={{
                           backgroundColor: COLORS.ink,
                           color: COLORS.bgCard,
                         }}>
                      <span className="text-[10px] font-bold uppercase tracking-widest"
                            style={{ letterSpacing: '0.2em' }}>
                        {g.label}
                      </span>
                      <span className="text-[10px] font-mono tracking-widest opacity-70">
                        {rows.length} categoría{rows.length > 1 ? 's' : ''} · {rows.reduce((s, r) => s + r.items.length, 0)} ítems
                      </span>
                    </div>

                    {rows.map((row, ri) => (
                      <div key={ri} className="grid"
                           style={{
                             gridTemplateColumns: '220px 1fr',
                             borderTop: ri > 0 ? `1px solid ${COLORS.borderSoft}` : 'none',
                           }}>
                        {/* Categoría */}
                        <div className="px-5 py-4 flex items-center"
                             style={{
                               backgroundColor: COLORS.bgElev,
                               borderRight: `1px solid ${COLORS.border}`,
                             }}>
                          <div>
                            <div className="text-[10px] font-mono uppercase tracking-widest mb-1"
                                 style={{ color: COLORS.textDim }}>
                              {String(ri + 1).padStart(2, '0')}
                            </div>
                            <div className="text-[12px] font-bold leading-tight"
                                 style={{ color: COLORS.ink }}>
                              {row.categoria}
                            </div>
                          </div>
                        </div>

                        {/* Cells */}
                        <div className="grid grid-cols-6 gap-px"
                             style={{ backgroundColor: COLORS.border }}>
                          {row.items.map((it, ii) => {
                            const c = MAPA_STATUS[it.status];
                            const cellId = `${gi}-${ri}-${ii}`;
                            const isHov = hovered === cellId;
                            const isSel = selected && selected.cellId === cellId;
                            return (
                              <button
                                type="button"
                                key={ii}
                                onMouseEnter={() => setHovered(cellId)}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => setSelected({
                                  cellId,
                                  item: it,
                                  categoria: row.categoria,
                                  bloque: row.bloque,
                                  grupo: row.grupo,
                                })}
                                className="relative px-3 py-2 text-left cursor-pointer transition-all"
                                style={{
                                  backgroundColor: isHov || isSel ? c.color : c.bg,
                                  color: isHov || isSel ? COLORS.bgCard : c.color,
                                  minHeight: 62,
                                  outline: isSel ? `2px solid ${COLORS.ink}` : 'none',
                                  outlineOffset: -2,
                                }}
                                title={`${it.label} · clic para detalle`}
                              >
                                <div className="text-[10px] leading-tight font-semibold pr-10"
                                     style={{ opacity: isHov || isSel ? 1 : 0.95 }}>
                                  {it.label}
                                </div>
                                <div className="absolute bottom-1.5 right-2 text-[8px] font-mono font-bold uppercase tracking-widest"
                                     style={{ opacity: isHov || isSel ? 0.85 : 0.4 }}>
                                  {c.label}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </Card>

      {selected && (
        <MapaValorDetalle
          selected={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

// ============================================================
//  PANEL · Detalle de celda del Mapa de Valor (con explicación IA)
// ============================================================
const MapaValorDetalle = ({ selected, onClose }) => {
  const { item, categoria, bloque, grupo } = selected;
  const c = MAPA_STATUS[item.status];

  const handleExportPdf = () => {
    const panel = document.getElementById('mapa-valor-export-target');
    if (!panel) return;

    const originalParent = panel.parentNode;
    const placeholder = document.createComment('mapa-valor-panel-placeholder');
    originalParent.insertBefore(placeholder, panel);
    document.body.appendChild(panel);
    document.body.classList.add('printing-mapa-valor');

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      document.body.classList.remove('printing-mapa-valor');
      if (placeholder.parentNode) {
        placeholder.parentNode.insertBefore(panel, placeholder);
        placeholder.remove();
      }
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(() => {
      window.print();
      // Safety net: some browsers don't fire afterprint reliably
      setTimeout(cleanup, 1000);
    }, 50);
  };

  return (
    <div className="fixed inset-0" style={{ zIndex: 100 }}>
      <div
        onClick={onClose}
        className="no-print"
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(20,20,20,0.45)',
          backdropFilter: 'blur(2px)',
        }}
      />
      <aside
        id="mapa-valor-export-target"
        className="mapa-valor-export-target absolute right-0 top-0 h-full flex flex-col"
        style={{
          width: 'min(480px, 96vw)',
          backgroundColor: COLORS.bgCard,
          borderLeft: `4px solid ${c.color}`,
          boxShadow: '-12px 0 32px rgba(0,0,0,0.25)',
        }}
      >
        <header
          className="px-6 py-4 flex items-start justify-between gap-3"
          style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bgElev }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest"
                    style={{ color: COLORS.textMuted }}>
                {bloque}
              </span>
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: COLORS.textDim }} />
              <span className="text-[9px] font-mono uppercase tracking-widest"
                    style={{ color: COLORS.textMuted }}>
                {categoria}
              </span>
            </div>
            <h3 className="text-lg font-bold leading-tight mb-2"
                style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
              {item.label}
            </h3>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded"
                 style={{ backgroundColor: c.bg, border: `1px solid ${c.color}40` }}>
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: c.color }} />
              <span className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: c.color, letterSpacing: '0.16em' }}>
                {c.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 no-print">
            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 transition-all"
              style={{
                backgroundColor: COLORS.green,
                color: COLORS.bgCard,
                padding: '7px 12px',
                fontFamily: FONT_SANS,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                borderRadius: 3,
                border: `1px solid ${COLORS.greenInk}`,
                cursor: 'pointer',
                boxShadow: `0 1px 3px ${COLORS.green}40`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.greenInk; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.green; }}
              title="Exportar este box a PDF"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Exportar PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: 6, borderRadius: 4, lineHeight: 0,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.bgCard, cursor: 'pointer',
              }}
              aria-label="Cerrar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.ink}
                   strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2"
               style={{ color: c.color }}>
            ¿Por qué está en {c.label}?
          </div>

          <p className="text-[15px] leading-relaxed"
             style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
            {item.explicacion}
          </p>

          {/* Plan de Trabajo */}
          {item.plan && (
            <div className="mt-8 pt-6"
                 style={{ borderTop: `1px solid ${COLORS.borderSoft}` }}>
              <div className="flex items-center gap-2 mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.green}
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <h4 className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: COLORS.green, letterSpacing: '0.18em' }}>
                  Plan de trabajo
                </h4>
              </div>

              <div className="space-y-4">
                {[
                  { label: '0–30 días', phase: 'Diagnóstico y setup', items: item.plan[0] },
                  { label: '30–60 días', phase: 'Diseño e implementación', items: item.plan[1] },
                  { label: '60–90 días', phase: 'Despliegue y validación', items: item.plan[2] },
                ].map((bloque, bi) => (
                  <div key={bi} className="relative pl-7">
                    {/* Línea vertical de timeline */}
                    {bi < 2 && (
                      <div className="absolute"
                           style={{
                             left: 11, top: 22, bottom: -16, width: 2,
                             backgroundColor: COLORS.borderSoft,
                           }} />
                    )}
                    {/* Bullet/timeline node */}
                    <div className="absolute flex items-center justify-center"
                         style={{
                           left: 0, top: 2,
                           width: 24, height: 24,
                           borderRadius: '50%',
                           backgroundColor: c.color,
                           color: COLORS.bgCard,
                           fontSize: 10,
                           fontWeight: 700,
                           fontFamily: FONT_SERIF,
                           boxShadow: `0 0 0 3px ${COLORS.bgCard}, 0 0 0 4px ${c.color}40`,
                         }}>
                      {bi + 1}
                    </div>

                    <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
                      <span className="text-[12px] font-bold tabular-nums"
                            style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
                        {bloque.label}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest"
                            style={{ color: COLORS.textMuted, letterSpacing: '0.12em' }}>
                        · {bloque.phase}
                      </span>
                    </div>

                    <ul className="space-y-1">
                      {bloque.items.map((accion, ai) => (
                        <li key={ai} className="flex items-start gap-2 text-[12px] leading-snug"
                            style={{ color: COLORS.inkSoft }}>
                          <span className="mt-1.5 flex-shrink-0"
                                style={{
                                  width: 4, height: 4, borderRadius: '50%',
                                  backgroundColor: c.color,
                                }} />
                          <span>{accion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta footer */}
          <div className="mt-8 pt-5 grid grid-cols-2 gap-4"
               style={{ borderTop: `1px solid ${COLORS.borderSoft}` }}>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest mb-1"
                   style={{ color: COLORS.textMuted }}>
                Bloque
              </div>
              <div className="text-xs font-semibold" style={{ color: COLORS.ink }}>
                {bloque}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest mb-1"
                   style={{ color: COLORS.textMuted }}>
                Categoría
              </div>
              <div className="text-xs font-semibold" style={{ color: COLORS.ink }}>
                {categoria}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-[9px] font-bold uppercase tracking-widest mb-1"
                   style={{ color: COLORS.textMuted }}>
                Grupo
              </div>
              <div className="text-xs font-semibold" style={{ color: COLORS.ink }}>
                {grupo}
              </div>
            </div>
          </div>
        </div>

        <footer
          className="px-6 py-3 text-[9px] tracking-widest uppercase"
          style={{
            borderTop: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.bgElev,
            color: COLORS.textMuted,
            fontFamily: FONT_SANS,
            letterSpacing: '0.18em',
          }}
        >
          Mapa de Valor 2026 · Andersen Consulting
        </footer>
      </aside>
    </div>
  );
};

// ============================================================
//  TRINIDAD DE DIMENSIONES · 3 cards grandes side-by-side
// ============================================================
const DimensionTrinity = ({ selected, onSelect }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    {SCI_DIMENSIONS.map((d, i) => {
      const isSelected = d.id === selected;
      const c = getMaturityColor(d.score);
      return (
        <button
          key={d.id}
          onClick={() => onSelect(d.id)}
          className="text-left p-6 transition-all duration-300 group"
          style={{
            backgroundColor: COLORS.bgCard,
            border: `1px solid ${isSelected ? c : COLORS.border}`,
            borderRadius: 6,
            boxShadow: isSelected
              ? `0 8px 24px ${c}25, 0 0 0 1px ${c}30`
              : '0 1px 2px rgba(31,34,37,0.04)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.boxShadow = `0 4px 12px ${c}20`;
              e.currentTarget.style.borderColor = `${c}80`;
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(31,34,37,0.04)';
              e.currentTarget.style.borderColor = COLORS.border;
            }
          }}
        >
          {/* Top stripe */}
          <div className="absolute top-0 left-0 right-0"
               style={{ height: 4, backgroundColor: c }} />

          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1"
                   style={{ color: c }}>
                NIVEL {String(i + 1).padStart(2, '0')}
              </div>
              <div className="text-xl font-bold leading-tight"
                   style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
                {d.nombre}
              </div>
            </div>
            <TrafficLight score={d.score} size="md" />
          </div>

          {/* Score */}
          <div className="mb-4">
            <div className="text-[64px] font-bold leading-none tabular-nums"
                 style={{ color: c, fontFamily: FONT_SERIF, letterSpacing: '-0.03em' }}>
              {d.score.toFixed(2)}
            </div>
            <div className="text-[10px] mt-1" style={{ color: COLORS.textDim }}>
              / 5.00
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 flex items-center justify-between"
               style={{ borderTop: `1px solid ${COLORS.borderSoft}` }}>
            <div className="text-[11px]" style={{ color: COLORS.textMuted }}>
              <span className="font-bold tabular-nums" style={{ color: COLORS.ink }}>
                {d.reactivos}
              </span> reactivos · <span className="font-bold tabular-nums" style={{ color: COLORS.ink }}>
                {d.radarItems.length}
              </span> ejes
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest"
                 style={{ color: isSelected ? c : COLORS.textMuted }}>
              {isSelected ? '● Seleccionado' : 'Ver detalle →'}
            </div>
          </div>
        </button>
      );
    })}
  </div>
);

// ============================================================
//  HALLAZGO EDITORIAL CARD
// ============================================================
const HallazgoEditorialCard = ({ index, hallazgo: el }) => {
  const sev = SEVERITY[el.criticidad];
  const c = getMaturityColor(el.score);
  return (
    <Card className="p-0 overflow-hidden" style={{ borderColor: COLORS.borderStrong }}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Score side */}
        <div className="lg:col-span-3 p-5 flex flex-col items-center justify-center text-center"
             style={{
               backgroundColor: `${c}10`,
               borderRight: `1px solid ${COLORS.borderSoft}`,
             }}>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3"
               style={{ color: c, opacity: 0.7 }}>
            Hallazgo · {String(index).padStart(2, '0')}
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-[56px] font-bold leading-none tabular-nums"
                 style={{ color: c, fontFamily: FONT_SERIF, letterSpacing: '-0.04em' }}>
              {el.score.toFixed(2)}
            </div>
            <TrafficLight score={el.score} size="md" />
          </div>
          <div className="text-[10px] mb-3" style={{ color: COLORS.textMuted }}>
            / 5.00
          </div>
          <div className="text-[10px] px-3 py-1 rounded font-bold uppercase tracking-widest"
               style={{
                 backgroundColor: sev.bg,
                 color: sev.color,
                 border: `1px solid ${sev.border}`,
               }}>
            {sev.label}
          </div>
        </div>

        {/* Content side */}
        <div className="lg:col-span-9 p-6">
          <h4 className="text-xl font-bold leading-tight mb-4"
              style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
            {el.nombre}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-px" style={{ backgroundColor: COLORS.green }} />
                <span className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: COLORS.green }}>
                  Hallazgo
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: COLORS.inkSoft }}>
                {el.hallazgo}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-px" style={{ backgroundColor: COLORS.amber }} />
                <span className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: COLORS.amber }}>
                  Impacto al negocio
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: COLORS.inkSoft }}>
                {el.impacto}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Custom tick · parte texto largo en líneas múltiples (radar legible)
const WrappedRadarTick = ({ payload, x, y, textAnchor }) => {
  const text = String(payload?.value || '');
  const maxLineChars = 18;
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const tentative = current ? `${current} ${word}` : word;
    if (tentative.length > maxLineChars && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = tentative;
    }
  }
  if (current) lines.push(current);
  if (lines.length > 3) {
    lines.splice(3);
    lines[2] = lines[2].slice(0, maxLineChars - 1) + '…';
  }
  return (
    <text x={x} y={y} textAnchor={textAnchor}
          style={{ fill: COLORS.ink, fontSize: 13, fontWeight: 700, fontFamily: FONT_SANS }}>
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 15}>{line}</tspan>
      ))}
    </text>
  );
};

// Tooltip customizado para el radar que muestra el nombre completo
const RadarTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const c = getMaturityColor(data.score);
  return (
    <div className="px-3 py-2 rounded shadow-lg"
         style={{
           backgroundColor: COLORS.bgCard,
           border: `1px solid ${COLORS.borderStrong}`,
           maxWidth: 260,
         }}>
      <div className="text-[11px] font-bold leading-tight mb-1"
           style={{ color: COLORS.ink }}>
        {data.fullName || data.elemento}
      </div>
      <div className="text-lg font-bold tabular-nums"
           style={{ color: c, fontFamily: FONT_SERIF }}>
        {data.score.toFixed(2)}
        <span className="text-[10px] font-normal ml-1"
              style={{ color: COLORS.textMuted, fontFamily: FONT_SANS }}>
          / 5.00
        </span>
      </div>
    </div>
  );
};

// ============================================================
//  COMPONENTE REUSABLE · VISTA DETALLADA DE MACROPROCESO
// ============================================================
const MacroprocesoView = ({ proc }) => {
  const radarData = proc.subprocesos.map(sp => ({
    subproceso: sp.nombre,
    score: sp.score, fullMark: 5,
  }));
  const totalActividades = proc.subprocesos.reduce(
    (acc, sp) => acc + sp.grupos.reduce((a, g) => a + g.actividades.length, 0), 0);

  return (
    <div className="space-y-6">
      <SectionTitle es={proc.nombre} en={`Process ${proc.code} · Detailed Diagnostic`} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard value={proc.score.toFixed(2)} label="Score del Macroproceso"
                 sublabel={getMaturityLabel(proc.score)} accent={getMaturityColor(proc.score)} />
        <KPICard value={proc.subprocesos.length} label="Subprocesos Nivel 2"
                 sublabel={`${totalActividades} actividades evaluadas`} accent={COLORS.blue} />
        <KPICard value={proc.riesgosTotal} label="Riesgos Identificados"
                 sublabel={`Criticidad ${SEVERITY[proc.criticidad].label.toLowerCase()}`}
                 accent={SEVERITY[proc.criticidad].color} />
        <KPICard value={proc.code} label="Código del Macroproceso"
                 sublabel="Framework Andersen Consulting" accent={COLORS.greenDeep} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="p-6 lg:col-span-3">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.textMuted }}>
            Telaraña de Madurez · Subprocesos
          </div>
          <ResponsiveContainer width="100%" height={420}>
            <RadarChart data={radarData} margin={{ top: 40, right: 120, bottom: 40, left: 120 }}>
              <PolarGrid stroke={COLORS.border} />
              <PolarAngleAxis dataKey="subproceso" tick={<WrappedRadarTick />} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: COLORS.textMuted, fontSize: 10 }} stroke={COLORS.border} />
              <Radar name="Score" dataKey="score" stroke={getMaturityColor(proc.score)}
                     fill={getMaturityColor(proc.score)} fillOpacity={0.25} strokeWidth={2.5} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 lg:col-span-2 flex flex-col"
              style={{ borderColor: `${getMaturityColor(proc.score)}30` }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.textMuted }}>
            Diagnóstico del Macroproceso
          </div>
          <div className="flex flex-col items-center flex-1 justify-center">
            <ScoreGauge score={proc.score} size="md" />
            <div className="mt-4 text-center flex flex-col items-center gap-2">
              <TrafficLight score={proc.score} size="md" />
              <div className="text-sm font-bold" style={{ color: getMaturityColor(proc.score) }}>
                {getMaturityLabel(proc.score)}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 text-xs leading-relaxed"
               style={{ color: COLORS.inkSoft, borderTop: `1px solid ${COLORS.borderSoft}` }}>
            {proc.descripcion}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.textMuted }}>
          Madurez por Subproceso
        </div>
        <ResponsiveContainer width="100%" height={Math.max(240, proc.subprocesos.length * 55)}>
          <BarChart data={proc.subprocesos} layout="vertical" margin={{ top: 10, right: 50, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderSoft} horizontal={false} />
            <XAxis type="number" domain={[0, 5]} tick={{ fill: COLORS.textMuted, fontSize: 11 }} stroke={COLORS.border} />
            <YAxis type="category" dataKey="nombre" tick={{ fill: COLORS.ink, fontSize: 11 }}
                   stroke={COLORS.border} width={200} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(113,178,72,0.08)' }} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {proc.subprocesos.map((s, i) => <Cell key={i} fill={getBarColor(s.score)} />)}
              <LabelList dataKey="score" position="right" formatter={(v) => v.toFixed(2)}
                         style={{ fill: COLORS.ink, fontSize: 11, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
            Detalle por Subproceso · {proc.subprocesos.length} áreas
          </div>
          <button
            type="button"
            onClick={() => printAllWorkPlans(proc.code)}
            className="no-print inline-flex items-center gap-2 transition-all"
            style={{
              backgroundColor: COLORS.green,
              color: COLORS.bgCard,
              padding: '9px 16px',
              fontFamily: FONT_SANS,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              borderRadius: 3,
              border: `1px solid ${COLORS.greenInk}`,
              cursor: 'pointer',
              boxShadow: `0 2px 6px ${COLORS.green}40`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.greenInk; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.green; }}
            title="Exportar todos los planes de trabajo del macroproceso a PDF"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>Imprimir Planes de Trabajo</span>
          </button>
        </div>
        {proc.subprocesos.map((sp, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="p-5"
                 style={{ borderBottom: `1px solid ${COLORS.borderSoft}`, backgroundColor: COLORS.bgElev }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <div className="text-xs font-mono px-2 py-0.5 rounded"
                         style={{ backgroundColor: COLORS.greenTint, color: COLORS.greenDeep,
                                  border: `1px solid ${COLORS.greenDeep}30` }}>
                      {proc.code}.{sp.id.split('.')[1]}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: getMaturityColor(sp.score) }}>
                      {sp.status}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>{sp.nombre}</h3>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wider" style={{ color: COLORS.textMuted }}>Score</div>
                    <div className="text-2xl font-bold" style={{ color: getMaturityColor(sp.score) }}>
                      {sp.score.toFixed(1)}
                    </div>
                  </div>
                  <TrafficLight score={sp.score} size="md" />
                </div>
              </div>
              <div className="text-xs italic leading-relaxed pt-1" style={{ color: COLORS.inkSoft }}>
                <span className="font-semibold not-italic" style={{ color: COLORS.greenDeep }}>Enfoque · </span>
                {sp.enfoque}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
              <div className="p-5 lg:col-span-3" style={{ borderRight: `1px solid ${COLORS.borderSoft}` }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: COLORS.greenDeep }}>
                  Actividades Operativas · Nivel 3
                </div>
                <div className="space-y-5">
                  {sp.grupos.map((g, gi) => {
                    // Count por status (solo si las actividades son objetos con status)
                    const counts = g.actividades.reduce((acc, a) => {
                      if (a && typeof a === 'object' && a.status) {
                        acc[a.status] = (acc[a.status] || 0) + 1;
                      }
                      return acc;
                    }, {});
                    const hasStatus = Object.keys(counts).length > 0;
                    return (
                      <div key={gi}>
                        {/* Header de grupo L2 */}
                        <div className="flex items-center justify-between mb-2.5 gap-3 flex-wrap">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-1 h-5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS.greenDeep }} />
                            {g.id && (
                              <span className="text-[11px] font-mono font-bold tabular-nums px-1.5 py-0.5 rounded flex-shrink-0"
                                    style={{ backgroundColor: COLORS.greenTint, color: COLORS.greenDeep,
                                             border: `1px solid ${COLORS.greenDeep}30` }}>
                                {g.id}
                              </span>
                            )}
                            <span className="text-sm font-bold leading-tight" style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
                              {g.titulo}
                            </span>
                          </div>
                          {hasStatus && (
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {['critical', 'high', 'medium', 'low'].map(k => {
                                const n = counts[k] || 0;
                                if (n === 0) return null;
                                const c = MAPA_STATUS[k];
                                return (
                                  <span key={k} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
                                        style={{ backgroundColor: c.bg, border: `1px solid ${c.color}40` }}>
                                    <span className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: c.color }} />
                                    <span className="text-[10px] font-bold tabular-nums" style={{ color: c.color }}>
                                      {n}
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Actividades L3 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                          {g.actividades.map((a, ai) => {
                            const isObj = a && typeof a === 'object' && a.status;
                            if (!isObj) {
                              // Fallback string (otros macroprocesos)
                              return (
                                <div key={ai} className="flex items-start gap-2 text-xs px-2 py-1.5"
                                     style={{ color: COLORS.inkSoft }}>
                                  <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                                       style={{ backgroundColor: COLORS.textMuted }} />
                                  <span className="leading-relaxed">{a}</span>
                                </div>
                              );
                            }
                            const c = MAPA_STATUS[a.status];
                            return (
                              <div key={ai} className="rounded overflow-hidden flex items-stretch transition-all"
                                   style={{
                                     backgroundColor: c.bg,
                                     border: `1px solid ${c.color}30`,
                                   }}
                                   title={`${a.id} · ${a.nombre} · ${c.label}`}>
                                <div style={{ width: 4, backgroundColor: c.color, flexShrink: 0 }} />
                                <div className="flex-1 min-w-0 px-2.5 py-1.5 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="text-[10px] font-mono font-bold tabular-nums flex-shrink-0"
                                          style={{ color: c.color, minWidth: 32 }}>
                                      {a.id}
                                    </span>
                                    <span className="text-[11px] leading-tight" style={{ color: COLORS.ink }}>
                                      {a.nombre}
                                    </span>
                                  </div>
                                  <span className="text-[8px] font-bold uppercase tracking-widest flex-shrink-0"
                                        style={{ color: c.color, letterSpacing: '0.14em' }}>
                                    {c.label}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 lg:col-span-2" style={{ backgroundColor: COLORS.bgElev }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-3"
                     style={{ color: COLORS.red }}>
                  Riesgos del Subproceso · {sp.riesgos.length}
                </div>
                <div className="space-y-3">
                  {sp.riesgos.map((r, ri) => (
                    <div key={ri} className="p-3 rounded"
                         style={{ backgroundColor: COLORS.redTint, border: `1px solid ${SEVERITY.critical.border}` }}>
                      <div className="flex items-start gap-2 mb-1">
                        <div className="text-xs font-mono font-bold mt-0.5"
                             style={{ color: COLORS.red, minWidth: 26 }}>
                          R{String(ri + 1).padStart(2, '0')}
                        </div>
                        <div className="text-xs font-bold leading-tight" style={{ color: COLORS.ink }}>
                          {r.nombre}
                        </div>
                      </div>
                      <div className="text-xs leading-relaxed pl-7" style={{ color: COLORS.inkSoft }}>
                        {r.desc}
                      </div>
                      <RiskActionPlan riskName={r.nombre} plan={r.plan} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Documento imprimible (oculto en pantalla, visible solo en print) */}
      <WorkPlansPrintable proc={proc} />
    </div>
  );
};

// ============================================================
//  PRINT · Trigger global para imprimir todos los planes
// ============================================================
function printAllWorkPlans(procCode) {
  const target = document.getElementById(`work-plans-print-${procCode}`);
  if (!target) return;

  const originalParent = target.parentNode;
  const placeholder = document.createComment(`work-plans-placeholder-${procCode}`);
  originalParent.insertBefore(placeholder, target);
  document.body.appendChild(target);

  document.body.classList.add('printing-work-plans');
  target.dataset.printActive = '1';

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    document.body.classList.remove('printing-work-plans');
    delete target.dataset.printActive;
    if (placeholder.parentNode) {
      placeholder.parentNode.insertBefore(target, placeholder);
      placeholder.remove();
    }
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  setTimeout(() => {
    window.print();
    setTimeout(cleanup, 1000);
  }, 50);
}

// ============================================================
//  DOCUMENTO IMPRIMIBLE · Todos los planes de trabajo del macroproceso
// ============================================================
const WorkPlansPrintable = ({ proc }) => {
  const fases = [
    { label: '0–30 días', titulo: 'Diagnóstico y Línea Base', color: '#A6192E', tint: '#FAEFF1' },
    { label: '31–60 días', titulo: 'Diseño e Implementación', color: '#C68214', tint: '#FBF3DC' },
    { label: '61–90 días', titulo: 'Despliegue y Medición',   color: '#2B5A35', tint: '#E4ECDF' },
  ];

  const genericPlan = (riskName) => [
    [
      `Mapear stakeholders y dueños de proceso afectados por "${riskName}"`,
      'Levantar línea base cuantitativa del impacto actual (frecuencia, costo, exposición)',
      'Definir KPI de mitigación y meta a 90 días',
      'Asignar responsable ejecutivo y patrocinador del plan',
    ],
    [
      `Diseñar control, política o procedimiento específico para mitigar "${riskName}"`,
      'Capacitar al equipo operativo en el nuevo protocolo y matriz de facultades',
      'Pilotar el control en el área de mayor exposición durante 2 semanas',
      'Documentar evidencia en el Sistema de Control Interno (SCI)',
    ],
    [
      'Escalar el control al 100% de los procesos y áreas afectadas',
      'Auditoría interna del control implementado y ajuste de desviaciones',
      'Medir KPI de mitigación vs. línea base y reportar a la Junta de Consejo',
      'Integrar el indicador al tablero de control mensual',
    ],
  ];

  const totalRiesgos = proc.subprocesos.reduce((s, sp) => s + sp.riesgos.length, 0);

  return (
    <div
      id={`work-plans-print-${proc.code}`}
      className="work-plans-printable"
      aria-hidden="true"
      style={{ display: 'none' }}
    >
      <div style={{ padding: '8mm 0', fontFamily: FONT_SANS, color: COLORS.ink }}>
        {/* Portada compacta */}
        <div style={{
          borderTop: `4px solid ${COLORS.green}`,
          borderBottom: `1px solid ${COLORS.border}`,
          paddingTop: 12, paddingBottom: 12, marginBottom: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.18em', color: COLORS.green }}>
              ANDERSEN CONSULTING · PLANES DE TRABAJO
            </span>
          </div>
          <h1 style={{
            fontSize: 26, fontFamily: FONT_SERIF, fontWeight: 700, lineHeight: 1.1,
            color: COLORS.ink, margin: '6px 0 6px',
          }}>
            {proc.code} · {proc.nombre}
          </h1>
          <div style={{ fontSize: 11, color: COLORS.textMuted, fontStyle: 'italic', fontFamily: FONT_SERIF }}>
            {proc.subprocesos.length} subprocesos · {totalRiesgos} riesgos priorizados · Plan 0–90 días
          </div>
        </div>

        {/* Cada subproceso con sus 2 riesgos y planes */}
        {proc.subprocesos.map((sp, spi) => (
          <div key={spi}
               className="work-plan-subproc"
               style={{
                 marginBottom: 22,
                 pageBreakInside: 'avoid',
                 breakInside: 'avoid',
               }}>
            {/* Header subproceso */}
            <div style={{
              backgroundColor: COLORS.ink,
              color: COLORS.bgCard,
              padding: '8px 12px',
              marginBottom: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.16em', opacity: 0.7 }}>
                    {proc.code}.{sp.id.split('.')[1]}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 10, fontFamily: FONT_SERIF }}>
                    {sp.nombre}
                  </span>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                  padding: '3px 8px', borderRadius: 2,
                  backgroundColor: getMaturityColor(sp.score), color: COLORS.bgCard,
                }}>
                  Score {sp.score.toFixed(2)} · {sp.status}
                </span>
              </div>
            </div>

            {/* Cada riesgo */}
            {sp.riesgos.map((r, ri) => {
              const plan = Array.isArray(r.plan) && r.plan.length === 3 ? r.plan : genericPlan(r.nombre);
              return (
                <div key={ri} style={{
                  marginBottom: 14,
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  border: `1px solid ${COLORS.border}`,
                  borderLeft: `4px solid ${COLORS.red}`,
                  padding: '10px 12px',
                  backgroundColor: '#FFFFFF',
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: COLORS.red }}>
                      R{String(ri + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, fontFamily: FONT_SERIF }}>
                      {r.nombre}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: COLORS.inkSoft, lineHeight: 1.45, marginBottom: 10 }}>
                    {r.desc}
                  </div>

                  {/* Plan en 3 fases · grid horizontal */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 8,
                  }}>
                    {fases.map((f, fi) => (
                      <div key={fi} style={{
                        backgroundColor: f.tint,
                        border: `1px solid ${f.color}40`,
                        padding: '6px 8px',
                      }}>
                        <div style={{
                          fontSize: 8, fontFamily: 'monospace', fontWeight: 700,
                          letterSpacing: '0.14em', textTransform: 'uppercase',
                          color: COLORS.bgCard, backgroundColor: f.color,
                          padding: '2px 6px', display: 'inline-block', marginBottom: 4,
                        }}>
                          Fase · {f.label}
                        </div>
                        <div style={{
                          fontSize: 8, fontWeight: 700, color: f.color,
                          letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4,
                        }}>
                          {f.titulo}
                        </div>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                          {(plan[fi] || []).map((a, ai) => (
                            <li key={ai} style={{
                              display: 'flex', alignItems: 'flex-start', gap: 4,
                              fontSize: 9, lineHeight: 1.35, marginBottom: 3,
                              color: COLORS.inkSoft,
                            }}>
                              <span style={{
                                display: 'inline-block', flexShrink: 0, marginTop: 4,
                                width: 6, height: 6, border: `1.2px solid ${f.color}`,
                                backgroundColor: COLORS.bgCard, borderRadius: 1,
                              }} />
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Footer */}
        <div style={{
          marginTop: 14, paddingTop: 10,
          borderTop: `2px solid ${COLORS.green}`,
          fontSize: 9, color: COLORS.textMuted,
          fontFamily: FONT_SANS, letterSpacing: '0.16em', textTransform: 'uppercase',
          textAlign: 'center',
        }}>
          Andersen Consulting · Powered by AXON B2B
        </div>
      </div>
    </div>
  );
};

// ============================================================
//  TAB · MATRIZ DE RIESGOS
// ============================================================
const TabRiesgos = () => {
  const total = RIESGOS_POR_CATEGORIA.reduce((s, r) => s + r.cantidad, 0);
  const [selectedCell, setSelectedCell] = useState(null);
  const cellDetail = selectedCell
    ? HEATMAP_RIESGOS.find(c => c.p === selectedCell.p && c.i === selectedCell.i)
    : null;
  return (
    <div className="space-y-6">
      <SectionTitle es="Matriz de Riesgos Empresariales"
                    en="Enterprise Risk Matrix · 127 Identified Risks" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard value={total} label="Riesgos Identificados"
                 sublabel="Cobertura integral 9 macroprocesos" accent={COLORS.red} />
        <KPICard value="32" label="Críticos / Altos"
                 sublabel="Atención inmediata · Fase 1" accent={COLORS.amber} />
        <KPICard value="60%" label="Mitigables 0–6 meses"
                 sublabel="Con instrumentación de SCI" accent={COLORS.greenDeep} />
        <KPICard value="8" label="Categorías de Riesgo"
                 sublabel="Operativos, financieros, fiscales y más" accent={COLORS.blue} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: COLORS.textMuted }}>
            Distribución por Categoría
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={RIESGOS_POR_CATEGORIA} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderSoft} horizontal={false} />
              <XAxis type="number" tick={{ fill: COLORS.textMuted, fontSize: 11 }} stroke={COLORS.border} />
              <YAxis type="category" dataKey="categoria" tick={{ fill: COLORS.ink, fontSize: 12 }}
                     stroke={COLORS.border} width={110} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(113,178,72,0.08)' }} />
              <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                {RIESGOS_POR_CATEGORIA.map((r, i) => <Cell key={i} fill={r.color} />)}
                <LabelList dataKey="cantidad" position="right"
                           style={{ fill: COLORS.ink, fontSize: 11, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: COLORS.textMuted }}>
            Mapa de Calor · Probabilidad × Impacto
          </div>
          <div className="grid gap-2 mt-6" style={{ gridTemplateColumns: '80px repeat(3, 1fr)' }}>
            <div></div>
            <div className="text-xs text-center font-semibold pb-2" style={{ color: COLORS.textMuted }}>Impacto Bajo</div>
            <div className="text-xs text-center font-semibold pb-2" style={{ color: COLORS.textMuted }}>Impacto Medio</div>
            <div className="text-xs text-center font-semibold pb-2" style={{ color: COLORS.textMuted }}>Impacto Alto</div>
            {['Alta', 'Media', 'Baja'].map(prob => (
              <React.Fragment key={prob}>
                <div className="text-xs font-semibold flex items-center justify-end pr-2" style={{ color: COLORS.textMuted }}>
                  Prob. {prob}
                </div>
                {['Bajo', 'Medio', 'Alto'].map(imp => {
                  const cell = HEATMAP_RIESGOS.find(c => c.p === prob && c.i === imp);
                  const sev = SEVERITY[cell.severity];
                  const isSelected = selectedCell && selectedCell.p === prob && selectedCell.i === imp;
                  return (
                    <button key={imp}
                            type="button"
                            onClick={() => setSelectedCell(isSelected ? null : { p: prob, i: imp })}
                            className="aspect-square rounded flex flex-col items-center justify-center transition-all hover:scale-[1.02] cursor-pointer focus:outline-none"
                            style={{ backgroundColor: sev.bg,
                                     border: `${isSelected ? 2 : 1}px solid ${isSelected ? sev.color : sev.border}`,
                                     boxShadow: isSelected ? `0 0 0 3px ${sev.color}25` : 'none' }}>
                      <div className="text-2xl font-bold" style={{ color: sev.color }}>{cell.count}</div>
                      <div className="text-[10px] uppercase tracking-wider mt-1 font-semibold" style={{ color: sev.color }}>
                        {sev.label}
                      </div>
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          {!cellDetail && (
            <div className="text-xs mt-4 leading-relaxed" style={{ color: COLORS.textMuted }}>
              32 riesgos en zona crítica/alta requieren mitigación inmediata. 73 riesgos medios entran al programa de mejora continua.
              <span className="block mt-1 italic" style={{ color: COLORS.textDim }}>Haz click en cualquier celda para ver los riesgos contabilizados.</span>
            </div>
          )}
          {cellDetail && (() => {
            const sev = SEVERITY[cellDetail.severity];
            const mostrados = cellDetail.riesgos ? cellDetail.riesgos.length : 0;
            const restantes = cellDetail.count - mostrados;
            return (
              <div className="mt-4 rounded p-4"
                   style={{ backgroundColor: sev.bg, border: `1px solid ${sev.border}` }}>
                <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                         style={{ backgroundColor: sev.color, color: '#FFFFFF' }}>
                      Prob. {cellDetail.p} × Impacto {cellDetail.i}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: sev.color }}>
                      {cellDetail.count} riesgos · zona {sev.label.toLowerCase()}
                    </div>
                  </div>
                  <button type="button"
                          onClick={() => setSelectedCell(null)}
                          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded transition-colors"
                          style={{ color: sev.color, border: `1px solid ${sev.color}40`,
                                   backgroundColor: 'transparent' }}>
                    Cerrar
                  </button>
                </div>
                <ul className="space-y-2">
                  {cellDetail.riesgos && cellDetail.riesgos.map(r => (
                    <li key={r.id} className="flex items-start gap-2 p-2 rounded"
                        style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${sev.border}` }}>
                      <span className="text-[11px] font-mono font-bold mt-0.5"
                            style={{ color: sev.color, minWidth: 34 }}>{r.id}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold leading-tight" style={{ color: COLORS.ink }}>
                          {r.nombre}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: COLORS.textMuted }}>
                          {r.area}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {restantes > 0 && (
                  <div className="text-[11px] mt-3 italic text-center" style={{ color: sev.color }}>
                    +{restantes} riesgos adicionales agrupados en esta celda
                  </div>
                )}
              </div>
            );
          })()}
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: COLORS.textMuted }}>
          Top 12 Riesgos Estratégicos del Negocio · Atención prioritaria
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TOP_RIESGOS.map(r => {
            const sev = SEVERITY[r.sev];
            return (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded transition-all hover:translate-x-px"
                   style={{ backgroundColor: COLORS.bgElev, border: `1px solid ${COLORS.border}`,
                            borderLeft: `3px solid ${sev.color}` }}>
                <div className="text-xs font-mono font-bold" style={{ color: sev.color }}>{r.id}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: COLORS.ink }}>{r.nombre}</div>
                  <div className="text-xs flex items-center gap-1.5" style={{ color: COLORS.textMuted }}>
                    <span>{r.cat}</span><span style={{ color: COLORS.textDim }}>·</span>
                    <span className="font-mono">{r.area}</span>
                  </div>
                </div>
                <div className="text-xs px-2 py-0.5 rounded font-semibold flex-shrink-0"
                     style={{ backgroundColor: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                  {sev.label}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ============================================================
//  TAB · ROADMAP
// ============================================================
const TabRoadmap = () => (
  <div className="space-y-6">
    <div className="flex items-start justify-between gap-4">
      <SectionTitle es="Programa de Mejora Continua" en="Strategic Improvement Roadmap · 18 Months" />
      <button
        type="button"
        onClick={() => window.print()}
        className="no-print shrink-0 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-all duration-200 hover:-translate-y-px"
        style={{ backgroundColor: COLORS.greenDeep, color: COLORS.bgCard,
                 border: `1px solid ${COLORS.greenDeep}`,
                 boxShadow: '0 1px 2px rgba(31,34,37,0.12)' }}>
        Imprimir / PDF
      </button>
    </div>

    <Card className="p-6" style={{ borderColor: `${COLORS.greenDeep}30`, backgroundColor: COLORS.greenTint }}>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.greenDeep }}>
            Tesis del Programa
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>Reestructurar la disciplina operativa</h3>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.inkSoft }}>
            La rentabilidad no llegará por más facturación, sino por eliminar los problemas ocultos
            que hoy drenan utilidad: descentralizar la autoridad, instrumentar la medición,
            institucionalizar la operación y blindar el patrimonio. Tres fases secuenciales para
            transitar de 2.12 a 4.00 en el SCI en 18 meses.
          </p>
      </div>
    </Card>

    <div className="space-y-4">
      {ROADMAP.map((r, i) => (
        <Card key={i} className="overflow-hidden roadmap-phase">
          <div className="p-6">
            <div className="roadmap-row">
              <div className="min-w-0">
                <div className="text-xs font-mono mb-1" style={{ color: r.color }}>{r.fase}</div>
                <h3 className="text-2xl font-bold mb-2 leading-tight break-words hyphens-auto"
                    style={{ color: COLORS.ink, fontFamily: FONT_SERIF, wordBreak: 'break-word' }}>
                  {r.titulo}
                </h3>
                <div className="inline-block text-xs px-2.5 py-1 rounded font-semibold"
                     style={{ backgroundColor: r.tint, color: r.color, border: `1px solid ${r.color}30` }}>
                  {r.horizonte}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-3" style={{ color: COLORS.ink }}>{r.objetivo}</div>
                <div className="space-y-1.5">
                  {r.entregables.map((e, j) => (
                    <div key={j} className="flex items-start gap-2 text-xs" style={{ color: COLORS.inkSoft }}>
                      <span aria-hidden="true"
                            style={{ display: 'inline-block', width: 12, height: 12, minWidth: 12,
                                     marginTop: 2, borderRadius: 3,
                                     border: `1.5px solid ${r.color}`,
                                     backgroundColor: COLORS.bgCard }} />
                      <span>{e}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded p-4 flex flex-col justify-center"
                   style={{ backgroundColor: r.tint, border: `1px solid ${r.color}30` }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: r.color }}>
                  Impacto Estimado
                </div>
                <div className="text-sm font-semibold leading-relaxed" style={{ color: COLORS.ink }}>{r.impacto}</div>
              </div>
            </div>
          </div>
          <div className="h-1" style={{ backgroundColor: r.color }} />
        </Card>
      ))}
    </div>

    <Card className="p-6">
      <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: COLORS.textMuted }}>
        Decisión Estratégica
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded" style={{ backgroundColor: COLORS.greenTint, border: `1px solid ${COLORS.greenDeep}25` }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.greenDeep }}>Conclusión</div>
          <div className="text-sm leading-relaxed font-medium" style={{ color: COLORS.ink }}>
            El SCI actual no protege el patrimonio. Es un sistema documental, no de control. El crecimiento sostenible exige institucionalización.
          </div>
        </div>
        <div className="p-4 rounded" style={{ backgroundColor: COLORS.amberTint, border: `1px solid ${COLORS.amber}30` }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.amber }}>Decisión</div>
          <div className="text-sm leading-relaxed font-medium" style={{ color: COLORS.ink }}>
            Iniciar Fase 1 en los próximos 30 días con la instalación de la tabla de facultades, control presupuestal y canal de denuncia.
          </div>
        </div>
        <div className="p-4 rounded" style={{ backgroundColor: COLORS.redTint, border: `1px solid ${COLORS.red}25` }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.red }}>Eliminación</div>
          <div className="text-sm leading-relaxed font-medium" style={{ color: COLORS.ink }}>
            Se cancela la práctica de autorizaciones unipersonales del Director General para gasto operativo y la operación sin presupuesto formal.
          </div>
        </div>
      </div>
    </Card>
  </div>
);

// ============================================================
//  ROOT
// ============================================================
const TABS = [
  { id: 'resumen', label: 'Resumen', group: 'overview' },
  { id: 'sci', label: 'SCI', count: 3, group: 'overview' },
  ...MACROPROCESOS.map(m => ({
    id: m.id, label: m.nombreCorto, count: m.subprocesos.length, group: 'process',
  })),
  { id: 'riesgos', label: 'Riesgos', count: 127, group: 'closing' },
  { id: 'roadmap', label: 'Roadmap', count: 3, group: 'closing' },
];

export default function SolticomDashboard() {
  const [tab, setTab] = useState('resumen');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [kpis, setKpis] = useState(KPIs);
  const [extraction, setExtraction] = useState(null); // { result, matched, notes }
  const [showExtraction, setShowExtraction] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState(null);
  const [cleared, setCleared] = useState(false); // empty state · sin archivo

  const triggerFilePicker = () => {
    const input = document.getElementById('solticom-file-upload');
    if (input) input.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setCleared(false);
    setIsProcessing(true);
    setProcessError(null);
    setExtraction(null);
    try {
      const result = await extractText(file);
      const data = extractDashboardData(result);
      setExtraction({ result, ...data });
      const mergedKpis = { ...KPIs };
      if (data.matched.scoreGlobal != null) mergedKpis.scoreGlobal = data.matched.scoreGlobal;
      if (data.matched.entrevistados != null) mergedKpis.entrevistados = data.matched.entrevistados;
      if (data.matched.macroprocesos != null) mergedKpis.macroprocesos = data.matched.macroprocesos;
      if (data.matched.riesgosIdentificados != null) mergedKpis.riesgosIdentificados = data.matched.riesgosIdentificados;
      if (data.matched.reactivosTotal != null) mergedKpis.reactivosTotal = data.matched.reactivosTotal;
      if (data.matched.reactivosEstrategicos != null) mergedKpis.reactivosEstrategicos = data.matched.reactivosEstrategicos;
      if (data.matched.reactivosDirectivos != null) mergedKpis.reactivosDirectivos = data.matched.reactivosDirectivos;
      if (data.matched.reactivosOperativos != null) mergedKpis.reactivosOperativos = data.matched.reactivosOperativos;
      setKpis(mergedKpis);
      setShowExtraction(true);
    } catch (err) {
      setProcessError(err.message || 'Error al procesar el archivo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setKpis(KPIs);
    setExtraction(null);
    setShowExtraction(false);
    setProcessError(null);
    setCleared(true);
    const input = document.getElementById('solticom-file-upload');
    if (input) input.value = '';
  };

  const renderContent = () => {
    if (cleared) {
      return <EmptyDashboardState onLoadFile={triggerFilePicker} />;
    }
    if (tab === 'resumen') return <TabResumen kpis={kpis} />;
    if (tab === 'sci') return <TabSCI kpis={kpis} />;
    if (tab === 'riesgos') return <TabRiesgos />;
    if (tab === 'roadmap') return <TabRoadmap />;
    const proc = MACROPROCESOS.find(p => p.id === tab);
    if (proc) return <MacroprocesoView proc={proc} />;
    return null;
  };

  return (
    <div className="min-h-screen w-full"
         style={{ backgroundColor: COLORS.bg, color: COLORS.ink, fontFamily: FONT_SANS }}>
      <style>{`
        .roadmap-row { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        @media (min-width: 1024px) {
          .roadmap-row { grid-template-columns: 260px 1fr 240px; gap: 2rem; }
        }
        @keyframes solticom-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media print {
          .no-print { display: none !important; }
          nav { display: none !important; }
          main { padding: 0 !important; }
          .roadmap-row { grid-template-columns: 220px 1fr 200px !important; gap: 1.25rem !important; }
          .roadmap-phase { break-inside: avoid; page-break-inside: avoid; break-before: page; page-break-before: always; }
          .roadmap-phase:first-of-type { break-before: auto; page-break-before: auto; }
          @page { size: A4 landscape; margin: 14mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @media print {
          body.printing-mapa-valor > *:not(#mapa-valor-export-target) { display: none !important; }
          body.printing-mapa-valor #mapa-valor-export-target .no-print { display: none !important; }
          body.printing-mapa-valor #mapa-valor-export-target {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
            display: block !important;
          }
          body.printing-mapa-valor #mapa-valor-export-target * {
            overflow: visible !important;
            max-height: none !important;
          }
          body.printing-mapa-valor { background: #FFFFFF !important; }
          @page { size: A4 portrait; margin: 14mm; }
        }
        @media print {
          body.printing-work-plans > *:not(.work-plans-printable[data-print-active="1"]) { display: none !important; }
          body.printing-work-plans .work-plans-printable[data-print-active="1"] {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            background: #FFFFFF !important;
          }
          body.printing-work-plans .work-plans-printable[data-print-active="1"] * {
            overflow: visible !important;
            max-height: none !important;
          }
          body.printing-work-plans { background: #FFFFFF !important; }
          body.printing-work-plans .work-plan-subproc { page-break-inside: avoid; break-inside: avoid; }
          @page { size: A4 landscape; margin: 10mm; }
        }
      `}</style>
      {/* Header · Andersen Consulting Branding */}
      <header className="px-8 pt-8 pb-6 relative"
              style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bgCard }}>
        {/* Botones de gestión de archivo · esquina superior derecha */}
        <div className="absolute no-print" style={{ top: 20, right: 20, zIndex: 10 }}>
          <input
            type="file"
            id="solticom-file-upload"
            accept=".pdf,.pptx,.ppt,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <div className="flex items-center gap-2 justify-end">
            <label
              htmlFor="solticom-file-upload"
              className="inline-flex items-center gap-2 transition-all"
              style={{
                backgroundColor: isProcessing ? COLORS.greenInk : COLORS.green,
                color: COLORS.bgCard,
                padding: '10px 18px',
                fontFamily: FONT_SANS,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                borderRadius: 3,
                boxShadow: '0 2px 6px rgba(166,25,46,0.25)',
                border: `1px solid ${COLORS.greenInk}`,
                cursor: isProcessing ? 'wait' : 'pointer',
                pointerEvents: isProcessing ? 'none' : 'auto',
                opacity: isProcessing ? 0.85 : 1,
              }}
              onMouseEnter={(e) => { if (!isProcessing) e.currentTarget.style.backgroundColor = COLORS.greenInk; }}
              onMouseLeave={(e) => { if (!isProcessing) e.currentTarget.style.backgroundColor = COLORS.green; }}
              title={uploadedFile ? `Archivo cargado: ${uploadedFile.name}` : 'Cargar archivo PDF o PowerPoint'}
            >
              {isProcessing ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                     style={{ animation: 'solticom-spin 0.9s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              )}
              <span>{isProcessing ? 'Procesando…' : 'Cargar Archivo'}</span>
            </label>
            {extraction && !isProcessing && (
              <button
                type="button"
                onClick={() => setShowExtraction(true)}
                className="inline-flex items-center gap-2 transition-all"
                style={{
                  backgroundColor: COLORS.bgCard,
                  color: COLORS.green,
                  padding: '10px 14px',
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  borderRadius: 3,
                  border: `1px solid ${COLORS.green}`,
                  cursor: 'pointer',
                }}
                title="Ver datos extraídos"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>Ver datos</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleClearFile}
              className="inline-flex items-center gap-2 transition-all"
              style={{
                backgroundColor: COLORS.bgCard,
                color: COLORS.ink,
                padding: '10px 16px',
                fontFamily: FONT_SANS,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                borderRadius: 3,
                border: `1px solid ${COLORS.borderStrong}`,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.bgSoft;
                e.currentTarget.style.borderColor = COLORS.ink;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.bgCard;
                e.currentTarget.style.borderColor = COLORS.borderStrong;
              }}
              title="Limpiar archivo cargado y restaurar datos por defecto"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                <path d="M10 11v6"></path>
                <path d="M14 11v6"></path>
              </svg>
              <span>Limpiar</span>
            </button>
          </div>
          {uploadedFile && !processError && (
            <div
              className="mt-1.5 text-right"
              style={{
                fontFamily: FONT_SANS,
                fontSize: 10,
                color: COLORS.textMuted,
                letterSpacing: '0.05em',
                maxWidth: 360,
                marginLeft: 'auto',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              ✓ {uploadedFile.name}
              {extraction && (
                <span style={{ color: COLORS.green, fontWeight: 700, marginLeft: 6 }}>
                  · {Object.keys(extraction.matched).length} dato(s) detectado(s)
                </span>
              )}
            </div>
          )}
          {processError && (
            <div
              className="mt-1.5 text-right"
              style={{
                fontFamily: FONT_SANS,
                fontSize: 10,
                color: COLORS.red,
                letterSpacing: '0.05em',
                maxWidth: 360,
                marginLeft: 'auto',
                fontWeight: 700,
              }}
            >
              ✗ {processError}
            </div>
          )}
        </div>

        {/* Logo oficial Andersen */}
        <img src={andersenLogo} alt="Andersen"
             style={{ height: 52, width: 'auto', display: 'block', marginBottom: 24 }} />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="text-[10px] font-mono px-2.5 py-1 rounded-sm font-bold tracking-wider"
                   style={{ backgroundColor: COLORS.ink, color: COLORS.bgCard }}>
                CLIENTE · HELLO SOLTICOM
              </div>
              <div className="text-[10px] font-mono tracking-wider" style={{ color: COLORS.textMuted }}>
                EVALUACIÓN · 2026
              </div>
              <div className="text-[10px] font-mono tracking-wider" style={{ color: COLORS.textMuted }}>
                FRAMEWORK · ANDERSEN CONSULTING
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight leading-none"
                style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
              Diagnóstico Estratégico
              <span style={{ color: COLORS.green }}> Empresarial</span>
            </h1>
            <p className="text-base italic mt-2"
               style={{ color: COLORS.textMuted, fontFamily: FONT_SERIF }}>
              Strategic Business Intelligence Dashboard
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest font-bold"
                     style={{ color: COLORS.textMuted }}>
                  Score SCI Global
                </div>
                <div className="text-4xl font-bold tracking-tight"
                     style={{ color: cleared ? COLORS.textDim : getMaturityColor(kpis.scoreGlobal), fontFamily: FONT_SERIF }}>
                  {cleared ? '—' : kpis.scoreGlobal.toFixed(2)}
                  <span className="text-base font-normal ml-1"
                        style={{ color: COLORS.textMuted, fontFamily: FONT_SANS }}>/ 5.00</span>
                </div>
              </div>
              {!cleared && <TrafficLight score={kpis.scoreGlobal} size="lg" />}
            </div>
            <div className="h-14 w-px" style={{ backgroundColor: COLORS.border }} />
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest font-bold"
                   style={{ color: COLORS.textMuted }}>
                Riesgos
              </div>
              <div className="text-4xl font-bold tracking-tight"
                   style={{ color: cleared ? COLORS.textDim : COLORS.ink, fontFamily: FONT_SERIF }}>
                {cleared ? '—' : kpis.riesgosIdentificados}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs con scroll horizontal y separadores entre grupos */}
      <nav className="px-4 lg:px-8" style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bgElev }}>
        <div className="flex overflow-x-auto">
          {TABS.map((t, i) => {
            const prevGroup = i > 0 ? TABS[i - 1].group : null;
            const showSeparator = prevGroup && prevGroup !== t.group;
            return (
              <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}
                         label={t.label} count={t.count} separator={showSeparator} />
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="px-4 lg:px-8 py-8">{renderContent()}</main>

      {/* Footer · Andersen style */}
      <footer className="px-8 py-6"
              style={{ borderTop: `2px solid ${COLORS.green}`, backgroundColor: COLORS.bgCard }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={andersenLogo} alt="Andersen"
                 style={{ height: 28, width: 'auto', display: 'block' }} />
            <div className="h-4 w-px" style={{ backgroundColor: COLORS.border }} />
            <div className="text-xs italic" style={{ color: COLORS.textMuted, fontFamily: FONT_SERIF }}>
              Sistema de Inteligencia Empresarial · Junta de Consejo
            </div>
          </div>
          <div className="text-xs font-semibold tracking-widest uppercase"
               style={{ color: COLORS.inkSoft }}>
            Powered by AXON B2B
          </div>
        </div>
      </footer>

      {showExtraction && extraction && (
        <ExtractionPanel
          extraction={extraction}
          fileName={uploadedFile?.name}
          onClose={() => setShowExtraction(false)}
        />
      )}
    </div>
  );
}

// ============================================================
//  EMPTY STATE · Dashboard vacío esperando archivo
// ============================================================
const EmptyDashboardState = ({ onLoadFile }) => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center max-w-xl px-6">
      <div className="inline-flex items-center justify-center mb-6"
           style={{
             width: 96, height: 96, borderRadius: '50%',
             backgroundColor: COLORS.greenTint,
             border: `2px dashed ${COLORS.green}`,
           }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={COLORS.green}
             strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      </div>

      <div className="text-[10px] font-bold uppercase tracking-widest mb-2"
           style={{ color: COLORS.green }}>
        Dashboard limpio
      </div>
      <h2 className="text-3xl font-bold mb-3"
          style={{ color: COLORS.ink, fontFamily: FONT_SERIF, letterSpacing: '-0.01em' }}>
        Sin datos cargados
      </h2>
      <p className="text-sm leading-relaxed mb-8"
         style={{ color: COLORS.textMuted, fontFamily: FONT_SERIF, fontStyle: 'italic' }}>
        Todos los datos del diagnóstico fueron vaciados. Carga un archivo PDF o
        PowerPoint para poblar el dashboard con la información del cliente.
      </p>

      <button
        type="button"
        onClick={onLoadFile}
        className="inline-flex items-center gap-2.5 transition-all"
        style={{
          backgroundColor: COLORS.green,
          color: COLORS.bgCard,
          padding: '14px 28px',
          fontFamily: FONT_SANS,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          borderRadius: 3,
          boxShadow: `0 4px 14px ${COLORS.green}40`,
          border: `1px solid ${COLORS.greenInk}`,
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.greenInk; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.green; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <span>Cargar Archivo</span>
      </button>

      <div className="mt-6 text-[10px] uppercase tracking-widest font-bold"
           style={{ color: COLORS.textDim }}>
        Formatos soportados · PDF · PPTX
      </div>
    </div>
  </div>
);

// ============================================================
//  PANEL · DATOS EXTRAÍDOS DEL ARCHIVO
// ============================================================
const FIELD_LABELS = {
  scoreGlobal: 'Score SCI Global',
  reactivosTotal: 'Reactivos · total',
  reactivosEstrategicos: 'Reactivos · estratégicos',
  reactivosDirectivos: 'Reactivos · directivos',
  reactivosOperativos: 'Reactivos · operativos',
  riesgosIdentificados: 'Riesgos identificados',
  entrevistados: 'Entrevistados',
  macroprocesos: 'Macroprocesos',
  scoreEstrategico: 'Score · Control Estratégico',
  scoreDirectivo: 'Score · Control Directivo',
  scoreOperativo: 'Score · Control Operativo',
};

const ExtractionPanel = ({ extraction, fileName, onClose }) => {
  const { result, matched, notes } = extraction;
  const matchedKeys = Object.keys(matched);

  return (
    <div className="fixed inset-0 no-print" style={{ zIndex: 100 }}>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(20,20,20,0.55)',
          backdropFilter: 'blur(2px)',
        }}
      />
      <aside
        className="absolute right-0 top-0 h-full flex flex-col"
        style={{
          width: 'min(560px, 96vw)',
          backgroundColor: COLORS.bgCard,
          borderLeft: `2px solid ${COLORS.green}`,
          boxShadow: '-12px 0 32px rgba(0,0,0,0.25)',
        }}
      >
        <header
          className="px-6 py-4 flex items-start justify-between gap-4"
          style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bgElev }}
        >
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold"
                 style={{ color: COLORS.textMuted, fontFamily: FONT_SANS }}>
              Datos extraídos del archivo
            </div>
            <div className="text-base font-bold mt-1"
                 style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
              {fileName || 'Archivo'}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: COLORS.textMuted }}>
              {result.type.toUpperCase()} · {result.pageCount} {result.type === 'pdf' ? 'páginas' : 'diapositivas'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: 6, borderRadius: 4, lineHeight: 0,
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.bgCard, cursor: 'pointer',
            }}
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.ink}
                 strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: COLORS.green }}>
              KPIs auto-detectados ({matchedKeys.length})
            </h3>
            {matchedKeys.length === 0 ? (
              <div className="p-4 rounded text-xs"
                   style={{
                     backgroundColor: COLORS.amberTint,
                     color: COLORS.amber,
                     border: `1px solid ${COLORS.amber}40`,
                   }}>
                No se detectaron patrones conocidos en el texto. El dashboard
                conserva los valores por defecto.
              </div>
            ) : (
              <div className="space-y-1.5">
                {matchedKeys.map(k => (
                  <div key={k}
                       className="flex items-center justify-between px-3 py-2 rounded"
                       style={{
                         backgroundColor: COLORS.bgElev,
                         border: `1px solid ${COLORS.borderSoft}`,
                       }}>
                    <span className="text-xs" style={{ color: COLORS.inkSoft }}>
                      {FIELD_LABELS[k] || k}
                    </span>
                    <span className="text-sm font-bold tabular-nums"
                          style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
                      {typeof matched[k] === 'number' && !Number.isInteger(matched[k])
                        ? matched[k].toFixed(2)
                        : matched[k]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {notes.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: COLORS.textMuted }}>
                Notas
              </h3>
              <ul className="text-xs space-y-1" style={{ color: COLORS.textMuted }}>
                {notes.map((n, i) => <li key={i}>· {n}</li>)}
              </ul>
            </section>
          )}

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: COLORS.textMuted }}>
              Texto extraído ({result.fullText.length.toLocaleString()} caracteres)
            </h3>
            <div
              className="text-[11px] leading-relaxed p-3 rounded font-mono whitespace-pre-wrap"
              style={{
                backgroundColor: COLORS.bgElev,
                color: COLORS.inkSoft,
                border: `1px solid ${COLORS.borderSoft}`,
                maxHeight: 360,
                overflowY: 'auto',
              }}
            >
              {result.fullText.slice(0, 5000)}
              {result.fullText.length > 5000 && '\n\n… (texto truncado)'}
            </div>
          </section>
        </div>

        <footer
          className="px-6 py-3 text-[10px] tracking-widest uppercase"
          style={{
            borderTop: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.bgElev,
            color: COLORS.textMuted,
            fontFamily: FONT_SANS,
          }}
        >
          Los datos detectados ya se aplicaron al dashboard. Usa "Limpiar" para revertir.
        </footer>
      </aside>
    </div>
  );
};
