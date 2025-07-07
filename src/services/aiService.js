import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";

// --- Fábrica de Modelos ---
function createAiModel(provider, modelName) {
  if (process.env.E2E_TEST_MOCK_AI === "true") {
    // En pruebas E2E, devolvemos un objeto simulado que imita la interfaz de LangChain.
    return {
      invoke: async (messages) => {
        const content = messages[0].content;
        if (content.includes("Eres un Tech Lead")) {
          return { content: "Mocked Summary Report" };
        }
        if (content.includes("Eres un desarrollador")) {
          return { content: "Mocked Personal Report" };
        }
        return { content: "Mocked AI Response" };
      },
    };
  }

  switch (provider) {
    case "ollama":
      return new ChatOllama({
        baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
        model: modelName,
      });
    case "gemini":
    default:
      return new ChatGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
        model: modelName,
      });
  }
}

// --- Lógica de Prompts (sin cambios) ---
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
  ${commitData}
  ---

  Responde SOLAMENTE con el reporte, no incluyas explicaciones adicionales.
`;
const getPersonalPrompt = (commitData) => `
  Eres un desarrollador que debe entregar un reporte técnico y conciso a su jefe sobre el trabajo realizado, basado en los logs de commits.

  Genera un reporte que incluya:
  1. Un título breve y descriptivo del trabajo realizado.
  2. Una lista clara y ordenada de las tareas principales completadas, agrupadas por funcionalidad o módulo.
  3. Para cada tarea, incluye una breve descripción técnica de los cambios realizados y su impacto.
  4. Una estimación de horas dedicadas a cada tarea.
  5. Una sección final de "Próximos pasos" o tareas pendientes relevantes.

  El reporte debe ser directo, profesional y útil para la supervisión técnica. Evita explicaciones innecesarias y enfócate en los resultados y el tiempo invertido.

  Aquí están los datos de los commits (formato: Fecha | Autor | Mensaje):
  ${commitData}
  ---

  Responde SOLAMENTE con el reporte, no incluyas explicaciones adicionales.
`;
const getChunkAnalysisPrompt = (chunk) => `
  Eres un experto en análisis de código y estás revisando un conjunto de commits. Tu tarea es analizar el siguiente bloque de commits, incluyendo sus mensajes y los cambios de código (diffs), para entender qué se hizo realmente.
  Extrae la siguiente información:
  - **Resumen Técnico:** Describe en detalle los cambios técnicos realizados. Menciona archivos modificados, funciones agregadas o eliminadas, y la lógica principal implementada.
  - **Funcionalidad Afectada:** Identifica qué partes de la aplicación o qué funcionalidades se vieron afectadas por estos cambios.
  - **Posibles Mejoras o Riesgos:** Si observas alguna área que podría mejorarse, o algún riesgo potencial introducido por el código, anótalo.
  - **Participantes Clave:** Menciona a los desarrolladores que realizaron los cambios más significativos.

  Aquí está el chunk de commits y diffs:
  ${chunk}
  ---

  Responde SOLAMENTE con el reporte, no incluyas explicaciones adicionales.
`;
const getFinalReportPrompt = (analyses) => `
  Eres un Arquitecto de Software y has recibido análisis de varios bloques de commits. Tu misión es consolidar estos análisis en un único reporte de "Análisis Profundo" que ofrezca una visión completa y coherente del trabajo realizado.
  Utiliza los siguientes análisis de chunks para generar el reporte final:
  ${analyses.join("\n\n---\n\n")}
  ---
  El reporte final debe tener la siguiente estructura:
  1.  **Título:** "Reporte de Análisis Profundo de Commits"
  2.  **Resumen Ejecutivo:** Una breve descripción de alto nivel de los cambios más significativos y el impacto general en el proyecto.
  3.  **Análisis Detallado por Módulo/Funcionalidad:** Agrupa los cambios por las áreas del sistema que fueron afectadas (ej. "Módulo de Autenticación", "Refactorización del Servicio de Pagos"). Para cada área, describe los cambios técnicos y funcionales.
  4.  **Observaciones y Recomendaciones:** Basado en el análisis completo, proporciona observaciones sobre la calidad del código, patrones recurrentes y recomendaciones para futuras mejoras o áreas que requieren atención.
  5.  **Sección de Participantes:** Un resumen con estimación horaria de los desarrolladores involucrados en los cambios.

  Sé claro, estructurado y proporciona una visión que sea útil tanto para desarrolladores como para la gestión técnica.
  Responde SOLAMENTE con el reporte, no incluyas explicaciones adicionales.
`;

// --- Funciones Principales Refactorizadas ---
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
}) {
  const model = createAiModel(provider, modelName);

  const formattedCommits = commitData
    .map((c) => `${c.date} | ${c.author} | ${c.message}`)
    .join("\n");

  const prompt =
    reportType === "personal"
      ? getPersonalPrompt(formattedCommits)
      : getSummaryPrompt(formattedCommits);

  return generateWithAI(model, prompt);
}

export async function generateDeepDiveReport({ chunks, provider, modelName }) {
  const model = createAiModel(provider, modelName);
  console.log(
    `Analizando ${chunks.length} chunks de commits con ${provider}...`
  );
  const analyses = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Analizando chunk ${i + 1}/${chunks.length}...`);
    const chunkContent = chunks[i]
      .map(
        (c) =>
          `Commit: ${c.hash}\nAuthor: ${c.author}\nDate: ${c.date}\nMessage: ${c.message}\n\nDiff:\n${c.diff}\n---`
      )
      .join("\n");

    const analysisPrompt = getChunkAnalysisPrompt(chunkContent);
    const analysis = await generateWithAI(model, analysisPrompt);
    if (analysis) {
      console.log(`--- Inicio chunk ${i + 1} --- \n`);
      console.log(analysis);
      console.log(`--- Fin chunk ${i + 1} --- \n`);
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
