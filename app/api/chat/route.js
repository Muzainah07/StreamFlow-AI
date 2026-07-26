import { createGroq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText } from "ai";
import { MODEL_CONFIG, SYSTEM_PROMPT } from "../../../lib/ai-config.js";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const result = streamText({
      model: groq(MODEL_CONFIG.model),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      maxTokens: MODEL_CONFIG.maxTokens,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat route error", error);

    return new Response(
      JSON.stringify({ error: "Unable to process chat request." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}