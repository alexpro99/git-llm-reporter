import dotenv from "dotenv";
import {
  getCommitLogs,
  getCommitLogsByBranch,
  getCommitDiff,
} from "./services/gitService.js";
import {
  generateReportWithAI,
  generateDeepDiveReport,
} from "./services/aiService.js";
import { exportReport } from "./services/exportService.js";
import { parseArgs } from "./utils/argsParser.js";

dotenv.config();

const showHelp = () => {
  console.log(`
  Uso: gitreport <rango-de-commits> [opciones]
       gitreport -b <rama> [-d <días>] [opciones]

  Genera un reporte de un rango de commits o de una rama en los últimos días usando un modelo de IA.

  Opciones:
    -h, --help          Muestra esta ayuda.
    -v, --verbose       Muestra los logs de los commits.
    --provider          Proveedor de IA a usar ('gemini' o 'ollama'). Por defecto: 'gemini'.
    -m, --model         Especifica el modelo de IA a usar.
                        - Para 'gemini' (por defecto): 'gemini-2.5-flash'.
                        - Para 'ollama': el nombre del modelo que tengas instalado (ej. 'llama3').
    -b, --branch        Especifica la rama para obtener los commits.
    -d, --days          Número de días hacia atrás para obtener los commits (por defecto: 7).
    --report-type       Tipo de reporte a generar ('summary' o 'personal'). Por defecto: 'summary'.
    --deep-dive         Realiza un análisis profundo del código en cada commit.
    --chunk-size        Tamaño de los chunks para el análisis profundo (por defecto: 5).
    --dev-filter        Filtra los commits por un autor específico.
    -o, --out           Ruta para exportar el reporte (por defecto: no se exporta).
  `);
};

async function getCommits(branch, days, commitRange, devFilter) {
  if (branch) {
    console.log(
      `Obteniendo logs para la rama '${branch}' de los últimos ${days} días...`
    );
    return getCommitLogsByBranch(branch, days, devFilter);
  }
  if (commitRange) {
    console.log(`Obteniendo logs para el rango: ${commitRange}...`);
    return getCommitLogs(commitRange, devFilter);
  }
  console.error(
    "Debes proporcionar un rango de commits o una rama. Usa -h para ver la ayuda."
  );
  process.exit(1);
}

export async function run() {
  const args = process.argv.slice(2);
  const {
    commitRange,
    verbose,
    modelName,
    help,
    branch,
    days,
    reportType,
    deepDive,
    chunkSize,
    provider,
    devFilter,
    outPath,
  } = parseArgs(args);

  if (help) {
    showHelp();
    process.exit(0);
  }

  const commits = await getCommits(branch, days, commitRange, devFilter);

  if (verbose) {
    console.log(`Commits obtenidos: ${JSON.stringify(commits, null, 2)}
`);
  }

  if (commits && commits.length > 0) {
    let report;
    if (deepDive) {
      console.log("Iniciando análisis profundo de commits...");
      const commitsWithDiffs = [];
      for (const commit of commits) {
        const diff = await getCommitDiff(commit.hash, verbose);
        if (diff) {
          commitsWithDiffs.push({ ...commit, diff });
        }
      }

      const chunks = [];
      for (let i = 0; i < commitsWithDiffs.length; i += chunkSize) {
        chunks.push(commitsWithDiffs.slice(i, i + chunkSize));
      }

      report = await generateDeepDiveReport({ chunks, provider, modelName, outPath });
    } else {
      console.log(
        `Logs obtenidos. Enviando a ${provider}/${modelName} para generar el reporte...`
      );
      report = await generateReportWithAI({
        commitData: commits,
        provider,
        modelName,
        reportType,
      });
    }

    if (report) {
      console.log("\n--- INICIO DEL REPORTE ---\n");
      console.log(report);
      console.log("\n--- FIN DEL REPORTE ---\n");
      if (outPath) {
        await exportReport(report, outPath, reportType);
      }
    }
  } else {
    console.log("No se encontraron commits para analizar.");
  }
}
