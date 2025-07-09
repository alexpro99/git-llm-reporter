import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";

export function createAiModel(
  provider,
  modelName,
  OllamaClass = ChatOllama,
  GeminiClass = ChatGoogleGenerativeAI
) {
  if (process.env.E2E_TEST_MOCK_AI === "true") {
    return {
      invoke: async (messages) => {
        const content = messages[0].content;
        if (content.includes("Eres un Tech Lead")) {
          return { content: "Mocked Summary Report" };
        }
        if (content.includes("ayuda a desarrolladores a crear reportes")) {
          return { content: "Mocked Personal Report" };
        }
        return { content: "Mocked AI Response" };
      },
    };
  }

  switch (provider) {
    case "ollama":
      return new OllamaClass({
        baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
        model: modelName,
      });
    case "gemini":
    default:
      if (!process.env.GEMINI_API_KEY) {
        throw new Error(
          "missing_gemini_api_key"
        );
      }
      return new GeminiClass({
        apiKey: process.env.GEMINI_API_KEY,
        model: modelName,
      });
  }
}
