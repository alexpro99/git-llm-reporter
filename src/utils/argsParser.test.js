import { parseArgs } from './argsParser.js';

describe('parseArgs', () => {
  test('should parse commit range correctly', () => {
    const args = ['HEAD~1..HEAD'];
    const result = parseArgs(args);
    expect(result.commitRange).toBe('HEAD~1..HEAD');
  });

  test('should handle verbose flag', () => {
    const args = ['-v'];
    const result = parseArgs(args);
    expect(result.verbose).toBe(true);
  });

  test('should handle help flag', () => {
    const args = ['--help'];
    const result = parseArgs(args);
    expect(result.help).toBe(true);
  });

  test('should parse model name', () => {
    const args = ['-m', 'gemini-pro'];
    const result = parseArgs(args);
    expect(result.modelName).toBe('gemini-pro');
  });

  test('should use default model name if not provided', () => {
    const args = [];
    const result = parseArgs(args);
    expect(result.modelName).toBe('gemini-2.5-flash');
  });

  test('should parse branch name', () => {
    const args = ['--branch', 'develop'];
    const result = parseArgs(args);
    expect(result.branch).toBe('develop');
  });

  test('should parse days', () => {
    const args = ['-d', '3'];
    const result = parseArgs(args);
    expect(result.days).toBe(3);
  });

  test('should use default days if not provided', () => {
    const args = [];
    const result = parseArgs(args);
    expect(result.days).toBe(7);
  });

  test('should parse report type', () => {
    const args = ['--report-type', 'detailed'];
    const result = parseArgs(args);
    expect(result.reportType).toBe('detailed');
  });

  test('should use default report type if not provided', () => {
    const args = [];
    const result = parseArgs(args);
    expect(result.reportType).toBe('summary');
  });

  test('should handle deep-dive flag', () => {
    const args = ['--deep-dive'];
    const result = parseArgs(args);
    expect(result.deepDive).toBe(true);
  });

  test('should parse chunk size', () => {
    const args = ['--chunk-size', '10'];
    const result = parseArgs(args);
    expect(result.chunkSize).toBe(10);
  });

  test('should use default chunk size if not provided', () => {
    const args = [];
    const result = parseArgs(args);
    expect(result.chunkSize).toBe(5);
  });

  test('should handle a combination of arguments', () => {
    const args = ['main..develop', '-v', '--model', 'gemini-2.5-flash', '-d', '5'];
    const result = parseArgs(args);
    expect(result.commitRange).toBe('main..develop');
    expect(result.verbose).toBe(true);
    expect(result.modelName).toBe('gemini-2.5-flash');
    expect(result.days).toBe(5);
  });

  test('should parse dev-filter', () => {
    const args = ['--dev-filter', 'alexpro99'];
    const result = parseArgs(args);
    expect(result.devFilter).toBe('alexpro99');
  });
});
