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

    const mockDate = new Date();
    const RealDate = Date;
    global.Date = class extends RealDate {
      constructor(dateString) {
        if (dateString) {
          return new RealDate(dateString);
        }
        super();
        return mockDate;
      }
    };
    
    const expectedTimestamp = Date.now();
    const expectedFilename = `${expectedTimestamp}-${reportType}.${format}`;
    const expectedFilepath = path.join(outputDir, expectedFilename);

    await exportReport(reportContent, outputDir, reportType, format);

    expect(mkdir).toHaveBeenCalledWith(path.dirname(expectedFilepath), {
      recursive: true,
    });
    expect(writeFile).toHaveBeenCalledWith(expectedFilepath, reportContent);

    global.Date = RealDate;
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
