import { HumanMessage } from "@langchain/core/messages";
import { createAiModel } from "./aiModelFactory.js";
import { exportReport } from "./exportService.js";

// --- Lógica de Prompts ---
const getSummaryPrompt = (commitData) => `
  Eres un Tech Lead encargado de generar un reporte de trabajo semanal a partir de logs de commits. Tu objetivo es analizar la información proporcionada y crear un resumen claro, bien estructurado y profesional.
  Basado en los siguientes commits, genera un reporte de trabajo que incluya:
  1. Un título y una breve introducción sobre el objetivo del trabajo realizado.
  2. Una sección de "Análisis de Contribuciones por Desarrollador".
  3. Para cada desarrollador, agrupa sus commits y describe el trabajo realizado.
  4. Añade una sección de "Observaciones" para cada desarrollador si encuentras patrones interesantes.
  5. Finalmente, crea una sección de "Estimación de Tiempo de Desarrollo" con las horas aproximadas dedicadas por cada desarrollador.
  Utiliza un tono profesional y asegúrate de que el reporte sea fácil de leer y entender. No seas condescendiente con los desarrolladores, se totalmente imparcial y objetivo.
  Aquí están los datos de los commits (formato: Fecha | Autor | Mensaje):
  ---
  ${commitData}
  ---
  Responde SOLAMENTE con el reporte, no incluyas explicaciones adicionales.
`;
const getPersonalPrompt = (commitData) => `
  Eres un asistente de IA que ayuda a desarrolladores a crear reportes de trabajo concisos a partir de logs de Git.
  Tu objetivo es generar un resumen claro y práctico, ideal para reportes rápidos o "daily stand-ups".

  A partir de los siguientes commits, crea un reporte con el siguiente formato:

  ### Reporte de Actividad

  **Por [Nombre del Autor]:**
  - **[Tarea Realizada 1]:** Breve descripción de la tarea basada en los mensajes de commit. (Estimación: X horas)
  - **[Tarea Realizada 2]:** Breve descripción de la tarea. (Estimación: Y horas)

  **Por [Nombre de otro Autor]:**
  - **[Tarea Realizada 1]:** Breve descripción. (Estimación: Z horas)

  Agrupa los commits por autor y resume sus contribuciones en tareas claras.
  Sé directo y práctico. No incluyas introducciones, conclusiones ni texto adicional.
  Las estimaciones hazlas segun tu criterio en la complejidad de la tarea 

  Datos de los commits:
  ---
  ${commitData}
  ---
`;
const getChunkAnalysisPrompt = (chunk) => `
  Eres un experto en análisis de código y estás revisando un conjunto de commits. Tu tarea es analizar el siguiente bloque de commits, incluyendo sus mensajes y los cambios de código (diffs), para entender qué se hizo realmente.
  Extrae la siguiente información:
  - **Resumen Técnico:** Describe en detalle los cambios técnicos realizados. Menciona archivos modificados, funciones agregadas o eliminadas, y la lógica principal implementada.
  - **Funcionalidad Afectada:** Identifica qué partes de la aplicación o qué funcionalidades se vieron afectadas por estos cambios.
  - **Posibles Mejoras o Riesgos:** Si observas alguna área que podría mejorarse, o algún riesgo potencial introducido por el código, anótalo.
  - **Participantes Clave:** Menciona a los desarrolladores que realizaron los cambios más significativos.

  Aquí está el chunk de commits y diffs:
  ---
  ${chunk}
  ---
  Proporciona un análisis conciso y técnico. No incluyas información superflua.
`;
const getFinalReportPrompt = (analyses) => `
  Eres un Arquitecto de Software y has recibido análisis de varios bloques de commits. Tu misión es consolidar estos análisis en un único reporte de "Análisis Profundo" que ofrezca una visión completa y coherente del trabajo realizado.
  Utiliza los siguientes análisis de chunks para generar el reporte final:
  ---
  ${analyses.join("\n\n---\n\n")}
  ---
  El reporte final debe tener la siguiente estructura:
  1.  **Título:** "Reporte de Análisis Profundo de Commits"
  2.  **Resumen Ejecutivo:** Una breve descripción de alto nivel de los cambios más significativos y el impacto general en el proyecto.
  3.  **Análisis Detallado por Módulo/Funcionalidad:** Agrupa los cambios por las áreas del sistema que fueron afectadas (ej. "Módulo de Autenticación", "Refactorización del Servicio de Pagos"). Para cada área, describe los cambios técnicos y funcionales.
  4.  **Observaciones y Recomendaciones:** Basado en el análisis completo, proporciona observaciones sobre la calidad del código, patrones recurrentes y recomendaciones para futuras mejoras o áreas que requieren atención.
  5.  **Sección de Participantes:** Un resumen con estimación horaria de los desarrolladores involucrados en los cambios.

  Sé claro, estructurado y proporciona una visión que sea útil tanto para desarrolladores como para la gestión técnica.
`;

// --- Funciones Principales ---
async function generateWithAI(model, prompt) {
  try {
    const result = await model.invoke([new HumanMessage({ content: prompt })]);
    return result.content;
  } catch (error) {
    console.error("Error al generar contenido con la IA:", error);
    return null;
  }
}

export async function generateReportWithAI({
  commitData,
  provider,
  modelName,
  reportType = "summary",
  OllamaClass, // Para inyección en pruebas
  GeminiClass, // Para inyección en pruebas
}) {
  const model = createAiModel(provider, modelName, OllamaClass, GeminiClass);
  const formattedCommits = commitData
    .map((c) => `${c.date} | ${c.author} | ${c.message}`)
    .join("\n");
  const prompt =
    reportType === "personal"
      ? getPersonalPrompt(formattedCommits)
      : getSummaryPrompt(formattedCommits);
  return generateWithAI(model, prompt);
}

export async function generateDeepDiveReport({
  chunks,
  provider,
  modelName,
  OllamaClass, // Para inyección en pruebas
  GeminiClass, // Para inyección en pruebas
  outPath,
}) {
  const model = createAiModel(provider, modelName, OllamaClass, GeminiClass);
  console.log(
    `Analizando ${chunks.length} chunks de commits con ${provider}/${modelName}...`
  );
  const analyses = [];
  let index = 1;
  for (const chunk of chunks) {
    const chunkContent = chunk
      .map(
        (c) =>
          `Commit: ${c.hash}\nAuthor: ${c.author}\nDate: ${c.date}\nMessage: ${c.message}\n\nDiff:\n${c.diff}\n---`
      )
      .join("\n");
    const analysisPrompt = getChunkAnalysisPrompt(chunkContent);
    console.log(`Chunk ${index++}/${chunks.length}`);

    const analysis = await generateWithAI(model, analysisPrompt);
    if (analysis) {
      if (outPath) await exportReport(analysis, outPath, `chunk-${index - 1}`);
      analyses.push(analysis);
    }
  }

  if (analyses.length === 0) {
    console.error("No se pudo generar ningún análisis de los chunks.");
    return null;
  }

  console.log("Generando el reporte final consolidado...");
  const finalReportPrompt = getFinalReportPrompt(analyses);
  return generateWithAI(model, finalReportPrompt);
}
