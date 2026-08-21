import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying code:', err);
    }
  };

  return (
    <div className="relative my-4 rounded-lg bg-[#090d16] border border-dark-border overflow-hidden group">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0d1322] border-b border-dark-border text-xs text-dark-textMuted font-mono">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-dark-surface hover:bg-dark-border text-dark-textMain transition-colors"
          title="Copiar código"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-dark-textMuted" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <pre className="p-4 overflow-x-auto text-sm font-mono text-cyan-200 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};
