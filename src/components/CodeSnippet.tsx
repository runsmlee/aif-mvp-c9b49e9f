import { useState, useCallback } from 'react';

const CODE_SNIPPET = `import { RouteForge } from '@routeforge/sdk';

const forge = new RouteForge({ apiKey: process.env.RF_KEY });
const response = await forge.route('Explain quantum computing');
console.log(response.model, response.confidence);`;

export default function CodeSnippet() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CODE_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = CODE_SNIPPET;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const lines = CODE_SNIPPET.split('\n');

  return (
    <div
      className="bg-gray-950 rounded-xl border border-border overflow-hidden"
      role="region"
      aria-label="Integration code snippet"
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-alt/50 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-error/60" />
            <span className="w-3 h-3 rounded-full bg-warning/60" />
            <span className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <span className="text-xs text-text-muted font-mono ml-2">integration.ts</span>
        </div>
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 min-h-[32px] inline-flex items-center gap-1.5 ${
            copied
              ? 'bg-success/15 text-success border border-success/20'
              : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80 hover:text-text-primary border border-border-subtle'
          }`}
          aria-label={copied ? 'Copied!' : 'Copy to Clipboard'}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <div
        className="p-4 font-mono text-[13px] leading-6 overflow-x-auto"
        data-testid="code-content"
      >
        {lines.map((line, i) => (
          <div key={i} className="flex hover:bg-white/[0.02] -mx-4 px-4">
            <span className="w-8 text-right mr-4 text-text-muted/40 select-none tabular-nums">{i + 1}</span>
            <span className="text-gray-300">
              {highlightSyntax(line)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function highlightSyntax(line: string): React.ReactNode {
  // Simple syntax highlighting
  if (line.startsWith('import')) {
    return <span><span className="text-purple-400">import</span> <span className="text-text-primary">{line.slice(7)}</span></span>;
  }
  if (line.includes('= new')) {
    const parts = line.split('new');
    return <span><span className="text-text-primary">{parts[0]}</span><span className="text-blue-400">new</span><span className="text-text-primary">{parts[1]}</span></span>;
  }
  if (line.includes('await')) {
    const parts = line.split('await');
    return <span><span className="text-text-primary">{parts[0]}</span><span className="text-purple-400">await</span><span className="text-text-primary">{parts[1]}</span></span>;
  }
  if (line.includes('console')) {
    return <span className="text-green-400">{line}</span>;
  }
  return <span>{line}</span>;
}
