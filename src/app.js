import dotenv from "dotenv";
import { getCommitLogs } from "./services/gitService.js";
import { generateReportWithAI } from "./services/aiService.js";
import { parseArgs } from "./utils/argsParser.js";

dotenv.config();

export async function run() {
  const args = process.argv.slice(2);
  const { commitRange, verbose, modelName } = parseArgs(args);

  if (!commitRange) {
    console.error("Debes proporcionar un rango de commits. Ejemplo: 'main..develop'");
    process.exit(1);
  }

  console.log(`Obteniendo logs para el rango: ${commitRange}...`);
  const commits = await getCommitLogs(commitRange);

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
