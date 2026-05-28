import React, { useState, useRef } from 'react';
import { COLORS, FONT_SERIF } from './theme';
import { validateClientData } from './validator';

/**
 * ClientLoader · Componente flotante para cargar nuevos clientes vía drag & drop
 * Soporta:
 * - Drag & drop de archivo JSON
 * - Click para seleccionar archivo
 * - Validación del schema
 * - Descarga del JSON actual como template
 * - Reset al cliente por defecto
 */
export default function ClientLoader({ currentData, onDataLoad, defaultData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error'|'warning', message, details? }
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      setStatus({ type: 'error', message: 'El archivo debe ser .json' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const validation = validateClientData(data);

        if (!validation.valid) {
          setStatus({
            type: 'error',
            message: `Esquema inválido (${validation.errors.length} errores)`,
            details: validation.errors,
          });
          return;
        }

        // Guardar en localStorage
        try {
          localStorage.setItem('dashboard_client_data', JSON.stringify(data));
        } catch (err) {
          console.warn('No se pudo persistir en localStorage', err);
        }

        onDataLoad(data);
        setStatus({
          type: 'success',
          message: `Cliente "${data.meta.cliente}" cargado correctamente`,
          details: validation.warnings.length > 0 ? validation.warnings : null,
        });

        setTimeout(() => {
          setIsOpen(false);
          setStatus(null);
        }, 2000);
      } catch (err) {
        setStatus({ type: 'error', message: 'JSON malformado: ' + err.message });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDownloadCurrent = () => {
    const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentData.meta.cliente.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    try {
      localStorage.removeItem('dashboard_client_data');
    } catch (err) { /* noop */ }
    onDataLoad(defaultData);
    setStatus({ type: 'success', message: 'Restaurado al cliente por defecto' });
    setTimeout(() => { setIsOpen(false); setStatus(null); }, 1500);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button onClick={() => setIsOpen(true)}
              className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105"
              style={{
                backgroundColor: COLORS.ink,
                color: COLORS.bgCard,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}>
        <span className="text-xs font-bold tracking-wider uppercase">Cargar Cliente</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(26,26,26,0.6)' }}
             onClick={() => setIsOpen(false)}>
          <div className="rounded-lg overflow-hidden max-w-2xl w-full"
               style={{ backgroundColor: COLORS.bgCard, boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}
               onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between"
                 style={{ borderBottom: `1px solid ${COLORS.borderSoft}`, backgroundColor: COLORS.bgElev }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
                  Gestión de Datos del Cliente
                </h2>
                <p className="text-xs italic mt-0.5" style={{ color: COLORS.textMuted, fontFamily: FONT_SERIF }}>
                  Arquitectura basada en datos · Cliente actual: <strong>{currentData.meta.cliente}</strong>
                </p>
              </div>
              <button onClick={() => setIsOpen(false)}
                      className="px-2 py-1 rounded hover:opacity-70 text-sm font-semibold"
                      style={{ color: COLORS.textMuted }}>
                Cerrar
              </button>
            </div>

            {/* Drop zone */}
            <div className="p-6">
              <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                   onDragLeave={() => setIsDragging(false)}
                   onDrop={handleDrop}
                   onClick={() => inputRef.current?.click()}
                   className="rounded-lg p-8 text-center transition-all cursor-pointer"
                   style={{
                     border: `2px dashed ${isDragging ? COLORS.greenDeep : COLORS.borderStrong}`,
                     backgroundColor: isDragging ? COLORS.greenTint : COLORS.bgElev,
                   }}>
                <div className="text-base font-bold"
                     style={{ color: COLORS.ink, fontFamily: FONT_SERIF }}>
                  {isDragging ? 'Suelta el archivo aquí' : 'Arrastra un JSON o haz click'}
                </div>
                <div className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
                  Solo archivos <code style={{ fontFamily: 'monospace' }}>.json</code> con el esquema validado
                </div>
                <input ref={inputRef} type="file" accept=".json,application/json"
                       style={{ display: 'none' }}
                       onChange={(e) => handleFile(e.target.files[0])} />
              </div>

              {/* Status */}
              {status && (
                <div className="mt-4 p-4 rounded flex items-start gap-3"
                     style={{
                       backgroundColor:
                         status.type === 'success' ? COLORS.okTint :
                         status.type === 'error' ? COLORS.redTint : COLORS.amberTint,
                       border: `1px solid ${
                         status.type === 'success' ? COLORS.okBorder :
                         status.type === 'error' ? COLORS.redBorder : COLORS.amberBorder
                       }`,
                     }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold"
                         style={{ color: status.type === 'success' ? COLORS.ok :
                                          status.type === 'error' ? COLORS.red : COLORS.amber }}>
                      {status.message}
                    </div>
                    {status.details && Array.isArray(status.details) && (
                      <ul className="mt-2 space-y-1 text-xs" style={{ color: COLORS.inkSoft }}>
                        {status.details.slice(0, 5).map((d, i) => (
                          <li key={i} className="font-mono">· {d}</li>
                        ))}
                        {status.details.length > 5 && (
                          <li className="italic" style={{ color: COLORS.textMuted }}>
                            …y {status.details.length - 5} más
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={handleDownloadCurrent}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-semibold transition-all hover:opacity-80"
                        style={{
                          backgroundColor: COLORS.bgCard,
                          color: COLORS.ink,
                          border: `1px solid ${COLORS.borderStrong}`,
                        }}>
                  Descargar JSON actual
                </button>
                <button onClick={handleReset}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-semibold transition-all hover:opacity-80"
                        style={{
                          backgroundColor: COLORS.bgCard,
                          color: COLORS.ink,
                          border: `1px solid ${COLORS.borderStrong}`,
                        }}>
                  Restaurar por defecto
                </button>
              </div>

              {/* Help text */}
              <div className="mt-5 p-3 rounded text-xs leading-relaxed"
                   style={{ backgroundColor: COLORS.bgElev, color: COLORS.inkSoft }}>
                <strong style={{ color: COLORS.greenDeep }}>Consejo:</strong> Descarga el JSON actual,
                edítalo con los datos del nuevo cliente (mismo esquema), y arrástralo aquí. Los datos
                se persisten en localStorage del navegador.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
