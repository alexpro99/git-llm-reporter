import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { generateReportWithAI, generateDeepDiveReport } from './aiService.js';

describe('aiService with dependency injection', () => {
  let mockInvoke;
  let MockOllama;
  let MockGemini;
  let originalEnv;

  // Guardar el estado original de las variables de entorno
  beforeAll(() => {
    originalEnv = { ...process.env };
    process.env.GEMINI_API_KEY = 'testapi'
  });

  // Restaurar las variables de entorno después de todas las pruebas
  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    // Asegurarse de que el mock de E2E no esté activo para estos tests
    delete process.env.E2E_TEST_MOCK_AI;

    mockInvoke = jest.fn();
    MockOllama = jest.fn().mockImplementation(() => ({
      invoke: mockInvoke,
    }));
    MockGemini = jest.fn().mockImplementation(() => ({
      invoke: mockInvoke,
    }));
  });

  describe('generateReportWithAI', () => {
    const commitData = [{ date: '2025-07-06', author: 'test', message: 'feat: initial' }];

    it('should use GeminiClass for gemini provider', async () => {
      await generateReportWithAI({
        commitData,
        provider: 'gemini',
        GeminiClass: MockGemini,
        OllamaClass: MockOllama,
      });
      expect(MockGemini).toHaveBeenCalledTimes(1);
      expect(MockOllama).not.toHaveBeenCalled();
    });

    it('should use OllamaClass for ollama provider', async () => {
      await generateReportWithAI({
        commitData,
        provider: 'ollama',
        GeminiClass: MockGemini,
        OllamaClass: MockOllama,
      });
      expect(MockOllama).toHaveBeenCalledTimes(1);
      expect(MockGemini).not.toHaveBeenCalled();
    });

    it('should call invoke with the correct personal prompt', async () => {
        mockInvoke.mockResolvedValue({ content: 'Personal Report' });
        const report = await generateReportWithAI({
            commitData,
            provider: 'gemini',
            reportType: 'personal',
            GeminiClass: MockGemini,
        });
        const invokedMessage = mockInvoke.mock.calls[0][0][0].content;
        expect(invokedMessage).toContain('ayuda a desarrolladores a crear reportes');
        expect(report).toBe('Personal Report');
    });
  });

  describe('generateDeepDiveReport', () => {
    const chunks = [
        [{ hash: 'h1', author: 'a1', date: 'd1', message: 'm1', diff: 'diff1' }],
    ];

    it('should call invoke for each chunk and a final report', async () => {
        mockInvoke
            .mockResolvedValueOnce({ content: 'Analysis 1' })
            .mockResolvedValueOnce({ content: 'Final Report' });

        const report = await generateDeepDiveReport({
            chunks,
            provider: 'gemini',
            GeminiClass: MockGemini,
        });

        expect(mockInvoke).toHaveBeenCalledTimes(2);
        expect(report).toBe('Final Report');
    });
  });
});