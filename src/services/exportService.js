import { mkdir, writeFile } from "fs/promises";
import path from "path";

const exportToFile = async (filePath, content) => {
  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, content);
    console.log(`Reporte exportado exitosamente a: ${filePath}`);
  } catch (error) {
    console.error(`Error al exportar el reporte: ${error.message}`);
  }
};

export const exportReport = async (
  reportContent,
  outputDir,
  reportType,
  format = "md"
) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${timestamp}-${reportType}.${format}`;
  const outputPath = path.join(outputDir, filename);

  if (format === "md") {
    await exportToFile(outputPath, reportContent);
  } else {
    console.error(`Formato de exportación no soportado: ${format}`);
  }
};
