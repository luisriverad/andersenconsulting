import React, { useState, useMemo } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LabelList,
} from 'recharts';
import {
  LayoutDashboard, Target, Network, AlertTriangle, Route,
  TrendingDown, ChevronRight, ArrowUpRight,
  ShieldAlert, Activity, GitBranch, Megaphone, Briefcase, Cog,
  Users, Wallet, CheckCircle2, FileSearch, ShoppingCart, FileText,
  AlertCircle, Layers,
} from 'lucide-react';

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
    score: 1.75,
    criticidad: 'high',
    riesgosTotal: 11,
    statusGlobal: 'Implementado con muchas oportunidades de mejora',
    descripcion: 'Cómo el mercado percibe a Hello SOLTICOM y cómo la empresa atrae prospectos calificados de forma institucional.',
    subprocesos: [
      {
        id: '1.1',
        nombre: 'Identidad de Marca y Posicionamiento',
        score: 2.0,
        status: 'Implementado, con muchas oportunidades de mejora',
        enfoque: 'Definir cómo nos percibe el mercado y qué valor diferencial ofrecemos.',
        grupos: [
          { titulo: 'Gestión de Identidad Visual', actividades: [
            'Definición de Elementos Visuales Base',
            'Estandarización de Aplicaciones',
            'Protocolo de Autorización de Materiales',
          ]},
          { titulo: 'Plan Anual de Marketing', actividades: [
            'Establecimiento de Objetivos',
            'Asignación y Control de Presupuesto',
            'Calendario Táctico de Campañas',
            'Definición de KPIs de Desempeño',
          ]},
          { titulo: 'Inteligencia de Mercado', actividades: [
            'Aplicación de Análisis PESTEL',
            'Comparativa de Productos y Precios',
          ]},
        ],
        riesgos: [
          { nombre: 'Inconsistencia en la Identidad Corporativa', desc: 'Riesgo de proyectar una imagen poco profesional o fragmentada al no tener manuales de identidad aplicados en todos los puntos de contacto con el cliente.' },
          { nombre: 'Falta de Diferenciación por Segmento', desc: 'Riesgo de intentar vender lo mismo a todos los sectores (Industrial, Comercial, etc.) sin adaptar el mensaje de marca a las necesidades técnicas específicas de cada uno.' },
        ],
      },
      {
        id: '1.2',
        nombre: 'Marketing Digital',
        score: 1.0,
        status: 'Insuficiente',
        enfoque: 'El uso de canales digitales para atraer prospectos calificados.',
        grupos: [
          { titulo: 'Gestión de Contenidos en Redes', actividades: [
            'Definición de Pilares de Contenido',
            'Diseño de Calendario Editorial',
            'Programación y Automatización',
          ]},
          { titulo: 'Atención y Soporte Digital', actividades: [
            'Matriz de Preguntas Frecuentes',
            'Establecimiento de Niveles de Servicio',
            'Protocolo de Gestión de Crisis',
            'Flujo de Derivación a Ventas',
          ]},
          { titulo: 'Analítica Digital', actividades: [
            'Análisis de Interacción',
            'Monitoreo de Crecimiento de Comunidad',
            'Reporte Mensual de Resultados',
          ]},
        ],
        riesgos: [
          { nombre: 'Bajo Retorno de Inversión (ROI) en Pauta', desc: 'Riesgo de gastar presupuesto en publicidad digital sin una estrategia de segmentación clara, atrayendo "leads" que no tienen el presupuesto o el perfil técnico requerido.' },
          { nombre: 'Obsolescencia de Activos Digitales', desc: 'Riesgo de que el sitio web o redes sociales no reflejen la capacidad técnica actual de la empresa, generando desconfianza en prospectos de alto nivel (grandes corporativos).' },
          { nombre: 'Brecha de Seguridad y Reputación', desc: 'Riesgo de ataques cibernéticos a los activos digitales o crisis de reputación por comentarios no atendidos, afectando la credibilidad institucional.' },
        ],
      },
      {
        id: '1.3',
        nombre: 'Generación de Demanda',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Tácticas específicas para llenar el embudo de ventas.',
        grupos: [
          { titulo: 'Campañas de Adquisición', actividades: [
            'Selección y Segmentación de Audiencias',
            'Estructura de Campañas y Grupos de Anuncios',
          ]},
          { titulo: 'Optimización de Conversión', actividades: [
            'Optimización de la Experiencia de Usuario',
            'Implementación de Call to Action',
            'Diseño de Formularios de Captura Eficientes',
          ]},
          { titulo: 'Medición del Embudo', actividades: [
            'Definición de Conversiones y Atribución',
            'Cálculo del Costo por Adquisición',
            'Análisis de Retorno sobre la Inversión Publicitaria',
            'Reporte de Ciclo Cerrado',
          ]},
        ],
        riesgos: [
          { nombre: 'Embudo de Ventas (Pipeline) Vacío', desc: 'Riesgo de no contar con un flujo constante de prospectos, lo que genera una operación "de picos" (meses con mucho trabajo y meses de inactividad que afectan el flujo de caja).' },
          { nombre: 'Falta de Seguimiento a Campañas', desc: 'Riesgo de generar interesados que no son contactados a tiempo por el equipo comercial, perdiendo la inversión realizada en la campaña.' },
          { nombre: 'Dependencia de la Prospección "Dueño-Dependiente"', desc: 'Riesgo de que la demanda cese si el Director General deja de atraer contactos personalmente, al no haber una "fábrica" de leads institucionalizada.' },
        ],
      },
      {
        id: '1.4',
        nombre: 'Posicionamiento y Eventos',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Networking y posicionamiento en foros especializados.',
        grupos: [
          { titulo: 'Eventos y Foros Especializados', actividades: [
            'Selección Estratégica de Foros',
            'Logística y Montaje Institucional',
            'Protocolo de Captación de Leads en Sitio',
            'Seguimiento Post-Evento',
          ]},
          { titulo: 'Materiales Comerciales Institucionales', actividades: [
            'Desarrollo de Brochure y Fichas Técnicas',
            'Estandarización de Presentaciones Ejecutivas',
            'Producción de Video Institucional y Demos',
            'Gestión de Artículos Promocionales',
          ]},
          { titulo: 'Alianzas y Relaciones Públicas', actividades: [
            'Mapeo de Aliados Clave',
            'Protocolo de Networking y Relaciones Públicas',
            'Acuerdos de Colaboración',
            'Vigilancia de Reputación de Socios',
          ]},
        ],
        riesgos: [
          { nombre: 'Eventos sin Estrategia de Conversión', desc: 'Riesgo de asistir a foros o exposiciones sin un proceso para capturar y calificar prospectos, convirtiendo el evento en un gasto y no en una inversión.' },
          { nombre: 'Fragilidad en Alianzas Estratégicas', desc: 'Riesgo de depender de socios comerciales que no comparten los estándares de calidad de Hello SOLTICOM, afectando la marca por asociación.' },
          { nombre: 'Falta de Portavoz Institucional', desc: 'Riesgo de que la comunicación externa esté centralizada en una sola persona, impidiendo que otros líderes de la empresa se posicionen como referentes técnicos en la industria.' },
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
    score: 2.2,
    criticidad: 'high',
    riesgosTotal: 15,
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
          { titulo: 'Segmentación del Mercado', actividades: [
            'Criterios de Segmentación',
            'Identificación de la Persona Clave',
            'Geolocalización Estratégica',
          ]},
          { titulo: 'Estrategia de Atracción', actividades: [
            'Estrategia Outbound',
            'Estrategia Inbound',
            'Gestión de Referidos',
          ]},
          { titulo: 'Calificación DANT', actividades: [
            'Presupuesto',
            'Identificación de la Autoridad',
            'Identificación de la Necesidad',
            'Identificación del Tiempo',
          ]},
          { titulo: 'Pipeline Management', actividades: [
            'Estandarización del Registro',
            'Pipeline Management',
            'Alertas de Seguimiento',
          ]},
        ],
        riesgos: [
          { nombre: 'Falta de Calificación DANT', desc: 'Riesgo de invertir tiempo de ingeniería y ventas en prospectos que no tienen presupuesto asignado o poder de decisión, generando un alto costo de adquisición sin retorno.' },
          { nombre: 'Dependencia de Prospección Directiva', desc: 'Riesgo de parálisis comercial si el Director General no atrae prospectos, debido a la falta de un sistema institucional de generación de leads.' },
        ],
      },
      {
        id: '2.2',
        nombre: 'Cotización y Cierre',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Asegurar la rentabilidad del proyecto desde su concepción.',
        grupos: [
          { titulo: 'Levantamiento Técnico', actividades: [
            'Visita de Diagnóstico en Sitio',
            'Matriz de Responsabilidades',
            'Documento de "Fuera de Alcance"',
          ]},
          { titulo: 'Ingeniería de Costos', actividades: [
            'Cálculo de Costos Directos e Indirectos',
            'Visto Bueno de Operaciones',
            'Análisis de Margen de Contribución',
          ]},
          { titulo: 'Elaboración de Propuesta', actividades: [
            'Uso de Plantilla Institucional',
            'Propuesta Técnica vs. Propuesta Económica',
            'Manejo de Objeciones Basado en Valor',
          ]},
          { titulo: 'Formalización Contractual', actividades: [
            'Revisión de Contrato por Área Legal',
            'Validación Fiscal del Cliente',
            'Protocolo de Anticipo',
          ]},
        ],
        riesgos: [
          { nombre: 'Venta con Margen Negativo', desc: 'Riesgo de error en la ingeniería de costos (viáticos, materiales o mano de obra subestimada) que resulte en proyectos que, en lugar de generar utilidad, consumen el flujo de la empresa.' },
          { nombre: 'Compromisos Inviables', desc: 'Riesgo de prometer alcances técnicos o fechas de entrega que Operaciones no puede cumplir por falta de capacidad instalada o materiales, dañando la reputación de la marca.' },
          { nombre: 'Falta de Visto Bueno Operativo', desc: 'Riesgo de enviar propuestas sin validación de los líderes de proyecto, derivando en retrabajos y fricciones internas durante la ejecución.' },
        ],
      },
      {
        id: '2.3',
        nombre: 'Ejecución y Cobranza',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Asegurar el flujo de efectivo y la correcta transición a la operación.',
        grupos: [
          { titulo: 'Handoff Comercial → Operativo', actividades: [
            'Entrega del Expediente Comercial',
            'Explicación de "Promesas Especiales"',
            'Validación de Fechas de Entrega',
          ]},
          { titulo: 'Seguimiento del Proyecto Vendido', actividades: [
            'Control de Avance vs. Cronograma',
            'Gestión de Órdenes de Cambio',
            'Recopilación de Evidencias de Entrega',
          ]},
          { titulo: 'Facturación y Cobranza', actividades: [
            'Emisión de CFDI',
            'Conciliación de Pagos y Complementos',
            'Gestión de Cobranza Preventiva',
          ]},
        ],
        riesgos: [
          { nombre: 'Teléfono Descompuesto en el Kick-off', desc: 'Riesgo de que el equipo operativo ignore promesas específicas hechas por el vendedor, generando insatisfacción inmediata en el cliente al inicio del servicio.' },
          { nombre: 'Fuga de Cobranza por Falta de Evidencias', desc: 'Riesgo de no poder facturar o cobrar hitos debido a la falta de firmas en actas de entrega o bitácoras de obra que respalden el trabajo realizado.' },
          { nombre: 'Ejecución de "Extras" No Facturados', desc: 'Riesgo de que el personal operativo realice trabajos adicionales solicitados por el cliente en campo sin que Ventas los cotice, perdiendo ingresos legítimos.' },
        ],
      },
      {
        id: '2.4',
        nombre: 'Postventa y Satisfacción',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Retención del cliente y maximización de su valor de vida.',
        grupos: [
          { titulo: 'Medición de Satisfacción', actividades: [
            'Encuesta de Transacción',
            'Clasificación de Clientes',
            'Análisis de Satisfacción del Cliente',
          ]},
          { titulo: 'Gestión Interna del Cierre', actividades: [
            'Reunión de Cierre Directiva',
            'Documentación de Fallas Técnicas',
            'Minuta de Mejora Interna',
          ]},
          { titulo: 'Inteligencia Comercial Post-Venta', actividades: [
            'Entrevista de Salida con Prospectos / Solicitud de Cartas de Recomendación',
            'Análisis Comparativo de la Competencia / Documentación de Casos de Éxito',
            'Ajuste de la Estrategia de Pricing',
          ]},
        ],
        riesgos: [
          { nombre: 'Ceguera de Satisfacción', desc: 'Riesgo de tener "detractores silenciosos" (clientes insatisfechos que no se quejan pero no vuelven) por no aplicar métricas de satisfacción de forma sistemática.' },
        ],
      },
      {
        id: '2.5',
        nombre: 'Fidelización y Recompra',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Retención del cliente y maximización de su valor de vida.',
        grupos: [
          { titulo: 'Garantías y Soporte', actividades: [
            'Protocolo de Reclamaciones',
            'Matriz de Garantías por Producto/Servicio',
            'Análisis de Fallas Recurrentes',
          ]},
          { titulo: 'Customer Success', actividades: [
            'Calendario de Contacto Preventivo',
            'Boletines de Valor Agregado',
            'Auditorías de Uso',
          ]},
          { titulo: 'Cross-sell y Up-sell', actividades: [
            'Identificación de Oportunidades de Venta Cruzada',
            'Estrategia de Escalamiento',
            'Renovaciones Anticipadas',
          ]},
          { titulo: 'Programas de Lealtad', actividades: [
            'Incentivos por Recomendación',
            'Eventos de Fidelización',
          ]},
        ],
        riesgos: [
          { nombre: 'Pérdida de Recompra por Omisión', desc: 'Riesgo de que el cliente contrate servicios complementarios o mantenimientos con la competencia porque Hello SOLTICOM no realizó una estrategia de venta cruzada oportuna.' },
          { nombre: 'Incumplimiento de Garantías', desc: 'Riesgo de una respuesta lenta ante fallas post-entrega por no tener un protocolo de soporte técnico institucional, deteriorando la lealtad del cliente.' },
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
    riesgosTotal: 13,
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
          { titulo: 'Recepción Formal del Proyecto', actividades: [
            'Validación de la Carpeta Comercial',
            'Sesión de Transferencia de Conocimiento',
            'Cotejo de Alcance vs. Cotización',
            'Formalización de Aceptación Operativa',
          ]},
          { titulo: 'Asignación de Recursos', actividades: [
            'Análisis de Capacidad Instalada',
            'Designación del Project Manager',
            'Inventario de Herramientas y Equipo Especializado',
            'Matriz de Responsabilidades',
          ]},
          { titulo: 'Planeación Detallada', actividades: [
            'Desglose de Estructura de Trabajo',
            'Establecimiento de la Ruta Crítica',
            'Definición de Hitos de Control y Facturación',
            'Plan de Comunicación y Reportabilidad',
          ]},
        ],
        riesgos: [
          { nombre: 'Desfase en la Ruta Crítica', desc: 'Riesgo de no identificar interdependencias entre tareas, provocando que el retraso de un proveedor o una entrega de material detenga a todo el equipo operativo, incrementando los costos fijos.' },
          { nombre: 'Subestimación de Recursos', desc: 'Riesgo de asignar personal insuficiente o sin las competencias técnicas necesarias para el tipo de obra, derivando en errores de ejecución y posibles accidentes.' },
          { nombre: 'Inexistencia de Stock de Seguridad Operativo', desc: 'Riesgo de paros de obra por falta de consumibles básicos o herramientas menores que no fueron previstos en la planeación inicial.' },
        ],
      },
      {
        id: '3.2',
        nombre: 'Ejecución y Bitácora',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Garantizar que el trabajo en campo se realice bajo estándares de calidad y seguridad.',
        grupos: [
          { titulo: 'Logística y Materiales', actividades: [
            'Explosión de Insumos por Proyecto',
            'Solicitud y Logística de Abastecimiento',
            'Control de Salidas y Devoluciones de Almacén',
            'Gestión de Stock de Emergencia',
          ]},
          { titulo: 'Avance en Sitio', actividades: [
            'Registro Diario de Actividades (Bitácora)',
            'Medición de Avance Físico vs. Financiero',
            'Gestión de Órdenes de Cambio',
            'Reporte de Estatus al Cliente',
          ]},
          { titulo: 'Calidad y Seguridad', actividades: [
            'Inspecciones de Calidad en Proceso',
            'Análisis de Riesgos por Tarea',
            'Gestión de No Conformidades Técnicas',
            'Protocolo de Orden y Limpieza',
          ]},
        ],
        riesgos: [
          { nombre: 'Desviación del Alcance', desc: 'Riesgo de realizar trabajos adicionales solicitados por el cliente en sitio que no están en el contrato, sin que se genere una orden de cambio cobrable, mermando la utilidad.' },
          { nombre: 'Falta de Supervisión de Seguridad (QHSE)', desc: 'Riesgo de incidentes laborales por omisión de uso de EPP o protocolos de seguridad, lo que puede derivar en multas de la STPS o clausuras de obra.' },
          { nombre: 'Registro de Bitácora Incompleto', desc: 'Riesgo de perder la trazabilidad de las decisiones tomadas en campo, lo que dificulta la defensa de la empresa ante reclamos del cliente o auditorías de calidad.' },
        ],
      },
      {
        id: '3.3',
        nombre: 'Calidad y Pruebas',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Validar que lo instalado o entregado funciona según las especificaciones.',
        grupos: [
          { titulo: 'Protocolos de Validación', actividades: [
            'Pruebas de Aceptación',
            'Pruebas de Aceptación en Sitio',
            'Checklist de Criterios de Éxito',
            'Certificación de Parámetros Técnicos',
          ]},
          { titulo: 'Gestión de Hallazgos', actividades: [
            'Registro y Clasificación de Hallazgos',
            'Análisis de Causa Raíz',
            'Plan de Acción y Retrabajo',
            'Validación de Cierre',
          ]},
        ],
        riesgos: [
          { nombre: 'Uso de Instrumentos No Calibrados', desc: 'Riesgo de mediciones erróneas en instalaciones críticas que invaliden certificaciones técnicas o pongan en riesgo la infraestructura del cliente.' },
          { nombre: 'Retrabajos por Falta de Autocontrol', desc: 'Riesgo de costos elevados por tener que corregir diagnóstico mal enfocado desde el origen por no tener puntos de inspección durante la ejecución.' },
        ],
      },
      {
        id: '3.4',
        nombre: 'Cierre y Retroalimentación',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Formalizar la terminación y transferir la responsabilidad al cliente.',
        grupos: [
          { titulo: 'Acta de Entrega Final', actividades: [
            'Elaboración del Documento Legal de Entrega',
            'Recopilación de Evidencias y Anexos',
            'Firma Mancomunada (Cliente y Hello Solticom)',
            'Declaración de Inicio de Garantía',
          ]},
          { titulo: 'Desmovilización y Cierre Administrativo', actividades: [
            'Liquidación de Órdenes de Compra de Terceros',
            'Retorno y Auditoría de Herramientas y Equipos',
            'Liberación de Capital Humano',
            'Resguardo del Expediente Técnico (Lecciones Aprendidas)',
          ]},
          { titulo: 'Retroalimentación de Mejora', actividades: [
            'Aplicación de Encuestas de Satisfacción',
            'Entrevista de Cierre con el Cliente',
            'Análisis de Desempeño Operativo (KPIs de Proyecto)',
            'Retroalimentación al Proceso Comercial',
          ]},
        ],
        riesgos: [
          { nombre: 'Cierre Administrativo Lento', desc: 'Riesgo de retrasar la facturación final debido a que el equipo operativo no entrega los reportes, fotos y evidencias necesarias a la oficina central de manera oportuna.' },
          { nombre: 'Pérdida de Materiales Sobrantes', desc: 'Riesgo de fuga de activos (herramientas o materiales) al finalizar la obra por no tener un protocolo de inventario de retorno y limpieza de sitio.' },
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
    riesgosTotal: 14,
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
          { titulo: 'Definición de la Vacante', actividades: [
            'Definición de Perfil y Descripción de Puesto',
            'Aprobación de la Vacante',
            'Estrategia y Canales de Búsqueda',
            'Publicación de Oferta',
            'Recepción y Filtro Curricular',
          ]},
          { titulo: 'Proceso de Selección', actividades: [
            'Entrevista Inicial (RRHH)',
            'Pruebas Técnicas y Psicométricas',
            'Entrevista con el Jefe Directo',
            'Verificación de Referencias Laborales',
            'Examen Médico / Polígrafo (si aplica)',
          ]},
          { titulo: 'Contratación e Inducción', actividades: [
            'Oferta Formal al Candidato',
            'Recolección de Documentos',
            'Elaboración y Firma de Contrato',
            'Inducción y Onboarding',
            'Seguimiento Post-Contratación (30-90 días)',
          ]},
        ],
        riesgos: [
          { nombre: 'Falta de Onboarding Formal', desc: 'Riesgo de una curva de aprendizaje prolongada y errores operativos críticos en los primeros días debido a que el personal entra "directo a operar" sin conocer las normas y procesos de la empresa.' },
          { nombre: 'Contratación Reactiva por Urgencia', desc: 'Riesgo de omitir pruebas psicométricas o técnicas por la presión de cubrir vacantes operativas, resultando en la contratación de personal que no cumple con el perfil de seguridad o calidad.' },
        ],
      },
      {
        id: '4.2',
        nombre: 'Capacitación y Desarrollo',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Mantener al equipo actualizado y certificado para las exigencias del mercado.',
        grupos: [
          { titulo: 'Detección de Necesidades', actividades: [
            'Análisis de Indicadores de Desempeño',
            'Evaluación de Competencias (Gap Analysis)',
            'Entrevistas y Encuestas al Personal',
            'Elaboración del Plan Anual de Capacitación',
          ]},
          { titulo: 'Ejecución y Evaluación', actividades: [
            'Diseño y Contenido de Cursos',
            'Ejecución y Logística de la Capacitación',
            'Evaluación de Reacción y Aprendizaje (Nivel I y II)',
            'Evaluación de Impacto en el Puesto (Nivel III y IV)',
          ]},
          { titulo: 'Sucesión y Carrera', actividades: [
            'Identificación de Puestos Clave y Talento',
            'Desarrollo de Competencias de Liderazgo',
            'Comunicación y Gestión de Expectativas',
            'Plan de Sucesión Formal (Ready Now / Ready Soon)',
            'Revisión Anual del Plan',
          ]},
        ],
        riesgos: [
          { nombre: 'Capacitación Basada en "Bomberazos"', desc: 'Riesgo de invertir en cursos que no resuelven las brechas reales de la empresa por no realizar una Detección de Necesidades de Capacitación (DNC) sistemática.' },
          { nombre: 'Fuga de Conocimiento Crítico', desc: 'Riesgo de que el "know-how" técnico resida solo en personas específicas y no en manuales institucionales, dejando a la empresa vulnerable si el personal clave renuncia.' },
        ],
      },
      {
        id: '4.3',
        nombre: 'Evaluación del Desempeño',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Incentivar la productividad y asegurar la equidad interna.',
        grupos: [
          { titulo: 'Definición de Objetivos', actividades: [
            'Alineación Estratégica de Objetivos',
            'Definición de Indicadores Específicos (SMART)',
            'Monitoreo Continuo de Avances',
            'Documentación de Evidencias',
          ]},
          { titulo: 'Proceso de Evaluación', actividades: [
            'Autoevaluación del Empleado',
            'Evaluación 360° (si aplica)',
            'Reunión Formal de Retroalimentación',
            'Calibración de Resultados',
            'Vinculación con Compensación y Desarrollo',
          ]},
          { titulo: 'Gestión del Bajo Desempeño', actividades: [
            'Identificación Oportuna y Documentación',
            'Definición de un Plan de Mejora',
            'Seguimiento Estricto al Plan de Mejora',
            'Toma de Decisiones y Cierre',
            'Análisis de Causas Raíz',
          ]},
        ],
        riesgos: [
          { nombre: 'Subjetividad en Ascensos y Bonos', desc: 'Riesgo de desmotivación y rotación del personal de alto desempeño al percibir que las recompensas se dan por "percepción" y no por indicadores (KPIs) objetivos.' },
          { nombre: 'Desalineación de Objetivos Individuales', desc: 'Riesgo de que el personal trabaje sin entender cómo su desempeño impacta en la rentabilidad de los proyectos, diluyendo el sentido de responsabilidad.' },
        ],
      },
      {
        id: '4.4',
        nombre: 'Compensación y Nómina',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Garantizar equidad interna y competitividad externa de la compensación.',
        grupos: [
          { titulo: 'Estructura Salarial', actividades: [
            'Análisis y Valoración de Puestos',
            'Estudios de Mercado Salarial',
            'Definición de Políticas Salariales',
            'Revisión y Aprobación de Ajustes',
          ]},
          { titulo: 'Compensación Total', actividades: [
            'Diseño de Paquetes de Beneficios',
            'Programas de Compensación Emocional',
            'Administración de Incentivos Variables',
          ]},
          { titulo: 'Administración de Nómina', actividades: [
            'Captura y Cálculo de Incidencias',
            'Proceso de Nómina y Dispersión',
            'Emisión de Recibos y Timbrado',
          ]},
        ],
        riesgos: [
          { nombre: 'Tabuladores Inexistentes', desc: 'Carecer de rangos salariales mínimos y máximos por nivel jerárquico, lo que descontrola el presupuesto de nómina.' },
          { nombre: 'Incentivos sin Calidad', desc: 'Premiar la rapidez en la entrega ignorando fallas técnicas o falta de seguridad (QHSE), incentivando conductas riesgosas.' },
          { nombre: 'Aumentos por Antigüedad (No Mérito)', desc: 'Dar incrementos salariales solo por "tiempo en la empresa" en lugar de basarlos en el incremento de productividad o capacitación técnica demostrada.' },
        ],
      },
      {
        id: '4.5',
        nombre: 'Clima Laboral y Salida',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Blindar a la empresa ante riesgos jurídicos y mantener la paz laboral.',
        grupos: [
          { titulo: 'Seguridad y Bienestar', actividades: [
            'Programas de Seguridad e Higiene (NOMs)',
            'Atención al Riesgo Psicosocial (NOM-035)',
            'Programas de Bienestar y Salud',
          ]},
          { titulo: 'Clima Organizacional', actividades: [
            'Medición de Clima Laboral',
            'Planes de Acción y Seguimiento',
            'Comunicación Interna Efectiva',
            'Código de Conducta y Ética',
          ]},
          { titulo: 'Gestión de Salida', actividades: [
            'Entrevista de Salida (Exit Interview)',
            'Cálculo y Finiquito',
            'Baja y Documentación Legal',
          ]},
        ],
        riesgos: [
          { nombre: 'Incumplimiento de Normas de Seguridad (QHSE)', desc: 'Riesgo de accidentes graves y responsabilidad solidaria ante el IMSS por falta de supervisión en el uso de EPP y certificaciones de seguridad industrial del personal.' },
          { nombre: 'Cultura de Reacción ante Conflictos', desc: 'Riesgo de un clima laboral tóxico que afecte la productividad por no tener canales institucionales de quejas o resolución de conflictos internos.' },
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
    riesgosTotal: 17,
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
          { titulo: 'Cierre Contable Mensual', actividades: [
            'Checklist de Actividades de Cierre',
            'Corte de Documentación',
            'Ajustes y Provisiones',
            'Emisión de Estados Financieros',
          ]},
          { titulo: 'Conciliaciones', actividades: [
            'Conciliación Bancaria Diaria/Mensual',
            'Circularización y cotejo de Clientes/Proveedores',
            'Depuración de Partidas Antiguas',
            'Conciliación de Inventarios y Activos',
          ]},
          { titulo: 'Obligaciones Fiscales', actividades: [
            'Determinación de Impuestos (IVA, ISR, Retenciones)',
            'Opinión de Cumplimiento',
            'Conciliación de Visor de Ingresos (SAT vs. Contabilidad)',
            'Resguardo y Auditoría de Archivos XML/PDF',
          ]},
        ],
        riesgos: [
          { nombre: 'Inconsistencia en la Integración de Libros', desc: 'Riesgo de discrepancias entre los módulos auxiliares (ventas/compras) y el libro mayor, dificultando la trazabilidad de las operaciones en caso de auditoría.' },
          { nombre: 'Diferencias en Inventarios vs. Contabilidad', desc: 'Riesgo de discrepancias entre la existencia física de herramientas/materiales y el registro contable, ocultando mermas, daños o robos hormiga.' },
          { nombre: 'Inexistencia de Expedientes de Materialidad', desc: 'Riesgo de que el SAT desconozca deducciones por falta de evidencia documental (fotos, contratos, reportes técnicos) que pruebe que los servicios subcontratados fueron reales.' },
        ],
      },
      {
        id: '5.2',
        nombre: 'Tesorería y Flujo de Efectivo',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Optimizar la liquidez y asegurar la disponibilidad de efectivo para la continuidad operativa.',
        grupos: [
          { titulo: 'Planeación del Flujo', actividades: [
            'Elaboración del Flujo de Caja Semanal',
            'Análisis de Antigüedad de Saldos',
            'Escenarios de Sensibilidad (Plan B)',
            'Conciliación de Pronóstico vs. Real',
          ]},
          { titulo: 'Gestión de Pagos', actividades: [
            'Calendario Institucional de Pagos',
            'Priorización de Pagos Críticos',
            'Protocolo de Validación y Autorización',
            'Ejecución y Confirmación de Transferencias',
          ]},
          { titulo: 'Administración Bancaria', actividades: [
            'Control de Saldos y Arqueos Bancarios Diarios',
            'Administración de Inversiones a Corto Plazo',
            'Gestión de Facultades y Poderes Bancarios',
            'Negociación de Condiciones Bancarias',
          ]},
        ],
        riesgos: [
          { nombre: 'Crisis de Liquidez por Mala Estimación', desc: 'Riesgo de insolvencia técnica al no anticipar semanas de alta dispersión (nómina, aguinaldos) frente a ciclos de cobranza lentos o retrasos de clientes clave.' },
          { nombre: 'Desconocimiento del Ciclo de Conversión de Efectivo', desc: 'Riesgo de financiar la operación de forma ineficiente por no alinear los plazos de pago a proveedores con los plazos de recuperación de cartera.' },
        ],
      },
      {
        id: '5.3',
        nombre: 'Presupuesto y Análisis de Costos',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Controlar la rentabilidad y asegurar que cada proyecto contribuya al crecimiento estratégico.',
        grupos: [
          { titulo: 'Elaboración del Presupuesto', actividades: [
            'Definición de Premisas Macroeconómicas',
            'Recolección de Necesidades Departamentales',
            'Negociación y Ajuste de Partidas',
            'Aprobación del Presupuesto Maestro',
          ]},
          { titulo: 'Control Presupuestal', actividades: [
            'Reporte Mensual de Comparativa',
            'Identificación de Desviaciones Significativas',
            'Juntas de Revisión de Resultados',
            'Pronóstico de Cierre (Forecast)',
          ]},
          { titulo: 'Análisis de Costos y Rentabilidad', actividades: [
            'Cálculo del Costo Unitario/Proyecto',
            'Determinación del Margen de Contribución',
            'Análisis de Punto de Equilibrio',
            'Monitoreo de Indicadores de Rentabilidad',
          ]},
        ],
        riesgos: [
          { nombre: 'Operación Bajo Gasto Ciego', desc: 'Riesgo de crecimiento desordenado de los costos fijos por no tener un techo presupuestal asignado y autorizado para cada departamento.' },
          { nombre: 'Desalineación de Objetivos Financieros', desc: 'Riesgo de invertir recursos en áreas o proyectos que no contribuyen a la visión de crecimiento definida por la dirección de Hello SOLTICOM.' },
          { nombre: 'Falta de Accountability de Líderes', desc: 'Riesgo de que los responsables de proyecto no asuman el control del gasto al no existir un reporte mensual que los confronte con su presupuesto original.' },
        ],
      },
      {
        id: '5.4',
        nombre: 'Control Interno y Auditoría',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Implementar candados administrativos para proteger el patrimonio y evitar malas prácticas.',
        grupos: [
          { titulo: 'Control de Fondos Pequeños', actividades: [
            'Ejecución de Arqueos Sorpresa',
            'Validación de Comprobantes',
            'Establecimiento de Límites de Gasto',
            'Protocolo de Reposición de Fondo',
          ]},
          { titulo: 'Poderes y Autorizaciones', actividades: [
            'Inventario de Poderes Legales',
            'Matriz de Firmas Autorizadas Bancarias',
            'Control de Niveles de Autorización',
            'Protocolo de Revocación Inmediata',
          ]},
          { titulo: 'Auditoría Externa', actividades: [
            'Contratación de Despacho Independiente',
            'Preparación de Cédulas de Auditoría',
            'Revisión de Dictamen Fiscal',
            'Implementación de Recomendaciones',
          ]},
        ],
        riesgos: [
          { nombre: 'Concentración de Autoridad (Cuello de Botella)', desc: 'Riesgo de parálisis operativa porque solo el Director General puede autorizar pagos o contratos, retrasando la ejecución de proyectos.' },
          { nombre: 'Debilidad en el Sistema de Control Interno (SCI)', desc: 'Riesgo de que las fallas operativas se vuelvan sistémicas al no contar con una evaluación externa periódica que obligue a la mejora continua.' },
        ],
      },
      {
        id: '5.5',
        nombre: 'Gestión de Riesgos y Continuidad',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Anticipar y mitigar eventos que pongan en peligro la continuidad y reputación del negocio.',
        grupos: [
          { titulo: 'Matriz de Riesgos Institucional', actividades: [
            'Inventario de Riesgos por Proceso',
            'Evaluación de Probabilidad e Impacto',
            'Diseño de Controles Mitigantes',
            'Monitoreo y Actualización del Mapa de Calor',
          ]},
          { titulo: 'Continuidad del Negocio', actividades: [
            'Análisis de Impacto al Negocio',
            'Protocolo de Recuperación de Desastres',
            'Definición de Equipos de Respuesta',
            'Pruebas de Estrés y Simulacros',
          ]},
          { titulo: 'Cumplimiento Regulatorio', actividades: [
            'Vigilancia de Obligaciones de Ley',
            'Prevención de Lavado de Dinero',
            'Establecimiento del Código de Ética y Canal de Denuncia',
            'Auditorías de Cumplimiento',
          ]},
        ],
        riesgos: [
          { nombre: 'Cultura de Reacción Permanente', desc: 'Riesgo de operar bajo un esquema de "bomberazos" que impide la planeación estratégica y desgasta al equipo administrativo.' },
          { nombre: 'Inexistencia de Protocolos de Gestión de Crisis', desc: 'Riesgo de una respuesta errática ante siniestros (incendio, robo de flota, accidentes graves) que escale el daño reputacional y financiero.' },
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
    riesgosTotal: 12,
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
          { titulo: 'Planeación de Calidad', actividades: [
            'Difusión y Mantenimiento de la Política de Calidad',
            'Despliegue de Objetivos Estratégicos',
            'Establecimiento de Indicadores (KPIs) por Proceso',
            'Comunicación y Difusión Institucional',
          ]},
          { titulo: 'Control de Documentos', actividades: [
            'Creación del Listado Maestro de Documentos',
            'Protocolo de Elaboración, Revisión y Aprobación',
            'Gestión de Cambios y Versiones (Control de Cambios)',
            'Resguardo y Disponibilidad Digital',
          ]},
          { titulo: 'Procesos y Procedimientos', actividades: [
            'Mapeo de Procesos Críticos',
            'Redacción de Procedimientos Estándar',
            'Diseño de Formatos de Registro',
            'Validación en Campo de la Documentación',
          ]},
        ],
        riesgos: [
          { nombre: 'Inconsistencia en la Operación por Falta de Estándares', desc: 'Riesgo de que cada equipo técnico ejecute los proyectos de infraestructura bajo criterios propios al no respetar la política, objetivos de calidad y manuales de procedimientos unificados y socializados.' },
          { nombre: 'Normatividades documentadas pero no ejecutadas', desc: 'Se percibe un sesgo entre lo que dicen los manuales a lo que se realiza, no se respetan los manuales, cultura documental y no de gestión.' },
          { nombre: 'KPI´s no enfocados', desc: 'Riesgos documentados en la matriz pero se limitan a riesgos de control o cumplimiento, no se mencionan riesgos financieros, estratégicos, de productividad, etc.' },
        ],
      },
      {
        id: '6.2',
        nombre: 'QHSE y Gestión Ambiental',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Blindar a la empresa ante riesgos de accidentes laborales, contingencias ambientales y sanciones de autoridades (STPS/IMSS).',
        grupos: [
          { titulo: 'Seguridad y Salud Ocupacional', actividades: [
            'Elaboración de la Matriz de riesgos potenciales por Puesto',
            'Análisis de Riesgos por Tarea',
            'Determinación y Entrega de EPP',
            'Monitoreo de Salud Ocupacional',
          ]},
          { titulo: 'Capacitación en Seguridad', actividades: [
            'Plan Anual de Capacitación en Seguridad',
            'Formación de Brigadas de Emergencia',
            'Calendario de Simulacros',
            'Inducción de Seguridad a Visitas y Contratistas',
          ]},
          { titulo: 'Gestión Ambiental', actividades: [
            'Identificación de Aspectos e Impactos Ambientales',
            'Plan de Manejo de Residuos (Peligrosos y No Peligrosos)',
            'Programa de Ahorro de Recursos (Energía y Agua) / Protocolo de Respuesta a Derrames',
          ]},
        ],
        riesgos: [
          { nombre: 'Materialización de Accidentes Graves por Omisión', desc: 'Riesgo de lesiones incapacitantes o fatales del personal operativo por una deficiente identificación de peligros y evaluación de riesgos en sitio, especialmente en trabajos de alto riesgo (alturas, electricidad).' },
          { nombre: 'Responsabilidad Solidaria y Capitales Constitutivos', desc: 'Riesgo de sanciones económicas severas ante el IMSS o la STPS debido a la falta de un programa de capacitación efectivo y brigadas de emergencia que no cuenten con las certificaciones vigentes (DC-3).' },
          { nombre: 'Contingencias Legales por Mal Manejo Ambiental', desc: 'Riesgo de multas y clausuras de proyectos por una gestión inadecuada de residuos peligrosos o aspectos ambientales no mitigados, afectando la reputación de Hello SOLTICOM ante clientes corporativos.' },
        ],
      },
      {
        id: '6.3',
        nombre: 'Calibración y Control de Calidad',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Garantizar que la entrega de valor cumpla con las especificaciones técnicas contratadas para evitar costos de retrabajo.',
        grupos: [
          { titulo: 'Inspección y Pruebas', actividades: [
            'Definición de Plan de Inspección y Muestreo',
            'Inspección de Recibo',
            'Inspección en Proceso',
            'Inspección Final y Liberación',
          ]},
          { titulo: 'Calibración de Equipos', actividades: [
            'Inventario de Equipos de Inspección, Medición y Pruebas',
            'Programa Anual de Calibración',
            'Verificación Intermedia',
            'Identificación del Estado de Calibración',
          ]},
        ],
        riesgos: [
          { nombre: 'Fallas Técnicas en la Entrega Final', desc: 'Riesgo de insatisfacción del cliente o fallas post-entrega por omitir inspecciones y pruebas de calidad (puntos de vigilancia) durante las etapas críticas de la ejecución del proyecto.' },
          { nombre: 'Invalidez de Pruebas por Equipos No Aptos', desc: 'Riesgo de que las mediciones y certificaciones entregadas al cliente sean rechazadas por el uso de equipos de medición sin un programa de calibración y verificación vigente, comprometiendo la validez técnica de la obra.' },
          { nombre: 'Incremento de Costos por Retrabajos', desc: 'Riesgo de mermas financieras y retrasos en el cronograma al no detectar desviaciones de calidad de manera oportuna, obligando a realizar correcciones costosas una vez finalizado el servicio.' },
        ],
      },
      {
        id: '6.4',
        nombre: 'Auditoría Interna y Mejora Continua',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Implementar ciclos de aprendizaje que permitan corregir fallas de raíz y elevar el nivel de madurez de la empresa.',
        grupos: [
          { titulo: 'Auditoría Interna del SGC', actividades: [
            'Programa Anual de Auditoría',
            'Formación de Auditores Internos',
            'Ejecución de Auditorías Basadas en Procesos',
            'Informe de Hallazgos y Seguimiento',
          ]},
          { titulo: 'No Conformidades y Acciones Correctivas', actividades: [
            'Identificación y Segregación de lo No Conforme',
            'Disposición de la No Conformidad',
            'Metodología de Análisis de Causa Raíz',
            'Implementación y Verificación de la Eficacia',
          ]},
          { titulo: 'Revisión por la Dirección', actividades: [
            'Preparación de la Entrada de Información',
            'Sesión de Revisión Directiva',
            'Asignación de Recursos para la Mejora',
            'Minuta de Compromisos Operativos',
          ]},
        ],
        riesgos: [
          { nombre: 'Ceguera de Taller y Degradación de Procesos', desc: 'Riesgo de que las malas prácticas se vuelvan sistémicas al no contar con un programa de auditorías internas que cuestione la efectividad de los controles actuales y valide el cumplimiento del SGC.' },
          { nombre: 'Recurrencia de Fallas por Análisis Deficiente', desc: 'Riesgo de repetir los mismos errores operativos al tratar los productos o servicios no conformes solo como "emergencias", sin aplicar acciones correctivas basadas en un análisis de causa raíz institucionalizado.' },
          { nombre: 'Desalineación Estratégica de la Calidad', desc: 'Riesgo de que el Sistema de Gestión se vuelva un ente administrativo muerto si no existe una revisión por la dirección periódica que asigne recursos y tome decisiones basadas en el desempeño real de los indicadores.' },
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
    riesgosTotal: 6,
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
          { titulo: 'Materialidad de Operaciones', actividades: [
            'Integración del Expediente de Defensa',
            'Evidencia Fotográfica y Geolocalización',
            'Validación de Capacidad Operativa',
          ]},
          { titulo: 'Gestión de CFDI', actividades: [
            'Descarga Masiva de CFDI',
            'Identificación de Facturas Canceladas',
            'Conciliación de Complementos de Pago',
          ]},
          { titulo: 'Monitoreo de Listas Negras', actividades: [
            'Cruce Quincenal de RFCs',
            'Protocolo de Sustitución Inmediata',
            'Análisis Retroactivo',
          ]},
          { titulo: 'Control de Activos Fijos', actividades: [
            'Cotejo de Números de Serie',
            'Revisión de Pedimentos',
            'Bitácora de Depreciación',
          ]},
        ],
        riesgos: [
          { nombre: 'Desconocimiento de Deducciones por Falta de Evidencia', desc: 'Riesgo de que la autoridad fiscal considere como "simulados" los servicios subcontratados o compras críticas por no contar con el expediente de defensa (entregables, bitácoras, fotos) que demuestre que el servicio realmente existió.' },
          { nombre: 'Contaminación de la Cadena de Suministro', desc: 'Riesgo de realizar operaciones con proveedores listados como EFOS (empresas que Facturan Operaciones Simuladas) por no contar con un monitoreo preventivo y recurrente de las listas negras del SAT.' },
          { nombre: 'Responsabilidad Solidaria en Delitos Fiscales', desc: 'Riesgo de que la empresa sea vinculada a esquemas de defraudación fiscal de terceros por falta de una política de "Debida Diligencia" en la contratación de proveedores de servicios especializados.' },
        ],
      },
      {
        id: '7.2',
        nombre: 'Auditoría Financiera Externa',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Validar de forma independiente la razonabilidad financiera y asegurar la correcta determinación de impuestos.',
        grupos: [
          { titulo: 'Revisión de Ingresos', actividades: [
            'Rastreo de Depósitos No Identificados',
            'Validación de Préstamos y Aportaciones',
          ]},
          { titulo: 'Revisión de Nómina e Impuestos', actividades: [
            'Amarre de Nómina vs. SAT',
            'Auditoría de Retenciones a Terceros',
          ]},
          { titulo: 'Revisión de Gastos', actividades: [
            'Pruebas Selectivas de Gastos',
            'Opinión sobre Contingencias',
          ]},
          { titulo: 'Cierre de Auditoría', actividades: [
            'Reunión de Hallazgos con Dirección',
            'Plan de Acción con Contabilidad',
          ]},
        ],
        riesgos: [
          { nombre: 'Diferencias en la Determinación del ISR', desc: 'Riesgo de subestimar la utilidad fiscal por una incorrecta aplicación de los momentos de acumulación de ingresos en proyectos de larga duración, resultando en multas y recargos.' },
          { nombre: 'Errores en la Retención de Sueldos y Salarios', desc: 'Riesgo de que la empresa deba absorber el costo de impuestos no retenidos correctamente a los empleados, incrementando el gasto de nómina de forma imprevista.' },
          { nombre: 'Falta de Seguimiento a las Acciones Correctivas', desc: 'Riesgo de que los hallazgos de auditoría se repitan año tras año, evidenciando una falta de compromiso institucional con la mejora continua y el cumplimiento.' },
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
    riesgosTotal: 16,
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
          { titulo: 'Pronóstico de Demanda', actividades: [
            'Análisis de Series de Tiempo',
            'Retroalimentación Compras, Ventas y Operaciones',
            'Clasificación ABC de Insumos',
            'Ajuste por Factores Externos',
          ]},
          { titulo: 'Consolidación de Necesidades', actividades: [
            'Identificación de Artículos Transversales',
            'Creación de un Catálogo de Artículos Estándar',
            'Plan de Compras Anual / Semestral',
          ]},
          { titulo: 'Punto de Reorden', actividades: [
            'Cálculo de Inventario Mínimo y Máximo',
            'Definición del Punto de Reorden',
            'Análisis de Variabilidad de la Demanda',
          ]},
          { titulo: 'Presupuesto por Proyecto', actividades: [
            'Configuración de Presupuesto por Centro de Costos',
            'Protocolo de Validación Pre-Compra',
            'Análisis de Desviaciones Real vs Presupuesto',
            'Flujo de Autorización por Jerarquías',
          ]},
        ],
        riesgos: [
          { nombre: 'Cultura de "Bomberazos" en Transición', desc: 'Riesgo de ineficiencia operativa y falta de control financiero debido a que, aunque se busca estructurar la planeación, persiste la inercia de compras de última hora que no permiten una consolidación estratégica de necesidades.' },
          { nombre: 'Desconocimiento de Techos Presupuestales', desc: 'Riesgo de sobrecostos en los proyectos al no tener acceso directo a los presupuestos anuales (centralizados en la Dirección), lo que impide al comprador validar si una requisición excede los márgenes de utilidad antes de ejecutarla.' },
          { nombre: 'Carga Incorrecta a Proyectos', desc: 'Riesgo de errores en el análisis de rentabilidad por parte de contabilidad si el personal operativo no selecciona adecuadamente el proyecto destino en el sistema Microcip al generar la requisición.' },
        ],
      },
      {
        id: '8.2',
        nombre: 'Selección y Alta de Proveedores',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Institucionalizar la transparencia y el blindaje fiscal en la adquisición de bienes.',
        grupos: [
          { titulo: 'Cotización y Selección', actividades: [
            'Solicitud de Cotización',
            'Elaboración del Cuadro Comparativo',
            'Evaluación Técnica y Comercial',
            'Negociación Final',
          ]},
          { titulo: 'Contratación', actividades: [
            'Emisión del Documento Maestro (OC)',
            'Cláusulas de Penalización y Garantía',
            'Gestión de Contratos de Suministro',
            'Aceptación Formal del Proveedor',
          ]},
          { titulo: 'Alta y Validación Fiscal', actividades: [
            'Verificación de la Opinión de Cumplimiento',
            'Cruce con Listas Negras',
            'Validación de la Cédula de Identificación Fiscal y Domicilio',
            'Archivo de Materialidad Preventiva',
          ]},
          { titulo: 'Seguimiento Logístico', actividades: [
            'Monitoreo de Estatus de Operación',
            'Gestión de Incidencias en Tránsito',
            'Actualización del Plan de Operaciones',
          ]},
        ],
        riesgos: [
          { nombre: 'Subjetividad en la Selección (Terna)', desc: 'Riesgo de una elección ineficiente de proveedores al basar el cuadro comparativo en criterios básicos (precio/tiempo) sin un formato de ponderación que incluya garantías o evaluaciones técnicas objetivas según el tipo de insumo.' },
          { nombre: 'Centralización de Autorización en el Director', desc: 'Riesgo de parálisis comercial y operativa (cuello de botella) al requerir el visto bueno del Director General incluso para compras menores, limitando la agilidad de respuesta del área de compras.' },
          { nombre: 'Debilidad en el Alta de Proveedores', desc: 'Riesgo de contingencias fiscales y administrativas al no contar con un proceso estandarizado de recopilación de documentación fiscal (Lista Negra) y validación de cumplimiento normativo antes de dar de alta a nuevos proveedores en Microcip.' },
        ],
      },
      {
        id: '8.3',
        nombre: 'Almacén e Inventarios',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Resguardar el patrimonio y asegurar el flujo eficiente de materiales hacia los proyectos.',
        grupos: [
          { titulo: 'Recepción de Mercancías', actividades: [
            'Cotejo de Documentación',
            'Inspección Física y de Calidad',
            'Generación del "Aviso de Recibo"',
            'Identificación y Etiquetado',
          ]},
          { titulo: 'Control de Inventarios', actividades: [
            'Implementación de PEPS',
            'Ejecución de Inventarios Cíclicos',
            'Conciliación de Diferencias',
            'Análisis de Inventario Obsoleto o de Lento Movimiento',
          ]},
          { titulo: 'Almacenamiento', actividades: [
            'Diseño de Layout por Velocidad',
            'Control de Accesos y Seguridad Física',
            'Gestión de Ubicaciones Logísticas',
            'Mantenimiento de Condiciones de Almacenaje',
          ]},
          { titulo: 'Salidas y Distribución', actividades: [
            'Validación de Requisición de Salida',
            'Picking y Packing',
            'Logística de Distribución (Última Milla)',
            'Retorno de Materiales no Utilizados',
          ]},
        ],
        riesgos: [
          { nombre: 'Falta de Disciplina en el Proceso de Recepción', desc: 'Riesgo de mermas y activos no localizados porque el personal operativo o de almacén en ocasiones "salta" el proceso institucional, tomando productos sin la presencia o validación de compras.' },
          { nombre: 'Ausencia de Pases de Salida y Responsivas', desc: 'Riesgo de pérdida o daño de equipo especializado (drones, cámaras) por no contar con un control documental firmado que vincule el activo a un responsable y a un periodo de tiempo específico de uso.' },
          { nombre: 'Desconexión de Inventarios en Sistema', desc: 'Riesgo de compras duplicadas de consumibles por no tener una integración real entre las existencias físicas del almacén y los saldos registrados en Microcip, lo que impide una validación de existencias previa a la compra.' },
        ],
      },
      {
        id: '8.4',
        nombre: 'Desarrollo de Proveedores',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Asegurar la calidad del suministro y reducir la dependencia de fuentes únicas.',
        grupos: [
          { titulo: 'Evaluación de Desempeño', actividades: [
            'Definición de KPIs de Abastecimiento',
            'Generación de Reportes Periódicos',
            'Sesiones de Retroalimentación',
          ]},
          { titulo: 'Homologación', actividades: [
            'Visitas Técnicas a Instalaciones',
            'Homologación Documental',
            'Evaluación de Riesgo Financiero',
          ]},
          { titulo: 'Alianzas Estratégicas', actividades: [
            'Transferencia de Conocimiento',
            'Acuerdos de Largo Plazo',
            'Incentivos por Mejora',
          ]},
          { titulo: 'Reducción de Dependencia', actividades: [
            'Mapeo de Insumos Críticos de Fuente Única',
            'Desarrollo de Segundas Fuentes',
            'Análisis de Localización (Nearshoring)',
          ]},
        ],
        riesgos: [
          { nombre: 'Inexistencia de Indicadores de Desempeño', desc: 'Riesgo de mantener proveedores deficientes al no contar con un registro histórico de cumplimiento (Fill Rate, calidad, servicio) que permita tomar decisiones de sustitución basadas en datos y no en "confianza".' },
          { nombre: 'Dependencia de Proveedores Específicos', desc: 'Riesgo de vulnerabilidad operativa al concentrar el 70% de los materiales en un solo proveedor, lo que otorga poco poder de negociación y deja a la empresa expuesta ante fallas de ese único suministro.' },
          { nombre: 'Catálogo de Ítems Desestructurado', desc: 'Riesgo de desorden en la base de datos y duplicidad de artículos (ej. adaptadores mal nombrados) que dificulta la trazabilidad de costos históricos y la eficiencia en la captura de requisiciones.' },
        ],
      },
      {
        id: '8.5',
        nombre: 'Estrategia de Compras',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Maximizar la liquidez y rentabilidad mediante la gestión inteligente del capital de trabajo.',
        grupos: [
          { titulo: 'Análisis del Gasto (Spend)', actividades: [
            'Extracción y Limpieza de Datos',
            'Identificación del Top de Proveedores',
            'Detección de "Compras no Autorizadas"',
          ]},
          { titulo: 'Estrategia de Ahorro', actividades: [
            'Negociación por Volumen',
            'Ingeniería de Valor y Sustitución',
            'Cost Avoidance (Evitación de Costos)',
          ]},
          { titulo: 'Total Cost of Ownership', actividades: [
            'Cálculo de Costos Ocultos',
            'Evaluación de Consumibles y Energía',
            'Disposición Final',
          ]},
          { titulo: 'Capital de Trabajo', actividades: [
            'Extensión de Días de Crédito "Días de Flujo"',
            'Gestión de Inventarios en Consignación',
            'Descuento por Pronto Pago',
          ]},
        ],
        riesgos: [
          { nombre: 'Predominio de Compras de Contado', desc: 'Riesgo de estrés en el flujo de caja operativo al no contar con líneas de crédito activas con los proveedores principales, obligando a la empresa a descapitalizarse para adquisiciones inmediatas.' },
          { nombre: 'Costo de Inmediatez por Falta de Planeación', desc: 'Riesgo de mermar el margen de utilidad al recurrir a "proveedores de respaldo" con precios más elevados solo para solventar fallas en la programación de entregas de los proveedores habituales.' },
          { nombre: 'Falta de Análisis de Gasto por Familia', desc: 'Riesgo de perder ahorros por volumen al no analizar en qué categorías se gasta más, impidiendo negociaciones anuales que reduzcan el costo unitario de los insumos más recurrentes.' },
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
    riesgosTotal: 23,
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
          { titulo: 'Aviso de Facturación', actividades: [
            'Emisión del "Ticket o Aviso de Facturación"',
            'Notificación formal de las condiciones particulares de cierre',
            'Verificación de la vigencia del contrato maestro o anexo técnico que ampara la transacción',
          ]},
          { titulo: 'Validación Contractual', actividades: [
            'Validación OC del cliente vs OC sistema',
            'Validación de la "Evidencia de Entrega"',
            'Revisión de la suficiencia presupuestal del cliente',
          ]},
          { titulo: 'Datos Fiscales del Cliente', actividades: [
            'Verificación de la Constancia de Situación Fiscal',
            'Confirmación del "Uso de CFDI"',
            'Validación de correos electrónicos institucionales',
          ]},
        ],
        riesgos: [
          { nombre: 'Discrepancia entre Cotización y Entrega', desc: 'Riesgo de que el cliente rechace la factura al detectar que los conceptos o montos no coinciden con la Orden de Compra o el contrato maestro.' },
          { nombre: 'Falta de Evidencia de Aceptación (Materialidad)', desc: 'Riesgo de no poder sustentar el cobro ante una disputa legal por carecer de actas de entrega o bitácoras firmadas por el cliente.' },
          { nombre: 'Retraso en el Flujo por Notificación Tardía', desc: 'Riesgo de que el área comercial no avise a tiempo el cierre de un hito, posponiendo innecesariamente el inicio del ciclo de cobro.' },
        ],
      },
      {
        id: '9.2',
        nombre: 'Emisión del CFDI',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Garantizar el cumplimiento de los estándares del SAT y la precisión de los datos fiscales.',
        grupos: [
          { titulo: 'Configuración Fiscal', actividades: [
            'Selección del Uso de CFDI y Régimen Fiscal',
            'Determinación del Método de Pago',
            'Asignación de la Forma de Pago',
          ]},
          { titulo: 'Timbrado y Validación', actividades: [
            'Carga de conceptos, cantidades y unidades de medida',
            'Ejecución del timbrado a través del PAC',
            'Verificación de la Relación de CFDI',
          ]},
          { titulo: 'Distribución del Comprobante', actividades: [
            'Generación de la representación impresa (PDF)',
            'Envío masivo/automático del binomio XML + PDF',
            'Carga del comprobante en el portal de proveedores del cliente',
          ]},
        ],
        riesgos: [
          { nombre: 'Errores en Datos Fiscales (Rechazo de Timbrado)', desc: 'Riesgo de retrasos operativos por facturar con datos de la Constancia de Situación Fiscal obsoletos, provocando cancelaciones y reexpediciones.' },
          { nombre: 'Configuración Incorrecta de Nodos Fiscales', desc: 'Riesgo de que el cliente no pueda deducir el gasto por errores en el "Uso de CFDI" o por declarar un método de pago (PUE/PPD) que no corresponde a la realidad comercial.' },
          { nombre: 'Pérdida de Trazabilidad por Sustitución', desc: 'Riesgo de duplicidad de ingresos ante el SAT al cancelar facturas y no relacionar correctamente el UUID del nuevo comprobante con el anterior.' },
        ],
      },
      {
        id: '9.3',
        nombre: 'Seguimiento de Cobranza',
        score: 3.0,
        status: 'Implementado con algunas oportunidades de mejora',
        enfoque: 'Monitorear proactivamente el vencimiento para reducir el ciclo de conversión de efectivo (DSO).',
        grupos: [
          { titulo: 'Gestión Preventiva', actividades: [
            'Confirmación telefónica o vía portal de la recepción y aceptación',
            'Conciliación de fechas',
            'Envío de recordatorios automáticos "amigables" 5 días naturales antes del vencimiento',
          ]},
          { titulo: 'Gestión Correctiva', actividades: [
            'Antigüedad de Saldos',
            'Cobranza directa al cliente',
            'Gestión de aclaraciones',
          ]},
          { titulo: 'Recuperación y Escalamiento', actividades: [
            'Elaboración de convenios o planes de pago para clientes con problemas de liquidez',
            'Gestión de cuentas estratégicas "Escalamiento"',
            'Suspensión de servicios a clientes con morosidad persistente para evitar incrementar la exposición al riesgo',
          ]},
        ],
        riesgos: [
          { nombre: 'Envejecimiento de Cartera (Cuentas Incobrables)', desc: 'Riesgo de pérdida financiera al no contar con una gestión preventiva, permitiendo que las facturas superen los 60 o 90 días sin acciones de recuperación.' },
          { nombre: 'Falta de Confirmación de Aceptación', desc: 'Riesgo de enterarse de que una factura fue rechazada por el cliente hasta el día del vencimiento, perdiendo valiosos días de crédito.' },
          { nombre: 'Dependencia de Promesas Verbales', desc: 'Riesgo de incumplimiento en las proyecciones de flujo de caja al no documentar formalmente las fechas compromiso de pago negociadas.' },
        ],
      },
      {
        id: '9.4',
        nombre: 'Conciliación y Complemento de Pago (REP)',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Conciliar el ingreso bancario y dar cumplimiento a las obligaciones de cierre fiscal.',
        grupos: [
          { titulo: 'Identificación del Pago', actividades: [
            'Monitoreo diario de estados de cuenta bancarios',
            'Aplicación del pago en el ERP',
            'Gestión de remanentes',
          ]},
          { titulo: 'Emisión del REP', actividades: [
            'Generación y timbrado del CFDI con complemento de pago',
            'Validación de nodos de pago',
            'Envío automatizado del XML y PDF del REP al cliente',
          ]},
          { titulo: 'Conciliación Final', actividades: [
            'Cotejo mensual de los depósitos identificados en el estado de cuenta contra los recibos de caja generados en el sistema',
            'Identificación de partidas no conciliadas',
            'Reporte de flujo de efectivo real vs. proyectado para la Dirección General',
          ]},
        ],
        riesgos: [
          { nombre: 'Omisión del Complemento de Pago (REP)', desc: 'Riesgo de sanciones por parte del SAT y molestias al cliente (quien no podrá acreditar el IVA) por no emitir el REP en los plazos legales.' },
          { nombre: 'Aplicación de Pagos Errónea', desc: 'Riesgo de desorden en los estados de cuenta del cliente al aplicar abonos globales a facturas equivocadas, complicando futuras aclaraciones.' },
          { nombre: 'Diferencias por Retenciones o Comisiones', desc: 'Riesgo de mantener saldos pendientes "fantasma" en el sistema por no registrar adecuadamente las retenciones de impuestos o comisiones bancarias en el momento del cobro.' },
        ],
      },
      {
        id: '9.5',
        nombre: 'Dossier de Materialidad y Resguardo',
        score: 2.0,
        status: 'Implementado con muchas oportunidades de mejora',
        enfoque: 'Blindar a la empresa ante futuras auditorías mediante la integración del expediente probatorio.',
        grupos: [
          { titulo: 'Expediente del Cliente', actividades: [
            'Vinculación digital de documentos: Asociación del Contrato + Orden de Compra + Acta de Entrega + CFDI + REP',
            'Resguardo de evidencia técnica: Archivo de bitácoras de obra, reportes fotográficos del "antes y después"',
            'Custodia de comprobantes de pago (SPEI)',
          ]},
          { titulo: 'Contabilidad Electrónica', actividades: [
            'Descarga y validación masiva de XMLs',
            'Monitoreo de listas negras (Art. 69-B)',
            'Respaldo de seguridad',
          ]},
          { titulo: 'Reportes Gerenciales', actividades: [
            'Cálculo y reporte del Días de Ventas Pendientes (DSO)',
            'Análisis de efectividad de cobranza',
            'Evaluación de riesgo de cartera',
          ]},
        ],
        riesgos: [
          { nombre: 'Inexistencia del Dossier de Materialidad', desc: 'Riesgo de que el SAT considere los ingresos como "indebidos" o desconozca la operación al no resguardar las pruebas de que el servicio realmente se ejecutó.' },
          { nombre: 'Vulnerabilidad ante Listas Negras (Art. 69-B)', desc: 'Riesgo de daño reputacional y fiscal al no monitorear si los clientes caen en estatus de "operaciones simuladas" posterior a la venta.' },
          { nombre: 'Pérdida de Información Crítica (XML/PDF)', desc: 'Riesgo de incumplimiento en la conservación de la contabilidad electrónica por no contar con un respaldo seguro fuera del sistema administrativo (ERP).' },
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
  { p: 'Alta',  i: 'Alto',  count: 18, severity: 'critical' },
  { p: 'Alta',  i: 'Medio', count: 14, severity: 'high' },
  { p: 'Alta',  i: 'Bajo',  count: 7,  severity: 'medium' },
  { p: 'Media', i: 'Alto',  count: 16, severity: 'high' },
  { p: 'Media', i: 'Medio', count: 22, severity: 'medium' },
  { p: 'Media', i: 'Bajo',  count: 11, severity: 'low' },
  { p: 'Baja',  i: 'Alto',  count: 9,  severity: 'medium' },
  { p: 'Baja',  i: 'Medio', count: 17, severity: 'low' },
  { p: 'Baja',  i: 'Bajo',  count: 13, severity: 'low' },
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

const KPICard = ({ value, label, sublabel, accent, icon: Icon }) => (
  <Card className="p-5 transition-all duration-200 hover:-translate-y-px"
        style={{ borderColor: accent ? `${accent}33` : COLORS.border }}>
    <div className="flex items-start justify-between mb-4">
      <div className="p-2 rounded" style={{ backgroundColor: `${accent || COLORS.green}14` }}>
        <Icon size={18} style={{ color: accent || COLORS.greenDeep }} strokeWidth={1.5} />
      </div>
    </div>
    <div className="text-3xl font-bold tracking-tight" style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>{value}</div>
    <div className="text-sm font-semibold mt-1" style={{ color: COLORS.inkSoft }}>{label}</div>
    {sublabel && <div className="text-xs mt-1" style={{ color: COLORS.textMuted }}>{sublabel}</div>}
  </Card>
);

const TabButton = ({ active, onClick, icon: Icon, label, count, separator }) => (
  <>
    {separator && <div className="h-5 w-px self-center mx-1" style={{ backgroundColor: COLORS.border }} />}
    <button onClick={onClick}
            className="flex items-center gap-2 px-3.5 py-3 text-xs font-semibold transition-all duration-200 relative whitespace-nowrap"
            style={{ color: active ? COLORS.ink : COLORS.textMuted, backgroundColor: 'transparent' }}>
      <Icon size={14} strokeWidth={1.75} style={{ color: active ? COLORS.greenDeep : COLORS.textMuted }} />
      <span>{label}</span>
      {count != null && (
        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono"
              style={{ backgroundColor: active ? COLORS.greenTint : COLORS.bgSoft,
                       color: active ? COLORS.greenDeep : COLORS.textMuted }}>{count}</span>
      )}
      {active && <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: COLORS.greenDeep }} />}
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
const TabResumen = () => (
  <div className="space-y-6">
    <SectionTitle es="Resumen Ejecutivo del Diagnóstico" en="Executive Diagnostic Summary" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard value={KPIs.scoreGlobal.toFixed(2)} label="Score SCI Global"
               sublabel="Escala 0–5 · Implementado con oportunidades" icon={Activity} accent={COLORS.amber} />
      <KPICard value={KPIs.entrevistados} label="Entrevistados"
               sublabel="Niveles estratégico, directivo y operativo" icon={Target} accent={COLORS.greenDeep} />
      <KPICard value={KPIs.macroprocesos} label="Macroprocesos Evaluados"
               sublabel="Cobertura integral del negocio" icon={Network} accent={COLORS.blue} />
      <KPICard value={KPIs.riesgosIdentificados} label="Riesgos Identificados"
               sublabel="Clasificados por probabilidad e impacto" icon={ShieldAlert} accent={COLORS.red} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.textMuted }}>
          Madurez del Sistema de Control Interno
        </div>
        <div className="flex flex-col items-center py-4">
          <ScoreGauge score={KPIs.scoreGlobal} size="lg" />
          <div className="mt-4 text-center">
            <div className="text-base font-semibold" style={{ color: COLORS.ink }}>
              {getMaturityLabel(KPIs.scoreGlobal)}
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
              <div className="text-xs px-2 py-0.5 rounded font-semibold"
                   style={{ backgroundColor: `${getMaturityColor(p.score)}1A`, color: getMaturityColor(p.score) }}>
                {p.score.toFixed(1)}
              </div>
            </div>
            <div className="text-sm font-bold mb-3" style={{ color: COLORS.ink }}>{p.nombre}</div>
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: COLORS.bgSoft }}>
              <div className="h-full rounded-full transition-all duration-700"
                   style={{ width: `${(p.score / 5) * 100}%`, backgroundColor: getMaturityColor(p.score) }} />
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
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: COLORS.textDim }}>Diagnóstico</span>
              <span className="font-semibold" style={{ color: getMaturityColor(dim.score) }}>
                {getMaturityLabel(dim.score)}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>

    <Card className="p-6" style={{ borderColor: `${COLORS.greenDeep}30`, backgroundColor: COLORS.greenTint }}>
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded" style={{ backgroundColor: COLORS.bgCard }}>
          <Target size={20} style={{ color: COLORS.greenDeep }} strokeWidth={1.75} />
        </div>
        <div className="flex-1">
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
      </div>
    </Card>
  </div>
);

// ============================================================
//  TAB · SCI (con telarañas individuales por nivel)
// ============================================================
const TabSCI = () => {
  const [selected, setSelected] = useState('estrategico');
  const dim = SCI_DIMENSIONS.find(d => d.id === selected);
  const radarData = dim.elementos.map(e => ({
    elemento: e.nombre.length > 22 ? e.nombre.substring(0, 22) + '…' : e.nombre,
    score: e.score, fullMark: 5,
  }));

  return (
    <div className="space-y-6">
      <SectionTitle es="Sistema de Control Interno"
                    en="Internal Control System · Strategic, Directive, Operational" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.textMuted }}>
            Perfil de Madurez · Las tres dimensiones de control
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={RADAR_GLOBAL} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke={COLORS.border} />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: COLORS.ink, fontSize: 13, fontWeight: 700 }} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: COLORS.textMuted, fontSize: 10 }} stroke={COLORS.border} />
              <Radar name="Score" dataKey="score" stroke={COLORS.greenDeep} fill={COLORS.green} fillOpacity={0.30} strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.textMuted }}>
            Escala Andersen 0–5
          </div>
          <div className="space-y-2">
            {MATURITY_LEVELS.map(m => (
              <div key={m.score} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-xs"
                     style={{ backgroundColor: `${m.color}1A`, color: m.color }}>{m.score}</div>
                <div className="text-xs flex-1" style={{ color: COLORS.inkSoft }}>{m.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SCI_DIMENSIONS.map(d => (
          <button key={d.id} onClick={() => setSelected(d.id)}
                  className="text-left p-4 rounded-lg transition-all duration-200"
                  style={{ backgroundColor: selected === d.id ? COLORS.greenTint : COLORS.bgCard,
                           border: `1px solid ${selected === d.id ? COLORS.greenDeep : COLORS.border}`,
                           boxShadow: '0 1px 2px rgba(31,34,37,0.04)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
                {d.reactivos} reactivos · {d.elementos.length} elementos
              </div>
              <ChevronRight size={14} style={{ color: selected === d.id ? COLORS.greenDeep : COLORS.textDim }} />
            </div>
            <div className="text-base font-bold mb-1" style={{ color: COLORS.ink }}>{d.nombre}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold" style={{ color: getMaturityColor(d.score) }}>
                {d.score.toFixed(2)}
              </span>
              <span className="text-xs" style={{ color: COLORS.textDim }}>/ 5.00</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.textMuted }}>
            Telaraña de Elementos · {dim.nombre}
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <RadarChart data={radarData} margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
              <PolarGrid stroke={COLORS.border} />
              <PolarAngleAxis dataKey="elemento" tick={{ fill: COLORS.ink, fontSize: 10, fontWeight: 600 }} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: COLORS.textMuted, fontSize: 9 }} stroke={COLORS.border} />
              <Radar name="Score" dataKey="score" stroke={getMaturityColor(dim.score)}
                     fill={getMaturityColor(dim.score)} fillOpacity={0.25} strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.textMuted }}>
            Score por Elemento Evaluado
          </div>
          <ResponsiveContainer width="100%" height={Math.max(300, dim.elementos.length * 60)}>
            <BarChart data={dim.elementos} layout="vertical" margin={{ top: 10, right: 50, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderSoft} horizontal={false} />
              <XAxis type="number" domain={[0, 5]} tick={{ fill: COLORS.textMuted, fontSize: 11 }} stroke={COLORS.border} />
              <YAxis type="category" dataKey="nombre" tick={{ fill: COLORS.ink, fontSize: 11 }}
                     stroke={COLORS.border} width={170} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(113,178,72,0.08)' }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {dim.elementos.map((e, i) => <Cell key={i} fill={getMaturityColor(e.score)} />)}
                <LabelList dataKey="score" position="right" formatter={(v) => v.toFixed(2)}
                           style={{ fill: COLORS.ink, fontSize: 11, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6"
            style={{ borderColor: `${getMaturityColor(dim.score)}30`,
                     backgroundColor: `${getMaturityColor(dim.score)}08` }}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0"><ScoreGauge score={dim.score} size="md" /></div>
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider mb-1"
                 style={{ color: getMaturityColor(dim.score) }}>
              Síntesis Ejecutiva · {dim.nombre}
            </div>
            <div className="text-base font-bold mb-2" style={{ color: COLORS.ink }}>
              {getMaturityLabel(dim.score)}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: COLORS.inkSoft }}>{dim.resumen}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
          Hallazgos Principales · {dim.elementos.length} elementos
        </div>
        {dim.elementos.map((el, i) => {
          const sev = SEVERITY[el.criticidad];
          return (
            <Card key={i} className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center" style={{ minWidth: 70 }}>
                  <div className="text-2xl font-bold" style={{ color: getMaturityColor(el.score) }}>
                    {el.score.toFixed(2)}
                  </div>
                  <div className="text-xs px-2 py-0.5 mt-1 rounded font-semibold"
                       style={{ backgroundColor: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                    {sev.label}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-base font-bold mb-2" style={{ color: COLORS.ink }}>{el.nombre}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-semibold mb-1" style={{ color: COLORS.greenDeep }}>Hallazgo</div>
                      <div style={{ color: COLORS.inkSoft }} className="leading-relaxed">{el.hallazgo}</div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1" style={{ color: COLORS.amber }}>Impacto al Negocio</div>
                      <div style={{ color: COLORS.inkSoft }} className="leading-relaxed">{el.impacto}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
//  COMPONENTE REUSABLE · VISTA DETALLADA DE MACROPROCESO
// ============================================================
const MacroprocesoView = ({ proc }) => {
  const radarData = proc.subprocesos.map(sp => ({
    subproceso: sp.nombre.length > 22 ? sp.nombre.substring(0, 22) + '…' : sp.nombre,
    score: sp.score, fullMark: 5,
  }));
  const totalActividades = proc.subprocesos.reduce(
    (acc, sp) => acc + sp.grupos.reduce((a, g) => a + g.actividades.length, 0), 0);

  return (
    <div className="space-y-6">
      <SectionTitle es={proc.nombre} en={`Process ${proc.code} · Detailed Diagnostic`} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard value={proc.score.toFixed(2)} label="Score del Macroproceso"
                 sublabel={getMaturityLabel(proc.score)} icon={Activity} accent={getMaturityColor(proc.score)} />
        <KPICard value={proc.subprocesos.length} label="Subprocesos Nivel 2"
                 sublabel={`${totalActividades} actividades evaluadas`} icon={Layers} accent={COLORS.blue} />
        <KPICard value={proc.riesgosTotal} label="Riesgos Identificados"
                 sublabel={`Criticidad ${SEVERITY[proc.criticidad].label.toLowerCase()}`}
                 icon={ShieldAlert} accent={SEVERITY[proc.criticidad].color} />
        <KPICard value={proc.code} label="Código del Macroproceso"
                 sublabel="Framework Andersen Consulting" icon={GitBranch} accent={COLORS.greenDeep} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="p-6 lg:col-span-3">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.textMuted }}>
            Telaraña de Madurez · Subprocesos
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radarData} margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
              <PolarGrid stroke={COLORS.border} />
              <PolarAngleAxis dataKey="subproceso" tick={{ fill: COLORS.ink, fontSize: 10, fontWeight: 600 }} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: COLORS.textMuted, fontSize: 9 }} stroke={COLORS.border} />
              <Radar name="Score" dataKey="score" stroke={getMaturityColor(proc.score)}
                     fill={getMaturityColor(proc.score)} fillOpacity={0.25} strokeWidth={2} />
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
            <div className="mt-4 text-center">
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
              {proc.subprocesos.map((s, i) => <Cell key={i} fill={getMaturityColor(s.score)} />)}
              <LabelList dataKey="score" position="right" formatter={(v) => v.toFixed(2)}
                         style={{ fill: COLORS.ink, fontSize: 11, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
          Detalle por Subproceso · {proc.subprocesos.length} áreas
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
                  <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.bgSoft }}>
                    <div className="h-full rounded-full transition-all duration-700"
                         style={{ width: `${(sp.score / 5) * 100}%`, backgroundColor: getMaturityColor(sp.score) }} />
                  </div>
                </div>
              </div>
              <div className="text-xs italic leading-relaxed pt-1" style={{ color: COLORS.inkSoft }}>
                <span className="font-semibold not-italic" style={{ color: COLORS.greenDeep }}>Enfoque · </span>
                {sp.enfoque}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
              <div className="p-5 lg:col-span-3" style={{ borderRight: `1px solid ${COLORS.borderSoft}` }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.greenDeep }}>
                  Actividades Operativas · Nivel 3
                </div>
                <div className="space-y-4">
                  {sp.grupos.map((g, gi) => (
                    <div key={gi}>
                      <div className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: COLORS.ink }}>
                        <div className="w-1 h-3 rounded-sm" style={{ backgroundColor: COLORS.greenDeep }} />
                        {g.titulo}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pl-3">
                        {g.actividades.map((a, ai) => (
                          <div key={ai} className="flex items-start gap-2 text-xs" style={{ color: COLORS.inkSoft }}>
                            <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: COLORS.textMuted }} />
                            <span className="leading-relaxed">{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 lg:col-span-2" style={{ backgroundColor: COLORS.bgElev }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                     style={{ color: COLORS.red }}>
                  <AlertTriangle size={12} strokeWidth={2} />
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ============================================================
//  TAB · MATRIZ DE RIESGOS
// ============================================================
const TabRiesgos = () => {
  const total = RIESGOS_POR_CATEGORIA.reduce((s, r) => s + r.cantidad, 0);
  return (
    <div className="space-y-6">
      <SectionTitle es="Matriz de Riesgos Empresariales"
                    en="Enterprise Risk Matrix · 127 Identified Risks" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard value={total} label="Riesgos Identificados"
                 sublabel="Cobertura integral 9 macroprocesos" icon={ShieldAlert} accent={COLORS.red} />
        <KPICard value="32" label="Críticos / Altos"
                 sublabel="Atención inmediata · Fase 1" icon={AlertTriangle} accent={COLORS.amber} />
        <KPICard value="60%" label="Mitigables 0–6 meses"
                 sublabel="Con instrumentación de SCI" icon={TrendingDown} accent={COLORS.greenDeep} />
        <KPICard value="8" label="Categorías de Riesgo"
                 sublabel="Operativos, financieros, fiscales y más" icon={GitBranch} accent={COLORS.blue} />
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
                  return (
                    <div key={imp}
                         className="aspect-square rounded flex flex-col items-center justify-center transition-all hover:scale-[1.02]"
                         style={{ backgroundColor: sev.bg, border: `1px solid ${sev.border}` }}>
                      <div className="text-2xl font-bold" style={{ color: sev.color }}>{cell.count}</div>
                      <div className="text-[10px] uppercase tracking-wider mt-1 font-semibold" style={{ color: sev.color }}>
                        {sev.label}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="text-xs mt-4 leading-relaxed" style={{ color: COLORS.textMuted }}>
            32 riesgos en zona crítica/alta requieren mitigación inmediata. 73 riesgos medios entran al programa de mejora continua.
          </div>
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
    <SectionTitle es="Programa de Mejora Continua" en="Strategic Improvement Roadmap · 18 Months" />

    <Card className="p-6" style={{ borderColor: `${COLORS.greenDeep}30`, backgroundColor: COLORS.greenTint }}>
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded" style={{ backgroundColor: COLORS.bgCard }}>
          <Route size={20} style={{ color: COLORS.greenDeep }} strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.greenDeep }}>
            Tesis del Programa
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>Ganar más con las mismas ventas</h3>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.inkSoft }}>
            La rentabilidad no llegará por más facturación, sino por eliminar los problemas ocultos
            que hoy drenan utilidad: descentralizar la autoridad, instrumentar la medición,
            institucionalizar la operación y blindar el patrimonio. Tres fases secuenciales para
            transitar de 2.12 a 4.00 en el SCI en 18 meses.
          </p>
        </div>
      </div>
    </Card>

    <div className="space-y-4">
      {ROADMAP.map((r, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="p-6">
            <div className="roadmap-row">
              <div>
                <div className="text-xs font-mono mb-1" style={{ color: r.color }}>{r.fase}</div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>{r.titulo}</h3>
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
                      <ArrowUpRight size={12} style={{ color: r.color, marginTop: 3 }} strokeWidth={2} />
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
const ICON_BY_PROC = {
  m01: Megaphone, m02: Briefcase, m03: Cog, m04: Users, m05: Wallet,
  m06: CheckCircle2, m07: FileSearch, m08: ShoppingCart, m09: FileText,
};

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard, group: 'overview' },
  { id: 'sci', label: 'SCI', icon: Activity, count: 3, group: 'overview' },
  ...MACROPROCESOS.map(m => ({
    id: m.id, label: m.nombreCorto, icon: ICON_BY_PROC[m.id], count: m.subprocesos.length, group: 'process',
  })),
  { id: 'riesgos', label: 'Riesgos', icon: ShieldAlert, count: 127, group: 'closing' },
  { id: 'roadmap', label: 'Roadmap', icon: Route, count: 3, group: 'closing' },
];

export default function SolticomDashboard() {
  const [tab, setTab] = useState('resumen');

  const renderContent = () => {
    if (tab === 'resumen') return <TabResumen />;
    if (tab === 'sci') return <TabSCI />;
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
          .roadmap-row { grid-template-columns: 200px 1fr 240px; gap: 1.5rem; }
        }
      `}</style>
      {/* Header · Andersen Consulting Branding */}
      <header className="px-8 pt-10 pb-6 relative"
              style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bgCard }}>
        {/* Swoosh decorativo Andersen */}
        <svg width="180" height="22" viewBox="0 0 180 22"
             style={{ position: 'absolute', top: 12, left: 32, opacity: 0.95 }}>
          <path d="M 5 18 Q 90 -8 175 14"
                fill="none" stroke={COLORS.green} strokeWidth="6" strokeLinecap="round" />
        </svg>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-6">
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
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest font-bold"
                   style={{ color: COLORS.textMuted }}>
                Score SCI Global
              </div>
              <div className="text-4xl font-bold tracking-tight"
                   style={{ color: getMaturityColor(KPIs.scoreGlobal), fontFamily: FONT_SERIF }}>
                {KPIs.scoreGlobal.toFixed(2)}
                <span className="text-base font-normal ml-1"
                      style={{ color: COLORS.textMuted, fontFamily: FONT_SANS }}>/ 5.00</span>
              </div>
            </div>
            <div className="h-14 w-px" style={{ backgroundColor: COLORS.border }} />
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest font-bold"
                   style={{ color: COLORS.textMuted }}>
                Riesgos
              </div>
              <div className="text-4xl font-bold tracking-tight"
                   style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
                {KPIs.riesgosIdentificados}
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
                         icon={t.icon} label={t.label} count={t.count} separator={showSeparator} />
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
            <div className="text-sm font-bold tracking-tight"
                 style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
              A N D E R S E N
              <span style={{ color: COLORS.green }}>  C O N S U L T I N G</span>
            </div>
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
    </div>
  );
}
