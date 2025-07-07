import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the entire module before any imports
const mockGenerateContent = jest.fn();
jest.unstable_mockModule('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}));

// Now, import the service we want to test
const { generateReportWithAI, generateDeepDiveReport } = await import('./aiService.js');

describe('aiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateReportWithAI', () => {
    const commitData = [
      { date: '2025-07-06', author: 'test', message: 'feat: initial commit' },
      { date: '2025-07-05', author: 'test2', message: 'fix: bug in login' },
    ];

    it('should call generateWithAI with a summary prompt', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Summary Report' },
      });
      
      const report = await generateReportWithAI(commitData, 'gemini-pro', 'summary');

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      const prompt = mockGenerateContent.mock.calls[0][0];
      expect(prompt).toContain('Eres un Tech Lead');
      expect(prompt).toContain('2025-07-06 | test | feat: initial commit');
      expect(report).toBe('Summary Report');
    });

    it('should call generateWithAI with a personal prompt', async () => {
        mockGenerateContent.mockResolvedValue({
            response: { text: () => 'Personal Report' },
        });
        
        const report = await generateReportWithAI(commitData, 'gemini-pro', 'personal');
  
        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        const prompt = mockGenerateContent.mock.calls[0][0];
        expect(prompt).toContain('Eres un desarrollador');
        expect(prompt).toContain('2025-07-05 | test2 | fix: bug in login');
        expect(report).toBe('Personal Report');
    });

    it('should handle AI content generation errors', async () => {
        mockGenerateContent.mockRejectedValue(new Error('AI Error'));
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const report = await generateReportWithAI(commitData, 'gemini-pro', 'summary');

        expect(report).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error al generar contenido con la IA:', expect.any(Error));
        consoleErrorSpy.mockRestore();
    });
  });

  describe('generateDeepDiveReport', () => {
    const chunks = [
        [{ hash: 'h1', author: 'a1', date: 'd1', message: 'm1', diff: 'diff1' }],
        [{ hash: 'h2', author: 'a2', date: 'd2', message: 'm2', diff: 'diff2' }],
    ];

    it('should analyze each chunk and generate a final report', async () => {
        mockGenerateContent
            .mockResolvedValueOnce({ response: { text: () => 'Analysis 1' } })
            .mockResolvedValueOnce({ response: { text: () => 'Analysis 2' } })
            .mockResolvedValueOnce({ response: { text: () => 'Final Report' } });

        const report = await generateDeepDiveReport(chunks, 'gemini-pro');

        expect(mockGenerateContent).toHaveBeenCalledTimes(3);
        
        const prompt1 = mockGenerateContent.mock.calls[0][0];
        expect(prompt1).toContain('Eres un experto en análisis de código');
        expect(prompt1).toContain('Diff:\ndiff1');

        const prompt2 = mockGenerateContent.mock.calls[1][0];
        expect(prompt2).toContain('Commit: h2');
        expect(prompt2).toContain('Diff:\ndiff2');

        const finalPrompt = mockGenerateContent.mock.calls[2][0];
        expect(finalPrompt).toContain('Eres un Arquitecto de Software');
        expect(finalPrompt).toContain('Analysis 1');
        expect(finalPrompt).toContain('Analysis 2');

        expect(report).toBe('Final Report');
    });
  });
});
