import { useState, useCallback } from 'react';

const CODE_SNIPPET = `import { LogRoute } from '@logroute/sdk';

const router = new LogRoute({ apiKey: process.env.LOGROUTE_KEY });
const response = await router.guard('Explain quantum computing');
console.log(response.model, response.confidence);`;

export default function CodeSnippet() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CODE_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
          type="button"
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
          <div key={i} className="flex hover:bg-white/[0.02] -mx-4 px-4 transition-colors duration-100">
            <span className="w-8 text-right mr-4 text-text-muted/40 select-none tabular-nums">{i + 1}</span>
            <span className="text-gray-300">
              {highlightSyntax(line)}
            </span>
          </div>
        ))}
      </div>
      {/* Usage hint */}
      <div className="px-4 py-2.5 bg-surface-alt/30 border-t border-border-subtle flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-text-muted flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p className="text-[11px] text-text-muted">
          Replace <code className="px-1 py-0.5 bg-surface-elevated rounded text-text-secondary font-mono">process.env.LOGROUTE_KEY</code> with your LogRoute API key
        </p>
      </div>
    </div>
  );
}

function highlightSyntax(line: string): React.ReactNode {
  const keywords = ['import', 'from', 'const', 'new', 'await'];
  const keywordClass = 'text-purple-400';
  const classRefClass = 'text-cyan-400';
  const stringClass = 'text-emerald-400';
  const funcClass = 'text-blue-400';

  const stringMatch = line.match(/^(.*?)(['"`])(.*?)\2(.*)$/);
  if (stringMatch) {
    const [, before, quote, content, after] = stringMatch;
    return (
      <span>
        {highlightKeywords(before, keywords, keywordClass, classRefClass, funcClass)}
        <span className={stringClass}>{quote}{content}{quote}</span>
        {highlightKeywords(after, keywords, keywordClass, classRefClass, funcClass)}
      </span>
    );
  }

  return highlightKeywords(line, keywords, keywordClass, classRefClass, funcClass);
}

function highlightKeywords(
  text: string,
  keywords: string[],
  keywordClass: string,
  classRefClass: string,
  funcClass: string,
): React.ReactNode {
  if (!text) return <span>{text}</span>;

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliestMatch: { index: number; length: number; className: string } | null = null;

    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`);
      const match = remaining.match(regex);
      if (match && match.index !== undefined) {
        if (!earliestMatch || match.index < earliestMatch.index) {
          earliestMatch = { index: match.index, length: kw.length, className: keywordClass };
        }
      }
    }

    const classMatch = remaining.match(/\b(LogRoute|console)\b/);
    if (classMatch && classMatch.index !== undefined) {
      if (!earliestMatch || classMatch.index < earliestMatch.index) {
        earliestMatch = {
          index: classMatch.index,
          length: classMatch[0].length,
          className: classMatch[0] === 'console' ? funcClass : classRefClass,
        };
      }
    }

    if (!earliestMatch || earliestMatch.index === -1) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (earliestMatch.index > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, earliestMatch.index)}</span>);
    }

    parts.push(
      <span key={key++} className={earliestMatch.className}>
        {remaining.slice(earliestMatch.index, earliestMatch.index + earliestMatch.length)}
      </span>
    );

    remaining = remaining.slice(earliestMatch.index + earliestMatch.length);
  }

  return <span>{parts}</span>;
}
