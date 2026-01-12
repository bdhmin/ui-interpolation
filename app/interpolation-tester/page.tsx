"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import DualUIPanels from "../components/DualUIPanels";
import InterpolationViewer, {
  InterpolatedState,
} from "../components/InterpolationViewer";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function stripCodeFences(code: string): string {
  let stripped = code.replace(
    /^```(?:tsx?|jsx?|typescript|javascript)?\s*\n?/i,
    ""
  );
  stripped = stripped.replace(/\n?```\s*$/i, "");
  return stripped;
}

type GenerationTarget = "ui1" | "ui2" | null;
type Phase = "generation" | "interpolation";

export default function InterpolationTester() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [ui1Code, setUi1Code] = useState<string>("");
  const [ui2Code, setUi2Code] = useState<string>("");
  const [isGeneratingUI1, setIsGeneratingUI1] = useState(false);
  const [isGeneratingUI2, setIsGeneratingUI2] = useState(false);
  const [isInterpolating, setIsInterpolating] = useState(false);
  const [interpolatedStates, setInterpolatedStates] = useState<
    InterpolatedState[]
  >([]);
  const [phase, setPhase] = useState<Phase>("generation");
  const [input, setInput] = useState("");
  const [generationTarget, setGenerationTarget] =
    useState<GenerationTarget>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [splitPosition, setSplitPosition] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSplitPosition(Math.min(50, Math.max(20, percentage)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  const generateUI = useCallback(
    async (prompt: string, target: "ui1" | "ui2") => {
      const isUI1 = target === "ui1";
      const setIsGenerating = isUI1 ? setIsGeneratingUI1 : setIsGeneratingUI2;
      const setCode = isUI1 ? setUi1Code : setUi2Code;

      setIsGenerating(true);
      setCode("");

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            history: messages
              .filter((m) => m.role === "user")
              .slice(-3)
              .map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullCode = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullCode += chunk;
            setCode(stripCodeFences(fullCode));
          }
        }

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `${isUI1 ? "UI 1" : "UI 2"} generated successfully!`,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Generation error:", error);
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Failed to generate ${isUI1 ? "UI 1" : "UI 2"}. Please try again.`,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsGenerating(false);
        setGenerationTarget(null);
      }
    },
    [messages]
  );

  const handleSend = useCallback(
    async (prompt: string) => {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
      };
      setMessages((prev) => [...prev, userMessage]);

      // Determine which UI to generate based on current state
      if (generationTarget) {
        await generateUI(prompt, generationTarget);
      } else if (!ui1Code) {
        await generateUI(prompt, "ui1");
      } else if (!ui2Code) {
        await generateUI(prompt, "ui2");
      }
    },
    [ui1Code, ui2Code, generationTarget, generateUI]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGeneratingUI1 && !isGeneratingUI2) {
      handleSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInterpolate = useCallback(async () => {
    if (!ui1Code || !ui2Code) return;

    setIsInterpolating(true);

    try {
      const response = await fetch("/api/interpolate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ui1Code,
          ui2Code,
          iterations: 3,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to interpolate");
      }

      const data = await response.json();
      setInterpolatedStates(data.states);
      setPhase("interpolation");
    } catch (error) {
      console.error("Interpolation error:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Failed to interpolate UIs. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsInterpolating(false);
    }
  }, [ui1Code, ui2Code]);

  const handleBackToGeneration = () => {
    setPhase("generation");
  };

  const canInterpolate = !!ui1Code && !!ui2Code && !isGeneratingUI1 && !isGeneratingUI2;

  // Show interpolation viewer if in interpolation phase
  if (phase === "interpolation" && interpolatedStates.length > 0) {
    return (
      <InterpolationViewer
        states={interpolatedStates}
        onBack={handleBackToGeneration}
      />
    );
  }

  // Generation phase UI
  return (
    <div
      ref={containerRef}
      className="flex h-screen w-screen overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Left Panel - Chat */}
      <div
        className="flex h-full shrink-0 flex-col"
        style={{
          width: `${splitPosition}%`,
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        {/* Header */}
        <div
          className="flex h-14 shrink-0 items-center justify-between px-5"
          style={{ borderBottom: "1px solid var(--border-primary)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              UI Generator
            </span>
          </div>
          <a
            href="/"
            className="rounded-md p-1.5 transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </a>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4">
              <div
                className="mb-4 rounded-full p-3"
                style={{ backgroundColor: "var(--bg-elevated)" }}
              >
                <svg
                  className="h-6 w-6"
                  style={{ color: "var(--text-muted)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3
                className="mb-2 text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Generate Two UIs
              </h3>
              <p
                className="max-w-xs text-center text-xs leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                Describe the first UI you want to create. After that, describe a
                second UI. Then interpolate between them.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className="max-w-[90%] rounded-2xl px-4 py-2.5"
                    style={{
                      backgroundColor:
                        message.role === "user"
                          ? "var(--user-message-bg)"
                          : "var(--assistant-message-bg)",
                      color:
                        message.role === "user"
                          ? "var(--user-message-text)"
                          : "var(--assistant-message-text)",
                    }}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              {(isGeneratingUI1 || isGeneratingUI2) && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl px-4 py-2.5"
                    style={{ backgroundColor: "var(--assistant-message-bg)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"
                        style={{ backgroundColor: "var(--text-muted)" }}
                      />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"
                        style={{ backgroundColor: "var(--text-muted)" }}
                      />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full"
                        style={{ backgroundColor: "var(--text-muted)" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Generation target selector */}
        {(ui1Code || ui2Code) && (
          <div
            className="flex gap-2 px-4 pb-2"
            style={{ borderTop: "1px solid var(--border-primary)" }}
          >
            <span
              className="pt-3 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Generate for:
            </span>
            <div className="flex gap-1 pt-2">
              <button
                onClick={() => setGenerationTarget("ui1")}
                disabled={isGeneratingUI1 || isGeneratingUI2}
                className="rounded-md px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor:
                    generationTarget === "ui1"
                      ? "var(--accent)"
                      : "var(--bg-tertiary)",
                  color:
                    generationTarget === "ui1"
                      ? "white"
                      : "var(--text-secondary)",
                }}
              >
                UI 1 {ui1Code ? "✓" : ""}
              </button>
              <button
                onClick={() => setGenerationTarget("ui2")}
                disabled={isGeneratingUI1 || isGeneratingUI2}
                className="rounded-md px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor:
                    generationTarget === "ui2"
                      ? "var(--accent)"
                      : "var(--bg-tertiary)",
                  color:
                    generationTarget === "ui2"
                      ? "white"
                      : "var(--text-secondary)",
                }}
              >
                UI 2 {ui2Code ? "✓" : ""}
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <div
            className="overflow-hidden rounded-xl"
            style={{
              border: "1px solid var(--border-primary)",
              backgroundColor: "var(--bg-tertiary)",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                !ui1Code
                  ? "Describe UI 1..."
                  : !ui2Code
                    ? "Describe UI 2..."
                    : "Describe a UI..."
              }
              disabled={isGeneratingUI1 || isGeneratingUI2}
              rows={2}
              className="block w-full resize-none border-0 bg-transparent p-3 text-sm leading-relaxed focus:outline-none focus:ring-0 disabled:opacity-50"
              style={{ color: "var(--text-primary)" }}
            />
            <div className="flex items-center justify-between px-3 pb-2">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Enter to send
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  !input.trim() || isGeneratingUI1 || isGeneratingUI2
                }
                className="rounded-lg px-4 py-1.5 text-xs font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resizable Divider */}
      <div
        className="group relative h-full w-1 shrink-0 cursor-col-resize transition-colors"
        style={{
          backgroundColor: isDragging
            ? "var(--divider-hover)"
            : "var(--divider)",
        }}
        onMouseDown={() => setIsDragging(true)}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = "var(--divider-hover)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = "var(--divider)";
          }
        }}
      />

      {/* Right Panel - Dual UI Panels */}
      <div className="h-full min-w-0 flex-1">
        <DualUIPanels
          ui1Code={ui1Code}
          ui2Code={ui2Code}
          isGeneratingUI1={isGeneratingUI1}
          isGeneratingUI2={isGeneratingUI2}
          onInterpolate={handleInterpolate}
          canInterpolate={canInterpolate}
          isInterpolating={isInterpolating}
        />
      </div>
    </div>
  );
}
