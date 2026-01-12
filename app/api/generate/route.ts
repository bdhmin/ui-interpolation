import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert React developer. Generate a single React functional component based on the user's request.

Rules:
- Output ONLY the React component code, no explanations or markdown
- Use TypeScript with proper types
- Use Tailwind CSS for all styling
- The component should be a default export named "GeneratedComponent"
- Do not include any imports - assume React hooks (useState, useEffect, useRef, useMemo, useCallback, etc.) are already in scope and can be used directly
- Make the component self-contained and visually appealing
- Use modern React patterns (hooks, functional components)
- IMPORTANT: Never use template literals (backticks with \${}) inside JSX attributes. Use string concatenation instead. For example, use key={"item-" + index} instead of key={\`item-\${index}\`}
- IMPORTANT: Use hooks directly (useState, useEffect, etc.) - do NOT use React.useState or React.useEffect syntax

Example output format:
export default function GeneratedComponent() {
  return (
    <div className="p-4">
      {/* component content */}
    </div>
  );
}`;

export async function POST(req: Request) {
  const { prompt, history } = await req.json();

  const messages: Anthropic.MessageParam[] = [
    ...(history || []),
    { role: "user", content: prompt },
  ];

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages,
  });

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}

