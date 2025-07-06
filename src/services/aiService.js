import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateReportWithAI(commitData, modelName = "gemini-2.5-pro") {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error al generar el reporte con la IA:", error);
    return null;
  }
}
