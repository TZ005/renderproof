# RenderProof Demo Script

## Opening

RenderProof answers video delivery questions from a Sanity Knowledge Base. It
does not rely on model memory for encoder rules. The agent must retrieve a
source claim or structured rule before making a material statement.

## Demo 1: Structured constraint

Ask:

> Can I use libx264 nal-hrd=cbr when the output container is MP4?

Show the MCP trace:

- `initial_context`
- `knowledge_base_read`

Expected answer:

- `nal-hrd=cbr` is prohibited in MP4.
- `nal-hrd` requires `vbv-bufsize`.
- The Knowledge Base does not establish a verified fallback container.

## Demo 2: Unknown platform limits

Ask:

> What are the exact delivery limits for a 1080p social video?

Expected behavior:

- The agent explains that "social video" and platform-specific limits are not
  defined in the Knowledge Base.
- It asks for the destination platform and an authoritative source.

## Demo 3: Evidence-bounded command

Ask:

> Create a minimal H.264 MP4 FFmpeg command using only documented options.

Expected behavior:

- The answer uses `libx264`, `crf`, AAC, and `-movflags +faststart`.
- It does not add presets, profiles, or pixel formats that are not supported by
  retrieved evidence.

## Closing

Show that replacing the source dataset changes the answer. The agent is useful
because the content is structured, scoped, and cited, not because it is another
generic chatbot.
