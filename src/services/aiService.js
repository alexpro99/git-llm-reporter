import { GoogleGenerativeAI } from "@google/generative-ai";

const getSummaryPrompt = (commitData) => `
  Eres un Tech Lead encargado de generar un reporte de trabajo semanal a partir de logs de commits. Tu objetivo es analizar la información proporcionada y crear un resumen claro, bien estructurado y profesional.

  Basado en los siguientes commits, genera un reporte de trabajo que incluya:
  1. Un título y una breve introducción sobre el objetivo del trabajo realizado.
  2. Una sección de "Análisis de Contribuciones por Desarrollador".
  3. Para cada desarrollador, agrupa sus commits y describe el trabajo realizado.
  4. Añade una sección de "Observaciones" para cada desarrollador si encuentras patrones interesantes.
  5. Finalmente, crea una sección de "Estimación de Tiempo de Desarrollo" con las horas aproximadas dedicadas por cada desarrollador.

  Utiliza un tono profesional y asegúrate de que el reporte sea fácil de leer y entender.
  No seas condescendiente con los desarrolladores, se totalmente imparcial y objetivo.

  Aquí están los datos de los commits (formato: Fecha | Autor | Mensaje):
  ---
  ${commitData}
  ---

  Responde SOLAMENTE con el reporte, no incluyas explicaciones adicionales.
`;

const getPersonalPrompt = (commitData) => `
  Eres un asistente de desarrollo encargado de generar un reporte de trabajo personal a partir de logs de commits. Tu objetivo es ayudar a los desarrolladores a documentar su trabajo de una manera clara y concisa.

  Basado en los siguientes commits, genera un reporte de trabajo que incluya:
  1. Un título que resuma el período de trabajo.
  2. Una lista de las tareas más importantes en las que has trabajado.
  3. Un resumen de los commits realizados, agrupados por día.
  4. Una sección de "Reflexiones" donde puedas añadir tus pensamientos sobre el trabajo realizado, los desafíos encontrados y los próximos pasos.

  Utiliza un tono personal y reflexivo. El reporte debe ser útil para que el desarrollador pueda recordar su trabajo y compartirlo con su equipo.

  Aquí están los datos de los commits (formato: Fecha | Autor | Mensaje):
  ---
  ${commitData}
  ---

  Responde SOLAMENTE con el reporte, no incluyas explicaciones adicionales.
`;

export async function generateReportWithAI(commitData, modelName = "gemini-1.5-pro", reportType = "summary") {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = reportType === 'personal'
    ? getPersonalPrompt(commitData)
    : getSummaryPrompt(commitData);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error al generar el reporte con la IA:", error);
    return null;
  }
}
