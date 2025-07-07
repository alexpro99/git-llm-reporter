import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { HumanMessage } from '@langchain/core/messages';

// Mock LangChain modules
const mockInvoke = jest.fn();

jest.unstable_mockModule('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    invoke: mockInvoke,
  })),
}));

jest.unstable_mockModule('@langchain/community/chat_models/ollama', () => ({
  ChatOllama: jest.fn().mockImplementation(() => ({
    invoke: mockInvoke,
  })),
}));

// Import the service after mocking
const { generateReportWithAI, generateDeepDiveReport } = await import('./aiService.js');
const { ChatGoogleGenerativeAI } = await import('@langchain/google-genai');
const { ChatOllama } = await import('@langchain/community/chat_models/ollama');


describe('aiService with LangChain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateReportWithAI', () => {
    const commitData = [{ date: '2025-07-06', author: 'test', message: 'feat: initial' }];

    it('should use ChatGoogleGenerativeAI for gemini provider', async () => {
      mockInvoke.mockResolvedValue({ content: 'Gemini Report' });
      await generateReportWithAI({ commitData, provider: 'gemini', modelName: 'gemini-pro' });
      expect(ChatGoogleGenerativeAI).toHaveBeenCalledTimes(1);
      expect(ChatOllama).not.toHaveBeenCalled();
    });

    it('should use ChatOllama for ollama provider', async () => {
      mockInvoke.mockResolvedValue({ content: 'Ollama Report' });
      await generateReportWithAI({ commitData, provider: 'ollama', modelName: 'llama2' });
      expect(ChatOllama).toHaveBeenCalledTimes(1);
      expect(ChatGoogleGenerativeAI).not.toHaveBeenCalled();
    });

    it('should generate a summary report correctly', async () => {
        mockInvoke.mockResolvedValue({ content: 'Summary' });
        const report = await generateReportWithAI({ commitData, provider: 'gemini', reportType: 'summary' });
        expect(mockInvoke).toHaveBeenCalledTimes(1);
        const invokedMessage = mockInvoke.mock.calls[0][0][0].content;
        expect(invokedMessage).toContain('Eres un Tech Lead');
        expect(report).toBe('Summary');
    });
  });

  describe('generateDeepDiveReport', () => {
    const chunks = [
        [{ hash: 'h1', author: 'a1', date: 'd1', message: 'm1', diff: 'diff1' }],
        [{ hash: 'h2', author: 'a2', date: 'd2', message: 'm2', diff: 'diff2' }],
    ];

    it('should call invoke for each chunk and a final report', async () => {
        mockInvoke
            .mockResolvedValueOnce({ content: 'Analysis 1' })
            .mockResolvedValueOnce({ content: 'Analysis 2' })
            .mockResolvedValueOnce({ content: 'Final Report' });

        const report = await generateDeepDiveReport({ chunks, provider: 'gemini' });

        expect(mockInvoke).toHaveBeenCalledTimes(3);
        expect(report).toBe('Final Report');
    });
  });
});
