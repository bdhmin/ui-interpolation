"use client";

import { useEffect, useState } from "react";
import {
  SandpackProvider,
  SandpackPreview,
  SandpackLayout,
} from "@codesandbox/sandpack-react";

interface PreviewViewProps {
  code: string;
  isStreaming: boolean;
}

export default function PreviewView({ code, isStreaming }: PreviewViewProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Detect color scheme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Show empty state when no code
  if (!code) {
    return (
      <div 
        className="flex h-full flex-col items-center justify-center text-center"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="mb-4 rounded-full p-4" style={{ backgroundColor: 'var(--bg-elevated)' }}>
          <svg
            className="h-8 w-8"
            style={{ color: 'var(--text-muted)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </div>
        <h3 className="mb-1 text-base font-medium" style={{ color: 'var(--text-secondary)' }}>No preview</h3>
        <p className="max-w-xs text-sm" style={{ color: 'var(--text-muted)' }}>
          Generate a component to see it rendered here
        </p>
      </div>
    );
  }

  // Show generating state while streaming
  if (isStreaming) {
    return (
      <div 
        className="flex h-full flex-col items-center justify-center text-center"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="mb-4 rounded-full p-4" style={{ backgroundColor: 'var(--bg-elevated)' }}>
          <svg
            className="h-8 w-8 animate-spin"
            style={{ color: 'var(--accent)' }}
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
        <h3 className="mb-1 text-base font-medium" style={{ color: 'var(--text-secondary)' }}>Generating...</h3>
        <p className="max-w-xs text-sm" style={{ color: 'var(--text-muted)' }}>
          Preview will appear when code generation is complete
        </p>
      </div>
    );
  }

  // Prepend React imports if not already present
  const hasReactImport = code.includes("import") && code.includes("react");
  const componentCode = hasReactImport
    ? code
    : `import { useState, useEffect, useRef, useMemo, useCallback } from "react";\n\n${code}`;

  // Wrap the generated component in an App that renders it
  const bgColor = isDarkMode ? "bg-zinc-950" : "bg-zinc-50";
  const appCode = `import GeneratedComponent from "./GeneratedComponent";

export default function App() {
  return (
    <div className="min-h-screen ${bgColor} p-8">
      <GeneratedComponent />
    </div>
  );
}`;

  const files = {
    "/App.tsx": appCode,
    "/GeneratedComponent.tsx": componentCode,
  };

  return (
    <div className="h-full" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <SandpackProvider
        template="react-ts"
        theme={isDarkMode ? "dark" : "light"}
        files={files}
        customSetup={{
          dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
          },
        }}
        options={{
          externalResources: [
            "https://cdn.tailwindcss.com",
          ],
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
  );
}
