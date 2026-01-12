"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="max-w-2xl px-8 text-center">
        {/* Logo/Icon */}
        <div
          className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "var(--bg-elevated)" }}
        >
          <svg
            className="h-10 w-10"
            style={{ color: "var(--text-muted)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 3v18M3 12h18"
            />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="mb-4 text-4xl font-semibold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          UI Interpolation
        </h1>

        {/* Description */}
        <p
          className="mb-8 text-lg leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          Generate two different UIs, then interpolate between them to create
          smooth transitions with in-situ customization controls.
        </p>

        {/* CTA Button */}
        <Link
          href="/interpolation-tester"
          className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-medium text-white transition-all"
          style={{ backgroundColor: "var(--accent)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent-hover)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Open Interpolation Tester
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>

        {/* Features */}
        <div className="mt-16 grid grid-cols-3 gap-6">
          {[
            {
              title: "Generate",
              description: "Create two different UI variants via chat",
            },
            {
              title: "Interpolate",
              description: "Generate intermediate states between UIs",
            },
            {
              title: "Customize",
              description: "Use direct manipulation to transition states",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl p-5"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <h3
                className="mb-2 text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {feature.title}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
