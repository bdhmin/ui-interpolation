import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const INTERPOLATION_SYSTEM_PROMPT = `You are an expert React developer specializing in UI interpolation. Given two UI components, you will generate an intermediate UI that sits visually and functionally between them.

Your task is to create a React component that:
1. Represents a middle-ground between UI1 and UI2
2. Includes IN-SITU DIRECT MANIPULATION CONTROLS that allow users to transition toward either UI1 or UI2

CRITICAL RULES FOR DIRECT MANIPULATION:
- Embed interactive controls WITHIN the UI itself (not in a separate panel)
- Examples of in-situ controls:
  * Draggable handles on elements that resize/reposition them
  * Toggle switches that morph sections of the UI
  * Expandable/collapsible regions
  * Sliders embedded within the component
  * Click-to-cycle variations on specific elements
- These controls should feel NATURAL to the UI context
- Add subtle visual hints (handles, hover states, cursors) for discoverability

Technical rules:
- Output ONLY the React component code, no explanations or markdown
- Use TypeScript with proper types
- Use Tailwind CSS for all styling
- The component should be a default export named "GeneratedComponent"
- Do not include any imports - assume React hooks are in scope
- IMPORTANT: Never use template literals in JSX attributes. Use string concatenation instead
- IMPORTANT: Use hooks directly (useState, useEffect, etc.) - NOT React.useState

When creating the intermediate UI:
1. Analyze the structural differences between UI1 and UI2
2. Create a hybrid that blends both designs
3. Add manipulation affordances that hint at how the UI could transform`;

interface InterpolatedState {
  id: string;
  code: string;
  label: string;
}

function stripCodeFences(code: string): string {
  let stripped = code.replace(/^```(?:tsx?|jsx?|typescript|javascript)?\s*\n?/i, "");
  stripped = stripped.replace(/\n?```\s*$/i, "");
  return stripped;
}

async function generateIntermediateUI(
  ui1Code: string,
  ui2Code: string,
  position: string
): Promise<string> {
  const prompt = `Generate an intermediate UI component that sits between these two UIs.

UI 1 (Starting point):
\`\`\`tsx
${ui1Code}
\`\`\`

UI 2 (Ending point):
\`\`\`tsx
${ui2Code}
\`\`\`

Position in interpolation: ${position}

Create a UI that blends elements from both, with in-situ direct manipulation controls that let users interact with the transition. The controls should be embedded naturally within the UI itself.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: INTERPOLATION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? stripCodeFences(textBlock.text) : "";
}

async function interpolateRecursively(
  states: InterpolatedState[],
  iteration: number,
  maxIterations: number
): Promise<InterpolatedState[]> {
  if (iteration >= maxIterations) {
    return states;
  }

  const newStates: InterpolatedState[] = [];

  for (let i = 0; i < states.length; i++) {
    // Add the current state
    newStates.push(states[i]);

    // If not the last state, generate an intermediate between this and the next
    if (i < states.length - 1) {
      const currentState = states[i];
      const nextState = states[i + 1];
      
      const position = `Between "${currentState.label}" and "${nextState.label}" (iteration ${iteration + 1}/${maxIterations})`;
      
      const intermediateCode = await generateIntermediateUI(
        currentState.code,
        nextState.code,
        position
      );

      const intermediateLabel = `${currentState.label} → ${nextState.label}`;
      
      newStates.push({
        id: `intermediate-${iteration}-${i}`,
        code: intermediateCode,
        label: intermediateLabel,
      });
    }
  }

  // Recursively interpolate the new states
  return interpolateRecursively(newStates, iteration + 1, maxIterations);
}

export async function POST(req: Request) {
  try {
    const { ui1Code, ui2Code, iterations = 3 } = await req.json();

    if (!ui1Code || !ui2Code) {
      return new Response(
        JSON.stringify({ error: "Both ui1Code and ui2Code are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Start with the two initial states
    const initialStates: InterpolatedState[] = [
      { id: "ui1", code: ui1Code, label: "UI 1" },
      { id: "ui2", code: ui2Code, label: "UI 2" },
    ];

    // Recursively generate intermediate states
    const allStates = await interpolateRecursively(
      initialStates,
      0,
      Math.min(iterations, 3) // Cap at 3 iterations to avoid too many API calls
    );

    return new Response(
      JSON.stringify({ states: allStates }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Interpolation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to interpolate UIs" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
