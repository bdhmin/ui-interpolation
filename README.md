# GenUI Template

A starter template for building generative UI applications with AI. Generate React components through a chat interface with real-time code preview.

## Features

- Chat-based interface for generating React components
- Real-time code streaming with syntax highlighting
- Live preview using Sandpack
- Resizable split-pane layout
- Built with Next.js, React, and Tailwind CSS

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up your environment variables:

```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to start generating components.

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS 4
- **AI**: Anthropic Claude API
- **Code Preview**: CodeSandbox Sandpack
- **Syntax Highlighting**: Shiki

## Project Structure

```
app/
├── api/
│   └── generate/       # AI generation endpoint
├── components/
│   ├── ChatPanel.tsx   # Chat interface
│   ├── CodePreviewPanel.tsx
│   ├── CodeView.tsx    # Code display with syntax highlighting
│   └── PreviewView.tsx # Live component preview
├── layout.tsx
└── page.tsx
```

## License

MIT
