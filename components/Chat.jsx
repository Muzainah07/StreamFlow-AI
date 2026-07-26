"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";

function getMessageText(message) {
  if (Array.isArray(message?.parts)) {
    return message.parts
      .filter((part) => part?.type === "text" && typeof part?.text === "string")
      .map((part) => part.text)
      .join("");
  }

  return "";
}

function formatMessageText(text) {
  return String(text ?? "")
    .replace(/```[\s\S]*$/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/^>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function Chat() {
  const containerRef = useRef(null);
  const [input, setInput] = useState("");
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true);
  const { messages, status, stop, sendMessage, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const latestAssistantMessage = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index]?.role === "assistant") {
        return messages[index];
      }
    }
    return null;
  }, [messages]);

  const latestMessage = messages[messages.length - 1];
  const isWaitingForAssistant = isLoading && latestMessage?.role === "user";
  const hasAssistantText = Boolean(getMessageText(latestAssistantMessage)?.trim());
  const showThinking = isWaitingForAssistant || (isLoading && latestMessage?.role === "assistant" && !hasAssistantText);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (isPinnedToBottom) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading, isPinnedToBottom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 24;
      const atBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
      setIsPinnedToBottom(atBottom);
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const jumpToLatest = () => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    setIsPinnedToBottom(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;
    sendMessage({ text: trimmedInput });
    setInput("");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#0d0616] via-[#140a24] to-[#1a0b2e] px-3 py-4 text-zinc-100 sm:px-4">
      <div className="flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-fuchsia-500/20 bg-zinc-950/80 shadow-2xl shadow-fuchsia-900/30 backdrop-blur-xl">
        <header className="border-b border-fuchsia-500/10 px-4 py-4 sm:px-6">
          <h1 className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
            StreamFlow AI ⚡
          </h1>
          <p className="text-sm text-zinc-500">live replies, zero waiting around</p>
        </header>

        <div className="relative flex-1 overflow-hidden">
          <div
            ref={containerRef}
            className="flex h-full flex-col gap-3 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4"
          >
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-fuchsia-500/20 bg-zinc-900/50 px-4 text-center text-sm text-zinc-500">
                no cap, it streams live 
              </div>
            ) : null}

            {messages.map((message) => {
              const messageText = getMessageText(message);
              const isUser = message.role === "user";
              const isAssistant = message.role === "assistant";
              const isLatestAssistant = isAssistant && message.id === latestAssistantMessage?.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-300`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm shadow-md sm:max-w-[80%] sm:py-3 ${
                      isUser
                        ? "rounded-br-md bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white shadow-fuchsia-900/40"
                        : "rounded-bl-md border border-white/10 bg-zinc-800/80 text-zinc-100"
                    }`}
                  >
                    {isLatestAssistant && showThinking ? (
                      <div className="flex items-center gap-1.5 py-0.5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fuchsia-400 [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300" />
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap break-words">{formatMessageText(messageText)}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isPinnedToBottom ? (
            <button
              type="button"
              onClick={jumpToLatest}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-fuchsia-400/30 bg-zinc-900/95 px-3 py-1.5 text-xs font-medium text-fuchsia-300 shadow-lg backdrop-blur transition hover:bg-zinc-800"
            >
              ↓ jump to latest
            </button>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-fuchsia-500/10 bg-zinc-950/90 p-3 sm:p-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="ask StreamFlow anything..."
              className="min-h-11 flex-1 rounded-full border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-500/20"
              disabled={isLoading}
            />

            <div className="flex gap-2 sm:flex-shrink-0">
              {isLoading ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  className="min-h-11 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20"
                >
                  Stop
                </button>
              ) : null}

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="min-h-11 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-fuchsia-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:from-zinc-700 disabled:to-zinc-700 disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}