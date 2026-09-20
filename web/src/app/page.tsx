"use client";

import {
  ArrowUp,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Database,
  Film,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  tools: ToolTrace[];
};

type ToolTrace = {
  name: string;
  status: "running" | "complete" | "error";
};

type StreamEvent =
  | { type: "text"; text: string }
  | {
      type: "tool";
      toolName: string;
      status: ToolTrace["status"];
    }
  | { type: "error"; error: string }
  | { type: "done" };

const starterPrompts = [
  "What constraints should I verify before delivering an H.264 MP4?",
  "Compare libx264 and libx265 for a 1080p social video.",
  "Draft an FFmpeg pipeline for a broadly compatible MP4.",
];

const sourceFacts = [
  { label: "Knowledge base", value: "RenderProof Video Delivery" },
  { label: "Indexed entries", value: "15" },
  { label: "Sources", value: "3 linked sources" },
  { label: "Access", value: "Read-only MCP" },
];

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    tools: [],
  };
}

function toolLabel(toolName: string) {
  const labels: Record<string, string> = {
    initial_context: "Session context",
    knowledge_base_read: "Knowledge base",
    schema_explorer: "Structured schema",
    groq_query: "Structured query",
    array_field_reader: "Field reader",
  };

  return labels[toolName] ?? toolName.replaceAll("_", " ");
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function submitMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isStreaming) return;

    const userMessage = createMessage("user", trimmed);
    const assistantMessage = createMessage("assistant", "");
    const requestMessages = [...messages, userMessage];

    setMessages([...requestMessages, assistantMessage]);
    setInput("");
    setError(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: requestMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? `Request failed with ${response.status}.`);
      }

      if (!response.body) {
        throw new Error("The server returned an empty response stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;

          const event = JSON.parse(line) as StreamEvent;

          if (event.type === "text") {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantMessage.id
                  ? { ...message, content: message.content + event.text }
                  : message,
              ),
            );
          } else if (event.type === "tool") {
            setMessages((current) =>
              current.map((message) => {
                if (message.id !== assistantMessage.id) return message;

                const existing = message.tools.findIndex(
                  (tool) => tool.name === event.toolName,
                );
                const nextTools = [...message.tools];

                if (existing === -1) {
                  nextTools.push({
                    name: event.toolName,
                    status: event.status,
                  });
                } else {
                  nextTools[existing] = {
                    name: event.toolName,
                    status: event.status,
                  };
                }

                return { ...message, tools: nextTools };
              }),
            );
          } else if (event.type === "error") {
            throw new Error(event.error);
          }
        }
      }
    } catch (requestError) {
      if ((requestError as Error).name === "AbortError") return;

      const message =
        requestError instanceof Error
          ? requestError.message
          : "RenderProof could not complete the request.";
      setError(message);
      setMessages((current) =>
        current.filter(
          (item) =>
            item.id !== assistantMessage.id ||
            item.content.trim().length > 0,
        ),
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitMessage(input);
    }
  }

  return (
    <main className="min-h-dvh bg-[#090c0b] text-[#f2f7f4]">
      <header className="border-b border-white/10 bg-[#0b0f0e]/95">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-[#57d6b1] text-[#07100d]">
              <Film aria-hidden="true" className="size-5" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">RenderProof</p>
              <p className="text-[11px] text-[#8d9b96]">
                Knowledge-grounded video delivery
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#57d6b1]/25 bg-[#57d6b1]/8 px-3 py-1.5 text-xs text-[#b9eadb]">
            <ShieldCheck aria-hidden="true" className="size-3.5" />
            MCP evidence mode
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-[1500px] lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/10 bg-[#0d1210] p-5 lg:flex lg:flex-col">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8d9b96]">
            <Database aria-hidden="true" className="size-4" />
            Evidence source
          </div>

          <div className="mt-5 border-y border-white/10 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-white/6">
                <BookOpen aria-hidden="true" className="size-4 text-[#57d6b1]" />
              </div>
              <div>
                <p className="text-sm font-medium">RenderProof Video Delivery</p>
                <p className="mt-1 text-xs leading-5 text-[#8d9b96]">
                  Structured codec rules, source claims, delivery constraints,
                  and pipeline recipes backed by indexed FFmpeg documentation.
                </p>
              </div>
            </div>
          </div>

          <dl className="mt-5 space-y-4">
            {sourceFacts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-[#66736e]">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm text-[#dce7e2]">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto border-t border-white/10 pt-4 text-xs leading-5 text-[#788680]">
            Answers must cite retrieved content. Missing evidence is reported
            instead of guessed.
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
              {messages.length === 0 ? (
                <div className="flex min-h-[52dvh] flex-col justify-center">
                  <div className="mb-5 inline-flex size-11 items-center justify-center rounded-lg border border-[#57d6b1]/25 bg-[#57d6b1]/8">
                    <Sparkles
                      aria-hidden="true"
                      className="size-5 text-[#57d6b1]"
                    />
                  </div>
                  <h1 className="max-w-2xl text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
                    Plan a video delivery pipeline from verified constraints.
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8d9b96] sm:text-base">
                    Ask about codecs, containers, FFmpeg options, or compatibility.
                    RenderProof retrieves the relevant Knowledge Base entries
                    before it answers.
                  </p>

                  <div className="mt-8 grid gap-2 sm:grid-cols-3">
                    {starterPrompts.map((prompt) => (
                      <button
                        className="min-h-24 rounded-lg border border-white/10 bg-white/[0.025] p-4 text-left text-sm leading-5 text-[#cdd9d4] transition hover:border-[#57d6b1]/40 hover:bg-[#57d6b1]/6"
                        key={prompt}
                        onClick={() => void submitMessage(prompt)}
                        type="button"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <article
                    className={
                      message.role === "user"
                        ? "ml-auto max-w-3xl rounded-lg bg-[#edf4f1] px-4 py-3 text-[#101613]"
                        : "mr-auto max-w-4xl border-l-2 border-[#57d6b1] pl-4"
                    }
                    key={message.id}
                  >
                    {message.role === "assistant" && (
                      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#76cdb2]">
                        <ShieldCheck aria-hidden="true" className="size-3.5" />
                        Grounded answer
                      </div>
                    )}
                    {message.role === "assistant" &&
                      (message.tools?.length ?? 0) > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {message.tools?.map((tool) => (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[11px] text-[#9fb0a9]"
                            key={tool.name}
                          >
                            {tool.status === "running" ? (
                              <LoaderCircle
                                aria-hidden="true"
                                className="size-3 animate-spin text-[#efb45d]"
                              />
                            ) : tool.status === "complete" ? (
                              <CheckCircle2
                                aria-hidden="true"
                                className="size-3 text-[#57d6b1]"
                              />
                            ) : (
                              <CircleAlert
                                aria-hidden="true"
                                className="size-3 text-[#efb45d]"
                              />
                            )}
                            {toolLabel(tool.name)}
                          </span>
                        ))}
                      </div>
                    )}
                    {message.role === "assistant" ? (
                      message.content ? (
                        <div className="answer-markdown">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : isStreaming ? (
                        <span className="inline-flex items-center gap-2 text-sm text-[#8d9b96]">
                          <LoaderCircle
                            aria-hidden="true"
                            className="size-4 animate-spin"
                          />
                          Checking the Knowledge Base
                        </span>
                      ) : null
                    ) : (
                      <div className="whitespace-pre-wrap text-sm leading-6 sm:text-[15px]">
                        {message.content}
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#0b0f0e] px-4 py-4 sm:px-8">
            <div className="mx-auto w-full max-w-4xl">
              {error && (
                <div className="mb-3 flex items-start gap-2 rounded-md border border-[#efb45d]/25 bg-[#efb45d]/8 px-3 py-2 text-sm text-[#f3c981]">
                  <CircleAlert
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0"
                  />
                  <span>{error}</span>
                </div>
              )}

              <form
                className="flex items-end gap-3 rounded-lg border border-white/12 bg-[#111614] p-2 focus-within:border-[#57d6b1]/45"
                onSubmit={handleSubmit}
              >
                <label className="sr-only" htmlFor="renderproof-input">
                  Ask RenderProof a question
                </label>
                <textarea
                  className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm leading-6 text-[#eff5f2] outline-none placeholder:text-[#68756f]"
                  id="renderproof-input"
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about codecs, containers, compatibility, or FFmpeg options..."
                  rows={1}
                  value={input}
                />
                <button
                  aria-label="Send message"
                  className="grid size-10 shrink-0 place-items-center rounded-md bg-[#57d6b1] text-[#07100d] transition hover:bg-[#6ce0bd] disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!input.trim() || isStreaming}
                  title="Send message"
                  type="submit"
                >
                  <ArrowUp aria-hidden="true" className="size-4" strokeWidth={2.4} />
                </button>
              </form>
              <p className="mt-2 text-center text-[11px] text-[#66736e]">
                Answers are limited to retrieved Sanity Knowledge Base content.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
