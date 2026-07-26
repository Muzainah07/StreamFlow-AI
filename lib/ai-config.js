 
export const MODEL_NAME = "llama-3.3-70b-versatile";

// The system instruction that shapes the assistant's behavior in this UI.
export const SYSTEM_PROMPT =
  "You are a helpful AI assistant inside a streaming chat application. Keep answers concise, conversational, and easy to read on a phone screen.";

// Shared model settings for the server route.
export const MODEL_CONFIG = {
  model: "llama-3.3-70b-versatile",
  maxTokens: 1000,
};