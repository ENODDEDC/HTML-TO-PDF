import { useRef, useEffect, useCallback } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
}

export default function CodeEditor({ value, onChange, onContinue }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lineCount = value.split('\n').length;
  const hasContent = value.trim().length > 0;

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChange(text);
    } catch {
      // fallback
    }
  }, [onChange]);

  const handleClear = () => {
    onChange('');
    textareaRef.current?.focus();
  };

  useEffect(() => {
    handleScroll();
  }, [value]);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 200);
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#090b10]">
      {/* ── Editor area — takes all available space ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Line numbers */}
        <div
          ref={lineNumbersRef}
          className="overflow-hidden select-none text-right pr-3 pl-4 py-4 text-gray-600 font-mono text-[13px] leading-[1.6] bg-[#090b10] border-r border-[#242a35] min-w-[56px] shrink-0"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="h-[20.8px]">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className="code-editor block h-full min-h-0 flex-1 overflow-y-scroll overflow-x-auto bg-transparent p-4 text-gray-200"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          placeholder="<!-- Paste or type your HTML here... -->"
        />
      </div>

      {/* ── Bottom bar — always visible ── */}
      <div className="shrink-0 border-t border-[#232833] bg-[#0f1117] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Left: info + utility buttons */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-500 font-mono hidden sm:block">
            {lineCount} lines · {value.length.toLocaleString()} chars
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePasteFromClipboard}
              className="px-2.5 py-1.5 rounded-md bg-[#151922] border border-[#2a303b] text-gray-400 hover:text-white hover:border-gray-500 transition-all text-[11px] font-medium flex items-center gap-1"
              title="Paste from clipboard"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Paste
            </button>
            {hasContent && (
              <button
                onClick={handleClear}
                className="px-2.5 py-1.5 rounded-md bg-[#151922] border border-[#2a303b] text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-all text-[11px] font-medium flex items-center gap-1"
                title="Clear editor"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: Continue button */}
        <button
          onClick={onContinue}
          disabled={!hasContent}
          className="px-6 py-2.5 rounded-lg bg-gray-100 text-[#0b0d12] font-semibold text-sm hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm shrink-0"
        >
          Continue to Preview
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </button>
      </div>
    </div>
  );
}

