"use client";

import { useState, useEffect } from "react";
import {
  SandpackProvider,
  SandpackPreview,
  SandpackLayout,
} from "@codesandbox/sandpack-react";
import { codeToHtml } from "shiki";
import StateSlider from "./StateSlider";

export interface InterpolatedState {
  id: string;
  code: string;
  label: string;
}

interface InterpolationViewerProps {
  states: InterpolatedState[];
  onBack: () => void;
}

export default function InterpolationViewer({
  states,
  onBack,
}: InterpolationViewerProps) {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"ui" | "code">("ui");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");

  const currentState = states[currentStateIndex];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (currentState?.code) {
      codeToHtml(currentState.code, {
        lang: "tsx",
        theme: isDarkMode ? "github-dark" : "github-light",
      }).then(setHighlightedHtml);
    }
  }, [currentState?.code, isDarkMode]);

  const hasReactImport =
    currentState?.code?.includes("import") &&
    currentState?.code?.includes("react");
  const componentCode = hasReactImport
    ? currentState?.code
    : `import { useState, useEffect, useRef, useMemo, useCallback } from "react";\n\n${currentState?.code || ""}`;

  const bgColor = isDarkMode ? "bg-zinc-950" : "bg-zinc-50";
  const appCode = `import GeneratedComponent from "./GeneratedComponent";

export default function App() {
  return (
    <div className="min-h-screen ${bgColor} p-6">
      <GeneratedComponent />
    </div>
  );
}`;

  const files = {
    "/App.tsx": appCode,
    "/GeneratedComponent.tsx": componentCode,
  };

  const stateLabels = states.map((s) => s.label);

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Header */}
      <div
        className="flex h-14 shrink-0 items-center justify-between px-5"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-primary)",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <div
            className="h-5"
            style={{ borderLeft: "1px solid var(--border-primary)" }}
          />
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Interpolation Result
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-xs"
              style={{
                backgroundColor: "var(--bg-elevated)",
                color: "var(--text-muted)",
              }}
            >
              {states.length} states
            </span>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("ui")}
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
            style={{
              backgroundColor:
                activeTab === "ui" ? "var(--bg-elevated)" : "transparent",
              color:
                activeTab === "ui"
                  ? "var(--text-primary)"
                  : "var(--text-muted)",
            }}
          >
            UI
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
            style={{
              backgroundColor:
                activeTab === "code" ? "var(--bg-elevated)" : "transparent",
              color:
                activeTab === "code"
                  ? "var(--text-primary)"
                  : "var(--text-muted)",
            }}
          >
            Code
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "ui" ? (
          <div
            className="h-full"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <SandpackProvider
              key={currentStateIndex}
              template="react-ts"
              theme={isDarkMode ? "dark" : "light"}
              files={files}
              customSetup={{
                dependencies: {
                  react: "^18.2.0",
                  "react-dom": "^18.2.0",
                },
              }}
              options={{
                externalResources: ["https://cdn.tailwindcss.com"],
                classes: {
                  "sp-wrapper": "!h-full",
                  "sp-layout": "!h-full !border-0 !bg-transparent",
                  "sp-preview": "!h-full",
                  "sp-preview-container": "!h-full",
                },
              }}
            >
              <SandpackLayout>
                <SandpackPreview
                  showNavigator={false}
                  showOpenInCodeSandbox={false}
                  showRefreshButton={true}
                />
              </SandpackLayout>
            </SandpackProvider>
          </div>
        ) : (
          <div
            className="h-full overflow-auto p-5 font-mono text-sm"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span
                className="text-xs font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                {currentState?.label || "GeneratedComponent.tsx"}
              </span>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(currentState?.code || "");
                }}
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
            {highlightedHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                className="[&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent"
              />
            ) : (
              <pre
                className="whitespace-pre-wrap"
                style={{ color: "var(--text-secondary)" }}
              >
                <code>{currentState?.code}</code>
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Bottom slider */}
      <StateSlider
        totalStates={states.length}
        currentState={currentStateIndex}
        onStateChange={setCurrentStateIndex}
        stateLabels={stateLabels}
      />
    </div>
  );
}
