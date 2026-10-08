 
export const MODEL_NAME = "openai/gpt-oss-120b";

// The system instruction that shapes the assistant's behavior in this UI.
export const SYSTEM_PROMPT =
  "You are a helpful AI assistant inside a streaming chat application. Keep answers concise, conversational, and easy to read on a phone screen.";

// Shared model settings for the server route.
export const MODEL_CONFIG = {
  model: MODEL_NAME,
  maxTokens: 1000,
};