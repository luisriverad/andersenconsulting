import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractText(file) {
  const name = (file?.name || '').toLowerCase();
  if (name.endsWith('.pdf')) return extractFromPdf(file);
  if (name.endsWith('.pptx')) return extractFromPptx(file);
  if (name.endsWith('.ppt')) {
    throw new Error('Formato .ppt (legacy) no soportado. Conviértelo a .pptx o .pdf.');
  }
  throw new Error(`Tipo de archivo no soportado: ${file?.name}`);
}

async function extractFromPdf(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(it => ('str' in it ? it.str : '')).join(' ');
    pages.push({ page: i, text });
  }
  return {
    type: 'pdf',
    fileName: file.name,
    pageCount: pdf.numPages,
    pages,
    fullText: pages.map(p => p.text).join('\n\n'),
  };
}

async function extractFromPptx(file) {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files)
    .filter(p => /^ppt\/slides\/slide\d+\.xml$/i.test(p))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)/i)[1], 10);
      const nb = parseInt(b.match(/slide(\d+)/i)[1], 10);
      return na - nb;
    });

  const pages = [];
  for (let i = 0; i < slideFiles.length; i++) {
    const xml = await zip.files[slideFiles[i]].async('string');
    const text = extractTextFromSlideXml(xml);
    pages.push({ page: i + 1, text });
  }
  return {
    type: 'pptx',
    fileName: file.name,
    pageCount: pages.length,
    pages,
    fullText: pages.map(p => p.text).join('\n\n'),
  };
}

function extractTextFromSlideXml(xml) {
  const runs = xml.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g) || [];
  return runs
    .map(r => r.replace(/<a:t[^>]*>/, '').replace(/<\/a:t>/, ''))
    .map(decodeXmlEntities)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeXmlEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

// ============================================================
// Heuristic extractor: maps free text to dashboard KPIs
// Returns { matched: {...}, notes: [...] } — only fills what it finds
// ============================================================
export function extractDashboardData(textResult) {
  const text = textResult.fullText.replace(/\s+/g, ' ');
  const result = { matched: {}, notes: [] };

  // Score SCI Global · busca patrones tipo "Score SCI Global: 2.12" o "Score Global 2.12 / 5"
  const scoreGlobal = findNumber(text, [
    /score\s+sci\s+global[^0-9]{0,20}(\d+(?:[.,]\d+)?)/i,
    /score\s+global[^0-9]{0,20}(\d+(?:[.,]\d+)?)/i,
    /sci\s+global[^0-9]{0,20}(\d+(?:[.,]\d+)?)\s*\/\s*5/i,
  ]);
  if (scoreGlobal != null) result.matched.scoreGlobal = scoreGlobal;

  // Reactivos totales
  const reactivosTotal = findInt(text, [
    /(\d+)\s+reactivos\s+(?:en\s+)?total/i,
    /total\s+(?:de\s+)?reactivos[^0-9]{0,15}(\d+)/i,
    /reactivos\s+totales?[^0-9]{0,15}(\d+)/i,
  ]);
  if (reactivosTotal != null) result.matched.reactivosTotal = reactivosTotal;

  // Riesgos identificados
  const riesgos = findInt(text, [
    /(\d+)\s+riesgos\s+identificados/i,
    /riesgos\s+identificados[^0-9]{0,15}(\d+)/i,
    /total\s+(?:de\s+)?riesgos[^0-9]{0,15}(\d+)/i,
  ]);
  if (riesgos != null) result.matched.riesgosIdentificados = riesgos;

  // Entrevistados
  const entrevistados = findInt(text, [
    /(\d+)\s+entrevistados/i,
    /entrevistados[^0-9]{0,15}(\d+)/i,
    /(\d+)\s+colaboradores\s+entrevistados/i,
  ]);
  if (entrevistados != null) result.matched.entrevistados = entrevistados;

  // Macroprocesos
  const macroprocesos = findInt(text, [
    /(\d+)\s+macroprocesos/i,
    /macroprocesos[^0-9]{0,15}(\d+)/i,
  ]);
  if (macroprocesos != null) result.matched.macroprocesos = macroprocesos;

  // Reactivos por dimensión
  const reactivosEstrategicos = findInt(text, [
    /(\d+)\s+reactivos\s+(?:de|del)?\s*estrat[eé]gicos?/i,
    /control\s+estrat[eé]gico[^0-9]{0,30}(\d+)\s+reactivos/i,
  ]);
  if (reactivosEstrategicos != null) result.matched.reactivosEstrategicos = reactivosEstrategicos;

  const reactivosDirectivos = findInt(text, [
    /(\d+)\s+reactivos\s+(?:de|del)?\s*directivos?/i,
    /control\s+directivo[^0-9]{0,30}(\d+)\s+reactivos/i,
  ]);
  if (reactivosDirectivos != null) result.matched.reactivosDirectivos = reactivosDirectivos;

  const reactivosOperativos = findInt(text, [
    /(\d+)\s+reactivos\s+(?:de|del)?\s*operativos?/i,
    /control\s+operativo[^0-9]{0,30}(\d+)\s+reactivos/i,
  ]);
  if (reactivosOperativos != null) result.matched.reactivosOperativos = reactivosOperativos;

  // Scores por dimensión
  const scoreEstrategico = findNumber(text, [
    /control\s+estrat[eé]gico[^0-9]{0,40}(\d+(?:[.,]\d+)?)\s*(?:\/\s*5)?/i,
  ]);
  if (scoreEstrategico != null && scoreEstrategico <= 5) {
    result.matched.scoreEstrategico = scoreEstrategico;
  }

  const scoreDirectivo = findNumber(text, [
    /control\s+directivo[^0-9]{0,40}(\d+(?:[.,]\d+)?)\s*(?:\/\s*5)?/i,
  ]);
  if (scoreDirectivo != null && scoreDirectivo <= 5) {
    result.matched.scoreDirectivo = scoreDirectivo;
  }

  const scoreOperativo = findNumber(text, [
    /control\s+operativo[^0-9]{0,40}(\d+(?:[.,]\d+)?)\s*(?:\/\s*5)?/i,
  ]);
  if (scoreOperativo != null && scoreOperativo <= 5) {
    result.matched.scoreOperativo = scoreOperativo;
  }

  if (Object.keys(result.matched).length === 0) {
    result.notes.push(
      'No se detectaron patrones conocidos. Revisa el texto extraído y avísame qué campos extraer.'
    );
  }

  return result;
}

function findNumber(text, patterns) {
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const n = parseFloat(m[1].replace(',', '.'));
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

function findInt(text, patterns) {
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}
