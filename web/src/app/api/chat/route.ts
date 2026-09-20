import { createDeepSeek } from "@ai-sdk/deepseek";
import { createMCPClient } from "@ai-sdk/mcp";
import { isStepCount, streamText } from "ai";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
});

const defaultMcpUrl =
  "https://api.sanity.io/v1/context/organizations/oey86fpw1/mcp/renderproof-context";

const systemPrompt = `You are RenderProof, a video delivery planning agent.

Use the Sanity Context MCP tools before making factual claims. The Knowledge Base is the source of truth for codec compatibility, container rules, platform delivery limits, and FFmpeg options.

Requirements:
- Cite the Knowledge Base entry or original source used for each material claim.
- Do not fill gaps with model knowledge or invented encoder parameters.
- If evidence is missing, contradictory, or outside the Knowledge Base, say so explicitly.
- Do not introduce a codec, container, option, value, or fallback unless it appears in retrieved content, even as a speculative aside.
- Ask for missing source, destination, or compatibility requirements when they change the answer.
- Generate FFmpeg commands only from verified options and explain the relevant constraints.
- Prefer broad compatibility over compression efficiency unless the user chooses otherwise.
- Keep answers concise and operational.`;

function jsonError(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  let input: z.infer<typeof requestSchema>;

  try {
    input = requestSchema.parse(await request.json());
  } catch {
    return jsonError("Send between 1 and 20 valid chat messages.", 400);
  }

  const sanityToken = process.env.SANITY_API_READ_TOKEN;
  const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;

  if (!sanityToken) {
    return jsonError(
      "SANITY_API_READ_TOKEN is missing. Add the organization Context Viewer token to .env.local.",
      503,
    );
  }

  if (!deepSeekApiKey) {
    return jsonError(
      "DEEPSEEK_API_KEY is missing. Add the DeepSeek API key to .env.local.",
      503,
    );
  }

  let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | undefined;
  let stage = "mcp-connect";

  try {
    mcpClient = await createMCPClient({
      clientName: "renderproof-web",
      transport: {
        type: "http",
        url: process.env.SANITY_CONTEXT_MCP_URL ?? defaultMcpUrl,
        redirect: "follow",
        headers: {
          Authorization: `Bearer ${sanityToken}`,
        },
      },
    });

    stage = "mcp-tools";
    const tools = await mcpClient.tools();
    const deepseek = createDeepSeek({ apiKey: deepSeekApiKey });

    stage = "model-start";
    const result = streamText({
      model: deepseek(process.env.DEEPSEEK_MODEL ?? "deepseek-flash"),
      system: systemPrompt,
      messages: input.messages,
      tools,
      stopWhen: isStepCount(10),
      maxRetries: 2,
      onToolExecutionEnd: ({ toolCall, toolExecutionMs }) => {
        console.info("[renderproof] MCP tool completed", {
          tool: toolCall.toolName,
          durationMs: toolExecutionMs,
        });
      },
      onError: ({ error }) => {
        console.error("[renderproof] streamText error", error);
      },
      onEnd: async () => {
        await mcpClient?.close();
      },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        };

        try {
          for await (const part of result.fullStream) {
            if (part.type === "text-delta") {
              send({ type: "text", text: part.text });
            } else if (part.type === "tool-call") {
              send({
                type: "tool",
                toolName: part.toolName,
                status: "running",
              });
            } else if (part.type === "tool-result") {
              send({
                type: "tool",
                toolName: part.toolName,
                status: "complete",
              });
            } else if (part.type === "tool-error") {
              send({
                type: "tool",
                toolName: part.toolName,
                status: "error",
              });
            } else if (part.type === "error") {
              send({
                type: "error",
                error: "The model stream ended with an error.",
              });
            }
          }
        } catch (streamError) {
          console.error("[renderproof] response stream failed", streamError);
          send({
            type: "error",
            error: "The response stream was interrupted.",
          });
        } finally {
          send({ type: "done" });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/x-ndjson; charset=utf-8",
      },
    });
  } catch (error) {
    await mcpClient?.close();
    console.error("[renderproof] chat setup failed", { stage, error });

    return jsonError(
      `RenderProof failed during ${stage}.`,
      502,
    );
  }
}
