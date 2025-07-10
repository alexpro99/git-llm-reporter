import { jest, describe, it, expect, afterEach } from '@jest/globals';

jest.unstable_mockModule('fs/promises', () => ({
  __esModule: true,
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

const { mkdir, writeFile } = await import('fs/promises');
const { exportReport } = await import('./exportService.js');
import path from 'path';


describe('exportService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should export a report to a markdown file', async () => {
    const reportContent = 'This is a test report.';
    const outputDir = 'test-output';
    const reportType = 'summary';
    const format = 'md';

    await exportReport(reportContent, outputDir, reportType, format);

    // Verificar que se llamó a mkdir para crear el directorio
    expect(mkdir).toHaveBeenCalledWith(outputDir, {
      recursive: true,
    });

    // Verificar que se llamó a writeFile con los argumentos correctos
    expect(writeFile).toHaveBeenCalledTimes(1);
    const [filePath, content] = writeFile.mock.calls[0];
    
    // Hacer la prueba más robusta evitando la comparación de timestamps
    expect(path.dirname(filePath)).toBe(outputDir);
    expect(filePath).toContain(`-${reportType}.${format}`);
    expect(content).toBe(reportContent);
  });

  it('should log an error for unsupported format', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const reportContent = 'This is a test report.';
    const outputDir = 'test-output';
    const reportType = 'summary';
    const format = 'pdf';

    await exportReport(reportContent, outputDir, reportType, format);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Formato de exportación no soportado: pdf'
    );
    expect(writeFile).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
