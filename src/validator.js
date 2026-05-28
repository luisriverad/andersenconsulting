// ============================================================
//  VALIDATOR · Verifica que un JSON de cliente sea válido
//  Devuelve { valid: bool, errors: string[], warnings: string[] }
// ============================================================

const REQUIRED_TOP_KEYS = [
  'meta', 'kpis', 'conclusionEjecutiva', 'mapaValor',
  'topCriticos', 'tiposRiesgo', 'roadmap', 'decisionEstrategica', 'procesos',
];

const REQUIRED_META_KEYS = [
  'cliente', 'razonSocial', 'evaluacion', 'sector', 'framework',
  'tituloDashboard', 'tituloAcento', 'subtitulo',
];

const REQUIRED_KPI_KEYS = [
  'hallazgosTotal', 'criticosMuerte', 'altos', 'medios', 'bajos', 'procesos',
];

const REQUIRED_PROCESO_KEYS = [
  'id', 'code', 'nombre', 'nombreCorto', 'iconKey', 'sintesis', 'hallazgos',
];

const REQUIRED_HALLAZGO_KEYS = ['id', 'sev', 'desc', 'tipo'];

const VALID_SEVERITIES = ['critical', 'high', 'medium', 'low', 'ok'];

export function validateClientData(data) {
  const errors = [];
  const warnings = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['El archivo no contiene un objeto JSON válido.'], warnings: [] };
  }

  // Top-level keys
  REQUIRED_TOP_KEYS.forEach(key => {
    if (!(key in data)) errors.push(`Falta la sección obligatoria: "${key}"`);
  });
  if (errors.length) return { valid: false, errors, warnings };

  // meta
  REQUIRED_META_KEYS.forEach(key => {
    if (!data.meta[key]) errors.push(`meta.${key} es requerido`);
  });

  // kpis
  REQUIRED_KPI_KEYS.forEach(key => {
    if (typeof data.kpis[key] !== 'number') errors.push(`kpis.${key} debe ser número`);
  });

  // procesos
  if (!Array.isArray(data.procesos)) {
    errors.push('procesos debe ser un array');
  } else {
    data.procesos.forEach((p, i) => {
      REQUIRED_PROCESO_KEYS.forEach(k => {
        if (!(k in p)) errors.push(`procesos[${i}].${k} es requerido`);
      });
      if (!Array.isArray(p.hallazgos)) {
        errors.push(`procesos[${i}].hallazgos debe ser un array`);
      } else {
        p.hallazgos.forEach((h, j) => {
          REQUIRED_HALLAZGO_KEYS.forEach(k => {
            if (!(k in h)) errors.push(`procesos[${i}].hallazgos[${j}].${k} es requerido`);
          });
          if (h.sev && !VALID_SEVERITIES.includes(h.sev)) {
            errors.push(`procesos[${i}].hallazgos[${j}].sev debe ser uno de: ${VALID_SEVERITIES.join(', ')}`);
          }
        });
      }
    });
  }

  // mapaValor
  if (!Array.isArray(data.mapaValor)) {
    errors.push('mapaValor debe ser un array');
  } else {
    data.mapaValor.forEach((row, i) => {
      if (!row.eje || !row.id || !Array.isArray(row.celdas)) {
        errors.push(`mapaValor[${i}] requiere eje, id y celdas[]`);
      } else {
        row.celdas.forEach((c, j) => {
          if (!c.nombre || !c.sev) {
            errors.push(`mapaValor[${i}].celdas[${j}] requiere nombre y sev`);
          }
          if (c.sev && !VALID_SEVERITIES.includes(c.sev)) {
            errors.push(`mapaValor[${i}].celdas[${j}].sev inválido (${c.sev})`);
          }
        });
      }
    });
  }

  // roadmap
  if (!Array.isArray(data.roadmap) || data.roadmap.length === 0) {
    warnings.push('roadmap está vacío o no es un array');
  }

  // Cross-checks (warnings, no errors)
  if (data.procesos && Array.isArray(data.procesos)) {
    const totalHallazgos = data.procesos.reduce((acc, p) => acc + (p.hallazgos?.length || 0), 0);
    if (totalHallazgos !== data.kpis.hallazgosTotal) {
      warnings.push(`kpis.hallazgosTotal (${data.kpis.hallazgosTotal}) no coincide con la suma de hallazgos en procesos (${totalHallazgos})`);
    }
    const conteoCriticos = data.procesos.reduce(
      (acc, p) => acc + p.hallazgos.filter(h => h.sev === 'critical').length, 0
    );
    if (conteoCriticos !== data.kpis.criticosMuerte) {
      warnings.push(`kpis.criticosMuerte (${data.kpis.criticosMuerte}) no coincide con los hallazgos críticos contados (${conteoCriticos})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
