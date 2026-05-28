import React, { useState, useMemo, useRef, useEffect } from 'react';
import { COLORS, FONT_SERIF, FONT_SANS } from './theme';

// ============================================================
//  SEVERITY · Configuración universal (no depende del cliente)
// ============================================================
const SEVERITY = {
  critical: { color: '#6B2D8C', label: 'Crítico (Muerte)', short: 'Crítico',
              bg: '#F3EBF7', border: '#C5A9D6' },
  high:     { color: '#A6192E', label: 'Grave (Importante)', short: 'Grave',
              bg: '#FAEFF1', border: '#E8B4BC' },
  medium:   { color: '#D9941E', label: 'Medio (Mejoras)', short: 'Medio',
              bg: '#FBF3DC', border: '#E8D08F' },
  low:      { color: '#5A9136', label: 'Bajo', short: 'Bajo',
              bg: '#EAF3DF', border: '#A8C29E' },
  ok:       { color: '#5A9136', label: 'Sin Observaciones', short: 'OK',
              bg: '#EAF3DF', border: '#A8C29E' },
};

// ============================================================
//  COMPONENTES BASE
// ============================================================
const SectionTitle = ({ es }) => (
  <div className="mb-6">
    <h2 className="text-3xl font-bold leading-tight tracking-tight"
        style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>{es}</h2>
    <div className="mt-3 h-px w-12" style={{ backgroundColor: COLORS.greenDeep }} />
  </div>
);

const Card = ({ children, className = '', style = {} }) => (
  <div className={`rounded-lg ${className}`}
       style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
                boxShadow: '0 1px 2px rgba(31,34,37,0.04)', ...style }}>{children}</div>
);

const KPICard = ({ value, label, sublabel, accent, bg }) => (
  <Card className="p-5 transition-all duration-200 hover:-translate-y-px"
        style={{ borderColor: accent ? `${accent}55` : COLORS.border,
                 ...(bg ? { backgroundColor: bg } : {}) }}>
    <div className="h-1 w-8 rounded-full mb-4" style={{ backgroundColor: accent || COLORS.greenDeep }} />
    <div className="text-3xl font-bold tracking-tight"
         style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>{value}</div>
    <div className="text-sm font-semibold mt-1" style={{ color: COLORS.inkSoft }}>{label}</div>
    {sublabel && <div className="text-xs mt-1" style={{ color: COLORS.textMuted }}>{sublabel}</div>}
  </Card>
);

const SeverityBadge = ({ sev }) => {
  const config = SEVERITY[sev];
  if (!config) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider"
          style={{ backgroundColor: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
      {config.short}
    </span>
  );
};

// Botón "Generar plan de acción" (mismo en Matriz de Riesgos y en cada proceso)
const PlanButton = ({ open, onClick }) => (
  <button onClick={onClick}
          className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded transition-all duration-150"
          style={{ whiteSpace: 'nowrap',
                   backgroundColor: open ? COLORS.greenDeep : COLORS.bgCard,
                   color: open ? COLORS.bgCard : COLORS.greenDeep,
                   border: `1px solid ${COLORS.greenDeep}` }}>
    {open ? 'Ocultar plan' : 'Generar plan de acción'}
  </button>
);

// Box con el plan de acción 30/60/90 (reutilizado en ambas vistas)
const fmtK = (n) => `$${Math.round(n / 1000)}K`;
const fmtFull = (n) => `$${n.toLocaleString('es-MX')}`;

const ESTADO_COLOR = {
  'Pendiente de acción': COLORS.amber,
  'Notificado': COLORS.blue,
  'En seguimiento': COLORS.ok,
  'Por escalar': COLORS.red,
};

const PanelLabel = ({ children, extra }) => (
  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
    <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COLORS.greenDeep }}>{children}</div>
    {extra}
  </div>
);

// Panel ejecutivo de plan de acción (análisis asistido por IA, datos horneados)
const ActionPlan = ({ plan, analisis: a }) => {
  if (!plan && !a) {
    return (
      <p className="text-xs italic" style={{ color: COLORS.textMuted }}>
        Plan de acción no disponible para este hallazgo.
      </p>
    );
  }
  return (
    <div className="space-y-5">
      {/* Banner IA */}
      <div className="flex items-center justify-between flex-wrap gap-2 rounded-lg px-3 py-2"
           style={{ backgroundColor: COLORS.ink }}>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"
             style={{ color: COLORS.bgCard }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS.green }} />
          Plan de acción asistido por IA
        </div>
        {a && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: COLORS.bgCard }}>
            {a.confianza}% confianza
          </span>
        )}
      </div>

      {a && (
        <>
          {/* Impacto financiero */}
          <div>
            <PanelLabel>Impacto financiero proyectado</PanelLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.redTint, border: `1px solid ${COLORS.redBorder}` }}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: COLORS.red }}>Costo de no actuar</div>
                <div className="text-3xl font-bold tracking-tight" style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>{fmtK(a.impacto.costoNoActuar)}</div>
                <div className="text-[11px] mt-1" style={{ color: COLORS.textMuted }}>En los próximos {a.impacto.ventanaDias} días</div>
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.bgSoft, border: `1px solid ${COLORS.border}` }}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: COLORS.textMuted }}>{a.impacto.costoSecundarioLabel}</div>
                <div className="text-3xl font-bold tracking-tight" style={{ color: COLORS.inkSoft, fontFamily: FONT_SERIF }}>{fmtK(a.impacto.costoSecundario)}</div>
              </div>
            </div>
          </div>

          {/* Causa raíz */}
          <div>
            <PanelLabel extra={<span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: COLORS.greenTint, color: COLORS.greenDeep }}>{a.confianza}% confianza</span>}>
              Análisis de causa raíz
            </PanelLabel>
            <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.bgElev, border: `1px solid ${COLORS.borderSoft}` }}>
              <div className="text-sm font-bold mb-2" style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>{a.causaRaiz.titulo}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.textMuted }}>Factores correlacionados</div>
              <ul className="space-y-1">
                {a.causaRaiz.factores.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: COLORS.inkSoft }}>
                    <span style={{ color: COLORS.greenDeep }}>•</span><span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Plan 30/60/90 */}
      {plan && (
        <div>
          <PanelLabel>Plan de acción · 30 · 60 · 90 días</PanelLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[['0 – 30 días', plan.d30, COLORS.death],
              ['30 – 60 días', plan.d60, COLORS.amber],
              ['60 – 90 días', plan.d90, COLORS.ok]].map(([titulo, acciones, color]) => (
              <div key={titulo} className="rounded-lg p-3" style={{ backgroundColor: COLORS.bgElev, border: `1px solid ${COLORS.borderSoft}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: COLORS.ink }}>{titulo}</div>
                </div>
                <ul className="space-y-1.5">
                  {(acciones || []).map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: COLORS.inkSoft }}>
                      <span style={{ color }}>•</span><span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {a && (
        <>
          {/* Escenarios simulados */}
          <div>
            <PanelLabel>Escenarios simulados</PanelLabel>
            <div className="space-y-2">
              {a.escenarios.map((e) => (
                <div key={e.nombre} className="flex items-center justify-between gap-3 rounded-lg px-4 py-2.5"
                     style={{ backgroundColor: e.recomendado ? COLORS.okTint : COLORS.bgElev,
                              border: `1px solid ${e.recomendado ? COLORS.okBorder : COLORS.borderSoft}` }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold" style={{ color: e.recomendado ? COLORS.ok : COLORS.inkSoft }}>{e.nombre}</span>
                    {e.recomendado && <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: COLORS.ok, color: COLORS.bgCard }}>Recomendado</span>}
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-sm font-bold tracking-tight" style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>{fmtFull(e.monto)}</span>
                    <span className="text-[11px]" style={{ color: COLORS.textMuted }}>{e.dias} días</span>
                    <span className="text-[11px] font-bold" style={{ color: COLORS.inkSoft }}>{e.prob}% prob.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Responsables por área */}
          <div>
            <PanelLabel extra={<span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: COLORS.bgSoft, color: COLORS.textMuted }}>{a.responsables.length} asignaciones</span>}>
              Responsables sugeridos · por área
            </PanelLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {a.responsables.map((r, i) => (
                <div key={i} className="rounded-lg p-3" style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.borderSoft}` }}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold" style={{ color: COLORS.ink }}>{r.area}</span>
                    <span className="text-[8px]" style={{ color: COLORS.textDim }}>{r.t}</span>
                  </div>
                  <span className="inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${ESTADO_COLOR[r.estado] || COLORS.textMuted}22`, color: ESTADO_COLOR[r.estado] || COLORS.textMuted }}>
                    {r.estado}
                  </span>
                  <div className="text-[11px] leading-relaxed mt-1.5" style={{ color: COLORS.inkSoft }}>{r.accion}</div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {r.canales.map((c) => (
                      <span key={c} className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: COLORS.bgSoft, color: COLORS.textMuted }}>{c}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones recomendadas */}
          <div>
            <PanelLabel>Acciones recomendadas</PanelLabel>
            <div className="space-y-1.5">
              {a.acciones.map((ac, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ backgroundColor: COLORS.bgElev }}>
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: COLORS.greenDeep, color: COLORS.bgCard }}>{i + 1}</span>
                  <span className="text-xs" style={{ color: COLORS.ink }}>{ac}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notificación generada */}
          <div>
            <PanelLabel extra={<span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: COLORS.greenTint, color: COLORS.greenDeep }}>vía {a.alerta.canal}</span>}>
              Notificación automática · borrador
            </PanelLabel>
            <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.ink }}>
              <div className="text-[11px] font-bold mb-1.5" style={{ color: COLORS.green }}>{a.alerta.titulo}</div>
              <div className="text-xs leading-relaxed" style={{ color: '#E8E3D9' }}>{a.alerta.cuerpo}</div>
              <div className="text-[9px] mt-2 text-right" style={{ color: COLORS.textDim }}>Borrador generado por IA · no enviado</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================
//  COMPUTED · Deriva conteoSeveridad por proceso desde hallazgos
// ============================================================
const computeProcessSeverity = (proc) => {
  return {
    critical: proc.hallazgos.filter(h => h.sev === 'critical').length,
    high: proc.hallazgos.filter(h => h.sev === 'high').length,
    medium: proc.hallazgos.filter(h => h.sev === 'medium').length,
    low: proc.hallazgos.filter(h => h.sev === 'low').length,
  };
};

// ============================================================
//  MATCH · Vincula una celda del Mapa de Valor al proceso más
//  relacionado (por coincidencia de términos con su nombre y síntesis)
// ============================================================
const STOPWORDS = new Set([
  'de', 'del', 'la', 'el', 'los', 'las', 'y', 'e', 'o', 'u', 'en', 'a', 'al',
  'con', 'para', 'por', 'su', 'sus', 'un', 'una', 'unos', 'unas', 'que', 'se',
  'sin', 'son', 'mas', 'muy',
]);

const tokenize = (s) => (s || '')
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')   // quita acentos
  .replace(/[^a-z0-9ñ\s]/g, ' ')
  .split(/\s+/)
  .filter(t => t.length > 2 && !STOPWORDS.has(t));

// Devuelve el proceso más relacionado, o null si no hay coincidencia confiable.
const findRelatedProceso = (celda, procesos) => {
  const cellTokens = [...new Set(tokenize(celda.nombre))];
  if (cellTokens.length === 0) return null;
  let best = null;
  let bestScore = 0;
  procesos.forEach((p) => {
    const nameTokens = new Set(tokenize(`${p.nombre} ${p.nombreCorto || ''}`));
    const synTokens = new Set(tokenize(p.sintesis));
    const hallTokens = new Set(tokenize((p.hallazgos || []).map(h => `${h.desc} ${h.tipo || ''}`).join(' ')));
    let score = 0;
    cellTokens.forEach((t) => {
      if (nameTokens.has(t)) score += 3;
      else if (synTokens.has(t)) score += 1;
      else if (hallTokens.has(t)) score += 0.5;
    });
    if (score > bestScore) { bestScore = score; best = p; }
  });
  // Exige al menos una coincidencia a nivel del nombre del proceso (score >= 3)
  return bestScore >= 3 ? best : null;
};

// Explicación de respaldo (según la severidad/color) si la celda no trae una propia
const explicacionPorSeveridad = {
  critical: 'Morado (Crítico / Muerte): representa un riesgo de muerte patrimonial que amenaza la continuidad del negocio y exige acción inmediata.',
  high: 'Rojo (Grave / Importante): es una debilidad importante de gobierno corporativo que requiere atención prioritaria.',
  medium: 'Ámbar (Medio / Mejoras): representa una oportunidad de mejora, sin un riesgo inmediato.',
  low: 'Verde (Bajo): hallazgo menor, sin impacto material relevante.',
  ok: 'Verde (Sin observaciones): opera de forma adecuada; sin hallazgos relevantes en esta evaluación.',
};

// ============================================================
//  MAPA DE VALOR · MATRIZ VISUAL (pieza estrella del Resumen)
// ============================================================
const MapaValorMatrix = ({ data, onSelectProceso }) => {
  const [openCell, setOpenCell] = useState(null);
  return (
  <Card className="p-6">
    {openCell && <div className="fixed inset-0 z-40" onClick={() => setOpenCell(null)} />}
    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
      <div>
        <h3 className="text-2xl font-bold tracking-tight" style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
          Mapa de Valor en {data.meta.cliente}
        </h3>
        <p className="text-sm italic mt-0.5" style={{ color: COLORS.textMuted, fontFamily: FONT_SERIF }}>
          Diagnóstico ejecutivo
        </p>
      </div>
      <div className="text-right">
        <div className="text-xs uppercase tracking-widest" style={{ color: COLORS.textMuted }}>
          Generación del Valor
        </div>
        <div className="text-base font-bold" style={{ color: COLORS.greenDeep, fontFamily: FONT_SERIF }}>
          del Gobierno Corporativo
        </div>
      </div>
    </div>

    <div className="mt-6 flex gap-3">
      <div className="flex-shrink-0 flex items-center justify-center rounded"
           style={{ backgroundColor: '#2D4F73', color: COLORS.bgCard, width: 50 }}>
        <div className="text-xs font-bold uppercase tracking-widest text-center"
             style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: FONT_SERIF }}>
          Generación del Valor del Gobierno Corporativo
        </div>
      </div>

      <div className="flex-1 space-y-1.5">
        {data.mapaValor.map((row) => (
          <div key={row.id} className="flex gap-1.5">
            <div className="flex-shrink-0 rounded p-2.5 flex items-center justify-center"
                 style={{ backgroundColor: '#BFD8E8', width: 140 }}>
              <div className="text-xs font-bold text-center leading-tight uppercase"
                   style={{ color: '#1A1A1A' }}>{row.eje}</div>
            </div>
            {row.celdas.map((celda, j) => {
              const config = SEVERITY[celda.sev];
              const cellKey = `${row.id}-${j}`;
              const isOpen = openCell === cellKey;
              const rel = findRelatedProceso(celda, data.procesos);
              return (
                <div key={j} className="relative flex-1 min-w-0">
                  <button
                    onClick={() => setOpenCell(isOpen ? null : cellKey)}
                    className="w-full rounded p-2.5 flex items-center justify-center transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                    style={{ backgroundColor: config.color, minHeight: 68,
                             outline: isOpen ? `2px solid ${COLORS.ink}` : 'none', outlineOffset: 2 }}>
                    <div className="text-xs font-semibold text-center leading-tight"
                         style={{ color: '#FFFFFF' }}>{celda.nombre}</div>
                  </button>

                  {isOpen && (
                    <div className="absolute z-50 left-1/2 top-full mt-2 -translate-x-1/2 rounded-lg p-4 text-left"
                         style={{ width: 280, backgroundColor: COLORS.bgCard,
                                  border: `1px solid ${config.color}`,
                                  boxShadow: '0 16px 48px rgba(31,34,37,0.22)' }}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <SeverityBadge sev={celda.sev} />
                        <button onClick={() => setOpenCell(null)}
                                className="text-xs font-semibold hover:opacity-70"
                                style={{ color: COLORS.textMuted }}>Cerrar</button>
                      </div>
                      <div className="text-sm font-bold mb-2"
                           style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>{celda.nombre}</div>
                      <div className="text-[9px] font-bold uppercase tracking-widest mb-1"
                           style={{ color: config.color }}>Por qué este color</div>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: COLORS.inkSoft }}>
                        {celda.explicacion || explicacionPorSeveridad[celda.sev]}
                      </p>
                      {rel && (
                        <>
                          <div className="text-[11px] font-mono font-bold mb-2"
                               style={{ color: COLORS.greenDeep }}>
                            Proceso relacionado: {rel.code} · {rel.nombre}
                          </div>
                          <button onClick={() => { onSelectProceso(rel.id); setOpenCell(null); }}
                                  className="text-xs font-semibold px-3 py-1.5 rounded"
                                  style={{ backgroundColor: COLORS.greenDeep, color: COLORS.bgCard }}>
                            Ver proceso completo →
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>

    <div className="mt-5 pt-4 flex items-center justify-center gap-6 flex-wrap"
         style={{ borderTop: `1px solid ${COLORS.borderSoft}` }}>
      {[
        { sev: 'critical', label: 'Muy Grave (Muerte)' },
        { sev: 'high', label: 'Grave (Importante)' },
        { sev: 'medium', label: 'Medio (Mejoras)' },
        { sev: 'ok', label: 'Sin Observaciones' },
      ].map(item => {
        const config = SEVERITY[item.sev];
        return (
          <div key={item.sev} className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: config.color }} />
            <div className="text-sm" style={{ color: COLORS.inkSoft }}>{item.label}</div>
          </div>
        );
      })}
    </div>
  </Card>
  );
};

// ============================================================
//  TAB · RESUMEN EJECUTIVO
// ============================================================
const TabResumen = ({ data, onSelectProceso }) => {
  return (
    <div className="space-y-6">
      <SectionTitle es="Diagnóstico Ejecutivo del Gobierno Corporativo" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard value={data.kpis.hallazgosTotal} label="Hallazgos Identificados"
                 sublabel="Cobertura integral del negocio"
                 accent={COLORS.greenDeep} />
        <KPICard value={data.kpis.criticosMuerte} label="Críticos (Muerte)"
                 sublabel="Riesgo patrimonial inmediato"
                 accent={COLORS.red} bg={COLORS.redTint} />
        <KPICard value={data.kpis.altos} label="Graves (Importantes)"
                 sublabel="Atención prioritaria · Fase 2"
                 accent={COLORS.amber} bg={COLORS.amberTint} />
        <KPICard value={data.kpis.procesos} label="Procesos Evaluados"
                 sublabel="Diagnóstico integral del negocio"
                 accent={COLORS.blue} />
      </div>

      <MapaValorMatrix data={data} onSelectProceso={onSelectProceso} />

      <Card className="p-6" style={{ borderColor: `${COLORS.death}40`, backgroundColor: COLORS.deathTint }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: COLORS.death }}>
            {data.topCriticos.length} Hallazgos Críticos de Muerte Patrimonial
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.topCriticos.map(r => (
            <div key={r.id} className="p-4 rounded"
                 style={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.deathBorder}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-mono font-bold" style={{ color: COLORS.death }}>{r.id}</div>
                <SeverityBadge sev="critical" />
              </div>
              <div className="text-sm font-bold mb-1" style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
                {r.titulo}
              </div>
              <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: COLORS.textMuted }}>
                {r.area}
              </div>
              <div className="text-xs leading-relaxed" style={{ color: COLORS.inkSoft }}>{r.riesgo}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6" style={{ borderColor: `${COLORS.greenDeep}30`, backgroundColor: COLORS.greenTint }}>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.greenDeep }}>
              Conclusión Ejecutiva
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
              {data.conclusionEjecutiva.titulo}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: COLORS.inkSoft }}>
              {data.conclusionEjecutiva.texto}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================
//  PROCESS VIEW
// ============================================================
const ProcessView = ({ proc }) => {
  const [openPlan, setOpenPlan] = useState(null);
  const conteoSeveridad = computeProcessSeverity(proc);
  const { critical, high, medium, low } = conteoSeveridad;
  const total = proc.hallazgos.length;

  const distribucionData = [
    { name: 'Crítico', value: critical, color: COLORS.death },
    { name: 'Grave', value: high, color: COLORS.red },
    { name: 'Medio', value: medium, color: COLORS.amber },
    { name: 'Bajo', value: low, color: COLORS.ok },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <SectionTitle es={proc.nombre} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard value={total} label="Hallazgos del Proceso"
                 sublabel={`${proc.code} · Diagnóstico Andersen`}
                 accent={COLORS.greenDeep} />
        <KPICard value={critical} label="Críticos (Muerte)"
                 sublabel={critical > 0 ? 'Atención inmediata' : 'Sin riesgo de muerte'}
                 accent={COLORS.death} />
        <KPICard value={high} label="Graves"
                 sublabel="Mitigación en Fase 2"
                 accent={COLORS.red} />
        <KPICard value={medium + low} label="Medios y Bajos"
                 sublabel={`${medium} medios · ${low} bajos`}
                 accent={COLORS.amber} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="p-6 lg:col-span-3"
              style={{ borderColor: `${COLORS.greenDeep}30`, backgroundColor: COLORS.greenTint }}>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="text-[10px] font-mono font-bold tracking-widest mb-2"
                   style={{ color: COLORS.greenDeep }}>
                {proc.code} · SÍNTESIS EJECUTIVA DEL PROCESO
              </div>
              <h3 className="text-lg font-bold mb-3"
                  style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>{proc.nombre}</h3>
              <p className="text-sm leading-relaxed" style={{ color: COLORS.inkSoft }}>{proc.sintesis}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-wider mb-3"
               style={{ color: COLORS.textMuted }}>
            Severidad en este Proceso
          </div>
          {distribucionData.length > 0 ? (
            <div className="space-y-2.5">
              {distribucionData.map(d => (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                      <div className="text-xs font-semibold" style={{ color: COLORS.inkSoft }}>{d.name}</div>
                    </div>
                    <div className="text-sm font-bold" style={{ color: d.color, fontFamily: FONT_SERIF }}>
                      {d.value}
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.bgSoft }}>
                    <div className="h-full rounded-full transition-all duration-700"
                         style={{ width: `${(d.value / total) * 100}%`, backgroundColor: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs italic py-4" style={{ color: COLORS.textMuted }}>
              Sin observaciones registradas en este proceso.
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider"
             style={{ color: COLORS.textMuted }}>
          Hallazgos del Proceso · {total} registro{total !== 1 ? 's' : ''}
        </div>

        {proc.hallazgos.map((h) => {
          const config = SEVERITY[h.sev];
          const planOpen = openPlan === h.id;
          return (
            <Card key={h.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: 60 }}>
                  <div className="px-2.5 py-1.5 rounded font-mono font-bold text-[11px]"
                       style={{ backgroundColor: config.bg, color: config.color, border: `1px solid ${config.color}` }}>
                    {h.id}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <SeverityBadge sev={h.sev} />
                    <PlanButton open={planOpen} onClick={() => setOpenPlan(planOpen ? null : h.id)} />
                  </div>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: COLORS.ink }}>{h.desc}</p>
                  <div className="flex items-start gap-2 pt-2"
                       style={{ borderTop: `1px dashed ${COLORS.borderSoft}` }}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
                         style={{ color: COLORS.greenDeep, minWidth: 90 }}>Tipo de Riesgo</div>
                    <div className="text-xs italic leading-relaxed flex-1"
                         style={{ color: COLORS.inkSoft, fontFamily: FONT_SERIF }}>{h.tipo}</div>
                  </div>

                  {planOpen && (
                    <div className="mt-4">
                      <ActionPlan plan={h.plan} analisis={h.analisis} />
                    </div>
                  )}
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
//  TAB RIESGOS · Matriz consolidada con filtros
// ============================================================
const TabRiesgos = ({ data }) => {
  const [filter, setFilter] = useState('all');
  const [openPlan, setOpenPlan] = useState(null);

  const todosHallazgos = useMemo(() => {
    return data.procesos.flatMap(p => p.hallazgos.map(h => ({
      ...h, procesoId: p.id, procesoNombre: p.nombreCorto, procesoCode: p.code,
    })));
  }, [data]);

  const filtrados = filter === 'all' ? todosHallazgos : todosHallazgos.filter(h => h.sev === filter);

  const filtros = [
    { id: 'all', label: 'Todos', count: todosHallazgos.length, color: COLORS.greenDeep },
    { id: 'critical', label: 'Críticos', count: data.kpis.criticosMuerte, color: COLORS.death },
    { id: 'high', label: 'Graves', count: data.kpis.altos, color: COLORS.red },
    { id: 'medium', label: 'Medios', count: data.kpis.medios, color: COLORS.amber },
    { id: 'low', label: 'Bajos', count: data.kpis.bajos, color: COLORS.ok },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle es="Matriz Consolidada de Riesgos" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard value={data.kpis.hallazgosTotal} label="Total Hallazgos"
                 sublabel={`Cobertura integral · ${data.kpis.procesos} procesos`}
                 accent={COLORS.greenDeep} />
        <KPICard value={`${data.kpis.criticosMuerte + data.kpis.altos}`} label="Críticos + Graves"
                 sublabel="Atención prioritaria"
                 accent={COLORS.red} />
        <KPICard value={`${Math.round(((data.kpis.criticosMuerte + data.kpis.altos) / data.kpis.hallazgosTotal) * 100)}%`}
                 label="Severidad Alta o Crítica"
                 sublabel="Concentración de riesgo institucional"
                 accent={COLORS.death} />
        <KPICard value={data.tiposRiesgo.length} label="Familias de Riesgo"
                 sublabel="Tipos de exposición patrimonial"
                 accent={COLORS.blue} />
      </div>

      <Card className="overflow-hidden">
        <div className="p-5 flex items-center justify-between gap-3 flex-wrap"
             style={{ borderBottom: `1px solid ${COLORS.borderSoft}`, backgroundColor: COLORS.bgElev }}>
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
            Listado Filtrado · {filtrados.length} hallazgo{filtrados.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {filtros.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all duration-150"
                      style={{
                        backgroundColor: filter === f.id ? f.color : COLORS.bgCard,
                        color: filter === f.id ? COLORS.bgCard : COLORS.inkSoft,
                        border: `1px solid ${filter === f.id ? f.color : COLORS.border}`,
                      }}>
                <span>{f.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm"
                      style={{ backgroundColor: filter === f.id ? 'rgba(255,255,255,0.2)' : COLORS.bgSoft }}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y" style={{ borderColor: COLORS.borderSoft }}>
          {filtrados.map((h) => {
            const config = SEVERITY[h.sev];
            const planOpen = openPlan === h.id;
            return (
              <div key={h.id} className="p-4"
                   style={{ borderTop: `1px solid ${COLORS.borderSoft}` }}>
                <div className="flex items-start gap-4">
                  <div className="text-[10px] font-mono font-bold flex-shrink-0 mt-0.5"
                       style={{ color: config.color, minWidth: 30 }}>{h.id}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <SeverityBadge sev={h.sev} />
                      <span className="text-[10px] uppercase tracking-wider font-semibold"
                            style={{ color: COLORS.greenDeep }}>
                        {h.procesoCode} · {h.procesoNombre}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: COLORS.ink }}>{h.desc}</p>
                  </div>
                  <PlanButton open={planOpen} onClick={() => setOpenPlan(planOpen ? null : h.id)} />
                </div>

                {planOpen && (
                  <div className="mt-4" style={{ marginLeft: 46 }}>
                    <ActionPlan plan={h.plan} analisis={h.analisis} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ============================================================
//  PROCESS DROPDOWN · Mega-menú para los procesos
// ============================================================
const ProcessDropdown = ({ data, currentId, onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const escHandler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', escHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', escHandler);
    };
  }, [open]);

  const currentProc = data.procesos.find(p => p.id === currentId);
  const isActive = !!currentProc;

  const procesosOrdenados = useMemo(() => {
    return [...data.procesos].sort((a, b) => {
      const sevWeight = (p) => {
        const c = computeProcessSeverity(p);
        return c.critical * 1000 + c.high * 100 + c.medium * 10 + c.low;
      };
      return sevWeight(b) - sevWeight(a);
    });
  }, [data.procesos]);

  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setOpen(!open)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-all duration-200 rounded"
              style={{
                backgroundColor: isActive ? COLORS.greenDeep : COLORS.bgCard,
                color: isActive ? COLORS.bgCard : COLORS.ink,
                border: `1px solid ${isActive ? COLORS.greenDeep : COLORS.borderStrong}`,
              }}>
        <span className="font-bold tracking-tight" style={{ fontFamily: FONT_SERIF }}>
          {isActive ? currentProc.nombre : 'Procesos Evaluados'}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold"
                style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : COLORS.greenTint,
                  color: isActive ? COLORS.bgCard : COLORS.greenDeep,
                }}>
            {isActive ? currentProc.code : data.procesos.length}
          </span>
          <span style={{ fontSize: 10, lineHeight: 1, transition: 'transform 0.2s',
                         transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
        </div>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 rounded-lg overflow-hidden z-50"
             style={{
               backgroundColor: COLORS.bgCard,
               border: `1px solid ${COLORS.borderStrong}`,
               boxShadow: '0 20px 60px rgba(31,34,37,0.18), 0 0 0 1px rgba(166,25,46,0.08)',
               width: 'min(960px, 92vw)',
               animation: 'dropdownOpen 0.18s ease-out',
             }}>
          <div className="px-5 py-4 flex items-center justify-between"
               style={{ borderBottom: `1px solid ${COLORS.borderSoft}`, backgroundColor: COLORS.bgElev }}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: COLORS.greenDeep }}>
                Procesos Evaluados · Selecciona uno
              </div>
              <div className="text-sm italic mt-0.5"
                   style={{ color: COLORS.textMuted, fontFamily: FONT_SERIF }}>
                Ordenados por gravedad institucional · {data.procesos.length} procesos del diagnóstico
              </div>
            </div>
            <button onClick={() => setOpen(false)}
                    className="px-2 py-1 rounded hover:opacity-70 transition-opacity text-sm font-semibold"
                    style={{ color: COLORS.textMuted }}>
              Cerrar
            </button>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[70vh] overflow-y-auto">
            {procesosOrdenados.map(p => {
              const isCurrent = p.id === currentId;
              const conteo = computeProcessSeverity(p);
              const { critical, high, medium, low } = conteo;
              return (
                <button key={p.id}
                        onClick={() => { onSelect(p.id); setOpen(false); }}
                        className="text-left p-3 rounded-md transition-all duration-150 hover:-translate-y-px"
                        style={{
                          backgroundColor: isCurrent ? COLORS.greenTint : COLORS.bgCard,
                          border: `1px solid ${isCurrent ? COLORS.greenDeep : COLORS.borderSoft}`,
                        }}>
                  <div className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 w-1 self-stretch rounded-full"
                         style={{ backgroundColor: isCurrent ? COLORS.greenDeep : COLORS.borderStrong }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-mono font-bold tracking-wider"
                              style={{ color: COLORS.greenDeep }}>{p.code}</span>
                        {critical > 0 && (
                          <span className="text-[9px] px-1 py-0.5 rounded font-bold"
                                style={{ backgroundColor: COLORS.deathTint, color: COLORS.death }}>
                            {critical} crít
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold leading-tight mb-1.5"
                           style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>{p.nombre}</div>
                      <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden mb-1"
                           style={{ backgroundColor: COLORS.bgSoft }}>
                        {critical > 0 && <div style={{ width: `${(critical / p.hallazgos.length) * 100}%`, backgroundColor: COLORS.death }} />}
                        {high > 0 && <div style={{ width: `${(high / p.hallazgos.length) * 100}%`, backgroundColor: COLORS.red }} />}
                        {medium > 0 && <div style={{ width: `${(medium / p.hallazgos.length) * 100}%`, backgroundColor: COLORS.amber }} />}
                        {low > 0 && <div style={{ width: `${(low / p.hallazgos.length) * 100}%`, backgroundColor: COLORS.ok }} />}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-[10px]" style={{ color: COLORS.textMuted }}>
                          {p.hallazgos.length} hallazgo{p.hallazgos.length !== 1 ? 's' : ''}
                        </div>
                        {isCurrent && (
                          <div className="text-[9px] font-bold uppercase tracking-wider"
                               style={{ color: COLORS.greenDeep }}>● Activo</div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-5 py-3 flex items-center justify-center gap-4 flex-wrap"
               style={{ borderTop: `1px solid ${COLORS.borderSoft}`, backgroundColor: COLORS.bgElev }}>
            <div className="text-[10px] uppercase tracking-wider font-semibold"
                 style={{ color: COLORS.textMuted }}>Leyenda:</div>
            {[
              { color: COLORS.death, label: 'Crítico' },
              { color: COLORS.red, label: 'Grave' },
              { color: COLORS.amber, label: 'Medio' },
              { color: COLORS.ok, label: 'Bajo' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                <div className="text-[10px]" style={{ color: COLORS.inkSoft }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PrimaryTabButton = ({ active, onClick, label, count }) => (
  <button onClick={onClick}
          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-all duration-200 rounded"
          style={{
            backgroundColor: active ? COLORS.greenDeep : COLORS.bgCard,
            color: active ? COLORS.bgCard : COLORS.ink,
            border: `1px solid ${active ? COLORS.greenDeep : COLORS.borderStrong}`,
          }}>
    <span className="font-bold tracking-tight" style={{ fontFamily: FONT_SERIF }}>{label}</span>
    {count != null && (
      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold"
            style={{
              backgroundColor: active ? 'rgba(255,255,255,0.2)' : COLORS.greenTint,
              color: active ? COLORS.bgCard : COLORS.greenDeep,
            }}>
        {count}
      </span>
    )}
  </button>
);

// ============================================================
//  DASHBOARD · Componente raíz exportado
//  PROP: data (objeto con todo el schema del cliente)
// ============================================================
export default function Dashboard({ data }) {
  const [tab, setTab] = useState('resumen');

  // Reset tab cuando cambia el cliente
  useEffect(() => { setTab('resumen'); }, [data.meta.cliente]);

  const TABS_PRIMARY = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'riesgos', label: 'Matriz de Riesgos', count: data.kpis.hallazgosTotal },
  ];

  const renderContent = () => {
    if (tab === 'resumen') return <TabResumen data={data} onSelectProceso={setTab} />;
    if (tab === 'riesgos') return <TabRiesgos data={data} />;
    const proc = data.procesos.find(p => p.id === tab);
    if (proc) return <ProcessView proc={proc} />;
    return null;
  };

  return (
    <div className="min-h-screen w-full"
         style={{ backgroundColor: COLORS.bg, color: COLORS.ink, fontFamily: FONT_SANS }}>
      <style>{`
        @keyframes dropdownOpen {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header Andersen */}
      <header className="px-8 pt-10 pb-6 relative"
              style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bgCard }}>
        <div className="flex items-center gap-4" style={{ position: 'absolute', top: 14, left: 32 }}>
          <img src="/andersen_popup_logo.png" alt="Andersen Consulting"
               style={{ height: 42, width: 'auto' }} />
          <div style={{ height: 34, width: 1, backgroundColor: COLORS.border }} />
          <img src="/rc_corporativo_logo.png" alt="RC Corporativo"
               style={{ height: 40, width: 'auto' }} />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-6">
          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="text-[10px] font-mono px-2.5 py-1 rounded-sm font-bold tracking-wider"
                   style={{ backgroundColor: COLORS.ink, color: COLORS.bgCard }}>
                CLIENTE · {data.meta.cliente}
              </div>
              <div className="text-[10px] font-mono tracking-wider" style={{ color: COLORS.textMuted }}>
                EVALUACIÓN · {data.meta.evaluacion}
              </div>
              <div className="text-[10px] font-mono tracking-wider" style={{ color: COLORS.textMuted }}>
                MARCO · {data.meta.framework}
              </div>
              <div className="text-[10px] font-mono tracking-wider" style={{ color: COLORS.textMuted }}>
                SECTOR · {data.meta.sector}
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight leading-none"
                style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
              {data.meta.tituloDashboard}
              <span style={{ color: COLORS.green }}> {data.meta.tituloAcento}</span>
            </h1>
            <p className="text-base italic mt-2" style={{ color: COLORS.textMuted, fontFamily: FONT_SERIF }}>
              {data.meta.subtitulo}
            </p>
          </div>
        </div>
      </header>

      {/* Nav: botones primarios + dropdown */}
      <nav className="px-4 lg:px-8 py-3"
           style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bgElev }}>
        <div className="flex items-center gap-2 flex-wrap">
          {TABS_PRIMARY.map((t, i) => (
            <React.Fragment key={t.id}>
              <PrimaryTabButton active={tab === t.id} onClick={() => setTab(t.id)}
                                label={t.label} count={t.count} />
              {i === 0 && <div className="h-6 w-px mx-1" style={{ backgroundColor: COLORS.border }} />}
            </React.Fragment>
          ))}
          <ProcessDropdown data={data} currentId={tab} onSelect={setTab} />
        </div>
      </nav>

      <main className="px-4 lg:px-8 py-8">{renderContent()}</main>

      <footer className="px-8 py-6"
              style={{ borderTop: `2px solid ${COLORS.green}`, backgroundColor: COLORS.bgCard }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-sm font-bold tracking-tight"
                 style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
              A N D E R S E N
              <span style={{ color: COLORS.green }}>  C O N S U L T I N G</span>
            </div>
            <div className="h-4 w-px" style={{ backgroundColor: COLORS.border }} />
            <div className="text-xs italic" style={{ color: COLORS.textMuted, fontFamily: FONT_SERIF }}>
              {data.meta.tituloDashboard} {data.meta.tituloAcento} · {data.meta.cliente} {data.meta.evaluacion}
            </div>
          </div>
          <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: COLORS.inkSoft }}>
            Desarrollado por AXON B2B
          </div>
        </div>
      </footer>
    </div>
  );
}
