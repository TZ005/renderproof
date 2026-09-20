const endpoint = process.env.RENDERPROOF_SMOKE_URL ?? "http://127.0.0.1:3000/api/chat";

const question =
  "Can I use libx264 nal-hrd=cbr for MP4, and is any fallback container established by the Knowledge Base?";

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: question }],
  }),
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Smoke request failed: ${response.status} ${body}`);
}

if (!response.body) {
  throw new Error("Smoke request returned no response body.");
}

const reader = response.body.getReader();
const decoder = new TextDecoder();
const events = [];
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop() ?? "";

  for (const line of lines) {
    if (line.trim()) events.push(JSON.parse(line));
  }
}

const toolNames = new Set(
  events
    .filter((event) => event.type === "tool" && event.status === "complete")
    .map((event) => event.toolName),
);

const answer = events
  .filter((event) => event.type === "text")
  .map((event) => event.text)
  .join("");

const assertions = [
  {
    name: "initial_context completed",
    passed: toolNames.has("initial_context"),
  },
  {
    name: "knowledge_base_read completed",
    passed: toolNames.has("knowledge_base_read"),
  },
  {
    name: "answer is not empty",
    passed: answer.trim().length > 100,
  },
  {
    name: "answer refuses unverified MPEG-TS fallback",
    passed:
      !answer.includes("MPEG-TS") ||
      /not established|no fallback|not verified/i.test(answer),
  },
];

for (const assertion of assertions) {
  console.log(`${assertion.passed ? "PASS" : "FAIL"} ${assertion.name}`);
}

if (assertions.some((assertion) => !assertion.passed)) {
  console.error("\nAnswer:\n", answer);
  process.exitCode = 1;
} else {
  console.log(`\nTools: ${[...toolNames].join(", ")}`);
}
