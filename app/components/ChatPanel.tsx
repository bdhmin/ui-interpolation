'use client';

import { useState, useRef, useEffect } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  messages: Message[];
  onSend: (message: string) => void;
  isGenerating: boolean;
}

const EXAMPLE_PROMPTS = [
  {
    title: 'Calendar with Weather',
    prompt:
      'A month view calendar interface where each day shows scheduled events and the weather forecast. Include navigation to switch months, and make days clickable to see details.',
  },
  {
    title: 'Kanban Board',
    prompt:
      'A Kanban-style task board with columns for To Do, In Progress, and Done. Each task card should show title, description, priority tag, and assignee avatar. Make it look modern and clean.',
  },
  {
    title: 'Analytics Dashboard',
    prompt:
      'A dashboard with stats cards showing key metrics (revenue, users, growth), a line chart for trends over time, and a recent activity feed. Use a professional dark theme.',
  },
  {
    title: 'Music Player',
    prompt:
      'A music player interface with album art, song info, playback controls (play/pause, skip, shuffle, repeat), a progress bar, and volume slider. Make it sleek and modern.',
  },
];

export default function ChatPanel({
  messages,
  onSend,
  isGenerating,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleExampleClick = (prompt: string) => {
    if (!isGenerating) {
      onSend(prompt);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      {/* Header */}
      <div
        className="flex h-[52px] shrink-0 items-center gap-2 px-4"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: 'var(--accent)' }}
        />
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          GenUI Chat
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4">
            <div
              className="mb-6 rounded-full p-4"
              style={{ backgroundColor: 'var(--bg-elevated)' }}
            >
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3
              className="mb-2 text-base font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              What would you like to build?
            </h3>
            <p
              className="mb-6 max-w-sm text-center text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Describe a component or try one of these examples
            </p>
            <div className="grid w-full max-w-md gap-2">
              {EXAMPLE_PROMPTS.map((example) => (
                <button
                  key={example.title}
                  onClick={() => handleExampleClick(example.prompt)}
                  disabled={isGenerating}
                  className="group rounded-lg px-4 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-tertiary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      'var(--border-secondary)';
                    e.currentTarget.style.backgroundColor =
                      'var(--bg-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.backgroundColor =
                      'var(--bg-tertiary)';
                  }}
                >
                  <span
                    className="block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {example.title}
                  </span>
                  <span
                    className="mt-1 block text-xs line-clamp-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {example.prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-3"
                  style={{
                    backgroundColor:
                      message.role === 'user'
                        ? 'var(--user-message-bg)'
                        : 'var(--assistant-message-bg)',
                    color:
                      message.role === 'user'
                        ? 'var(--user-message-text)'
                        : 'var(--assistant-message-text)',
                  }}
                >
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl px-4 py-3"
                  style={{ backgroundColor: 'var(--assistant-message-bg)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"
                      style={{ backgroundColor: 'var(--text-muted)' }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"
                      style={{ backgroundColor: 'var(--text-muted)' }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full"
                      style={{ backgroundColor: 'var(--text-muted)' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className="w-full px-6 pb-5 pt-6"
        style={{ borderTop: '1px solid var(--border-primary)' }}
      >
        <div className="mx-auto">
          <div
            className="overflow-hidden rounded-xl transition-all"
            style={{
              border: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-tertiary)',
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the component you want..."
              disabled={isGenerating}
              rows={3}
              className="block w-full resize-none border-0 bg-transparent p-4 text-sm leading-relaxed focus:outline-none focus:ring-0 disabled:opacity-50"
              style={{
                color: 'var(--text-primary)',
              }}
            />
            <div className="flex items-center justify-between px-4 pb-3 pt-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Enter to send · Shift+Enter for new line
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim() || isGenerating}
                className="rounded-lg px-4 py-1.5 text-xs font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: 'var(--accent)' }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor =
                      'var(--accent-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent)';
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
