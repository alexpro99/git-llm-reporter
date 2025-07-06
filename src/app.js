import dotenv from "dotenv";
import { getCommitLogs, getCommitLogsByBranch } from "./services/gitService.js";
import { generateReportWithAI } from "./services/aiService.js";
import { parseArgs } from "./utils/argsParser.js";

dotenv.config();

const showHelp = () => {
  console.log(`
  Uso: git-llm-reporter <rango-de-commits> [opciones]
       git-llm-reporter -b <rama> [-d <días>] [opciones]

  Genera un reporte de un rango de commits o de una rama en los últimos días usando un modelo de IA.

  Opciones:
    -h, --help          Muestra esta ayuda.
    -v, --verbose       Muestra los logs de los commits.
    -m, --model         Especifica el modelo de IA a usar. Por defecto: gemini-1.5-pro.
    -b, --branch        Especifica la rama para obtener los commits.
    -d, --days          Número de días hacia atrás para obtener los commits (por defecto: 7).
  `);
}

export async function run() {
  const args = process.argv.slice(2);
  const { commitRange, verbose, modelName, help, branch, days } = parseArgs(args);

  if (help) {
    showHelp();
    process.exit(0);
  }

  let commits;
  if (branch) {
    console.log(`Obteniendo logs para la rama '${branch}' de los últimos ${days} días...`);
    commits = await getCommitLogsByBranch(branch, days);
  } else if (commitRange) {
    console.log(`Obteniendo logs para el rango: ${commitRange}...`);
    commits = await getCommitLogs(commitRange);
  } else {
    console.error("Debes proporcionar un rango de commits o una rama. Usa -h para ver la ayuda.");
    process.exit(1);
  }

  if (verbose) {
    console.log(`Commits obtenidos: ${commits}\n`);
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
