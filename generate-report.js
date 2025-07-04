#!/usr/bin/env node

import simpleGit from "simple-git";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config(); // Carga las variables de .env

async function getCommitLogs(range) {
  const git = simpleGit();
  if (!range) {
    console.error(
      "Error: Debes proporcionar un rango de commits. Ejemplo: 'main..develop'"
    );
    process.exit(1); // Termina el script si no hay rango
  }

  try {
    // Usamos un formato simple que la IA pueda entender fácilmente
    const log = await git.log({
      from: range.split("..")[0],
      to: range.split("..")[1],
      "--pretty": "format:%ad || %an || %s",
      "--date": "iso",
    });

    // simple-git con --pretty puede devolver un string o null
    if (!log.all || log.all.length === 0) {
      console.log("No se encontraron commits en el rango especificado.");
      return null;
    }

    // Para este formato, `all` puede ser una sola cadena, la separamos.
    const formattedCommits = log.all
      .map((c) => `${c.date} | ${c.author_name} | ${c.message}`)
      .join("\n");
    return formattedCommits;
  } catch (error) {
    console.error("Error al obtener los logs de Git:", error);
    return null;
  }
}

async function generateReportWithAI(commitData, modelName = "gemini-2.5-pro") {
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

async function main() {
  // Tomamos los argumentos de la línea de comandos
  const args = process.argv.slice(2);
  const commitRange = args.find(arg => !arg.startsWith('-'));
  const verbose = args.includes('-v') || args.includes('--verbose');
  
  // Extraer el modelo especificado
  const modelIndex = args.findIndex(arg => arg === '-m' || arg === '--model');
  const modelName = modelIndex !== -1 && args[modelIndex + 1] ? args[modelIndex + 1] : "gemini-2.5-pro";

  if (!commitRange) {
    console.error("Debes proporcionar un rango de commits. Ejemplo: 'main..develop'");
    process.exit(1);
  }

  console.log(`Obteniendo logs para el rango: ${commitRange}...`);
  const commits = await getCommitLogs(commitRange);

  if (verbose) {
    console.log(`Commits obtenidos: ${commits} \n`);
  }

  if (commits) {
    console.log(`Logs obtenidos. Enviando a ${modelName} para generar el reporte...`);
    const report = await generateReportWithAI(commits, modelName);

    if (report) {
      console.log("\n--- INICIO DEL REPORTE ---\n");
      console.log(report);
      console.log("\n--- FIN DEL REPORTE ---\n");
    }
  }
}

main();
