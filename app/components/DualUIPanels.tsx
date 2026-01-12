"use client";

import { useState, useEffect } from "react";
import {
  SandpackProvider,
  SandpackPreview,
  SandpackLayout,
} from "@codesandbox/sandpack-react";
import { codeToHtml } from "shiki";

interface UIPanelProps {
  code: string;
  label: string;
  isStreaming: boolean;
}

function UIPanel({ code, label, isStreaming }: UIPanelProps) {
  const [activeTab, setActiveTab] = useState<"ui" | "code">("ui");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (code && !isStreaming) {
      codeToHtml(code, {
        lang: "tsx",
        theme: isDarkMode ? "github-dark" : "github-light",
      }).then(setHighlightedHtml);
    }
  }, [code, isStreaming, isDarkMode]);

  const hasReactImport = code.includes("import") && code.includes("react");
  const componentCode = hasReactImport
    ? code
    : `import { useState, useEffect, useRef, useMemo, useCallback } from "react";\n\n${code}`;

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

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-xl"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-primary)",
      }}
    >
      {/* Header */}
      <div
        className="flex h-11 shrink-0 items-center justify-between px-4"
        style={{ borderBottom: "1px solid var(--border-primary)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: code
                ? "var(--accent)"
                : "var(--text-muted)",
            }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {label}
          </span>
          {isStreaming && (
            <span
              className="ml-2 flex items-center gap-1 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ backgroundColor: "var(--accent)" }}
              />
              Generating...
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("ui")}
            className="rounded-md px-3 py-1 text-xs font-medium transition-colors"
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
            className="rounded-md px-3 py-1 text-xs font-medium transition-colors"
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

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {!code ? (
          <div
            className="flex h-full flex-col items-center justify-center"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div
              className="mb-3 rounded-full p-3"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <p
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Generate {label}
            </p>
          </div>
        ) : isStreaming ? (
          <div
            className="flex h-full flex-col items-center justify-center"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div
              className="mb-3 rounded-full p-3"
              style={{ backgroundColor: "var(--bg-elevated)" }}
            >
              <svg
                className="h-6 w-6 animate-spin"
                style={{ color: "var(--accent)" }}
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <p
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Generating {label}...
            </p>
          </div>
        ) : activeTab === "ui" ? (
          <div className="h-full" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <SandpackProvider
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
          <div className="h-full overflow-auto p-4 font-mono text-sm">
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
                <code>{code}</code>
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface DualUIPanelsProps {
  ui1Code: string;
  ui2Code: string;
  isGeneratingUI1: boolean;
  isGeneratingUI2: boolean;
  onInterpolate: () => void;
  canInterpolate: boolean;
  isInterpolating: boolean;
}

export default function DualUIPanels({
  ui1Code,
  ui2Code,
  isGeneratingUI1,
  isGeneratingUI2,
  onInterpolate,
  canInterpolate,
  isInterpolating,
}: DualUIPanelsProps) {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Two UI Panels */}
      <div className="flex flex-1 gap-4">
        <div className="flex-1">
          <UIPanel
            code={ui1Code}
            label="UI 1"
            isStreaming={isGeneratingUI1}
          />
        </div>
        <div className="flex-1">
          <UIPanel
            code={ui2Code}
            label="UI 2"
            isStreaming={isGeneratingUI2}
          />
        </div>
      </div>

      {/* Interpolate Button */}
      <div className="flex justify-center pb-2">
        <button
          onClick={onInterpolate}
          disabled={!canInterpolate || isInterpolating}
          className="flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: "var(--accent)" }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = "var(--accent-hover)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent)";
          }}
        >
          {isInterpolating ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Interpolating...
            </>
          ) : (
            <>
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Interpolate UIs
            </>
          )}
        </button>
      </div>
    </div>
  );
}
