import { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import CodeEditor from './components/CodeEditor';
import Preview, { PreviewHandle } from './components/Preview';
import ConfigPanel from './components/ConfigPanel';
import { SAMPLE_HTML } from './constants/sampleHtml';
import { PageConfig, PAGE_SIZES, MARGIN_PRESETS } from './types';

type View = 'editor' | 'workspace';
type MobileTab = 'preview' | 'config';

export default function App() {
  const [html, setHtml] = useState(SAMPLE_HTML);
  const [view, setView] = useState<View>('editor');
  const [mobileTab, setMobileTab] = useState<MobileTab>('preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const previewRef = useRef<PreviewHandle>(null);

  const [config, setConfig] = useState<PageConfig>({
    pageSize: 'a4',
    orientation: 'portrait',
    marginPreset: 'normal',
    margins: { ...MARGIN_PRESETS.normal },
    fileName: 'document',
    contentScale: 1,
    contentFit: 'scale',
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleContinue = () => {
    if (html.trim()) setView('workspace');
  };

  const handleBackToEditor = () => {
    setView('editor');
  };

  /* ── PDF Download ── */
  const handleDownload = useCallback(async () => {
    const p = previewRef.current;
    if (!p) return;

    const measureDoc = p.getMeasureDocument();
    if (!measureDoc?.body) {
      showToast('⚠️ Preview not ready. Please wait.');
      return;
    }

    setIsGenerating(true);

    try {
      const layoutWPx = p.getLayoutWPx();
      const contentWPx = p.getContentWPx();
      const contentHPx = p.getContentHPx();
      const numPages = p.getNumPages();
      const scaleX = p.getContentScaleX();
      const scaleY = p.getContentScaleY();

      const size = PAGE_SIZES[config.pageSize];
      const pdfW = config.orientation === 'landscape' ? size.height : size.width;
      const pdfH = config.orientation === 'landscape' ? size.width : size.height;
      const contentWMm = pdfW - config.margins.left - config.margins.right;
      const contentHMm = pdfH - config.margins.top - config.margins.bottom;

      const container = document.createElement('div');
      container.style.cssText = `position:absolute;left:-99999px;top:0;width:${layoutWPx}px;background:white;`;

      measureDoc.querySelectorAll('style').forEach((s) => {
        container.appendChild(s.cloneNode(true));
      });

      const bodyClone = measureDoc.body.cloneNode(true) as HTMLElement;
      bodyClone.style.margin = '0';
      bodyClone.style.padding = '0';
      container.appendChild(bodyClone);
      document.body.appendChild(container);

      await new Promise((r) => setTimeout(r, 500));

      const fullCanvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      document.body.removeChild(container);

      const scaledCanvas = document.createElement('canvas');
      const scaledW = Math.round(fullCanvas.width * scaleX);
      const scaledH = Math.round(fullCanvas.height * scaleY);
      scaledCanvas.width = scaledW;
      scaledCanvas.height = scaledH;
      const sctx = scaledCanvas.getContext('2d');
      if (sctx) {
        sctx.fillStyle = '#ffffff';
        sctx.fillRect(0, 0, scaledW, scaledH);
        sctx.drawImage(fullCanvas, 0, 0, scaledW, scaledH);
      }

      const pdf = new jsPDF({
        orientation: config.orientation,
        unit: 'mm',
        format: ['letter', 'legal'].includes(config.pageSize) ? config.pageSize : [pdfW, pdfH],
      });

      const canvasScaleY = scaledCanvas.height / p.getScaledContentHeight();
      const pageCanvasH = contentHPx * canvasScaleY;

      for (let i = 0; i < numPages; i++) {
        if (i > 0) pdf.addPage();

        const srcY = i * pageCanvasH;
        const remaining = scaledCanvas.height - srcY;
        const sliceH = Math.min(pageCanvasH, Math.max(1, remaining));

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = scaledCanvas.width;
        pageCanvas.height = Math.round(sliceH);
        const ctx = pageCanvas.getContext('2d');
        if (!ctx) continue;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(scaledCanvas, 0, srcY, scaledCanvas.width, sliceH, 0, 0, pageCanvas.width, sliceH);

        const imgData = pageCanvas.toDataURL('image/png');
        const imgHMm = (sliceH / pageCanvasH) * contentHMm;

        pdf.addImage(imgData, 'PNG', config.margins.left, config.margins.top, contentWMm, imgHMm);
      }

      const safeName = config.fileName.trim() || 'document';
      pdf.save(`${safeName}.pdf`);
      showToast('✅ PDF downloaded — ' + numPages + ' page' + (numPages > 1 ? 's' : '') + '!');
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('❌ Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [config]);

  /* ══════════════════════════════════════════
   *  RENDER
   * ══════════════════════════════════════════ */

  // ── STEP 1: Editor view (full screen) ──
  if (view === 'editor') {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#0f1117] border-b border-[#232833] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#171b24] border border-[#2a303b] flex items-center justify-center text-gray-200"><svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 3v5h5" /></svg></div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight tracking-tight">HTML → PDF</h1>
              <p className="text-[11px] text-gray-500">Paste HTML · Preview · Download as PDF</p>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <CodeEditor value={html} onChange={setHtml} onContinue={handleContinue} />
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl bg-surface border border-[#3a414d] shadow-2xl text-white text-sm font-medium">
            {toast}
          </div>
        )}
      </div>
    );
  }

  // ── STEP 2: Workspace view (Preview + Config) ──
  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f1117] border-b border-[#232833] shrink-0">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={handleBackToEditor}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#151922] border border-[#2a303b] text-gray-400 hover:text-white hover:border-gray-500 transition-all text-xs font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
            <span className="hidden sm:inline">Edit HTML</span>
          </button>

          <div className="w-px h-6 bg-[#2a303b] hidden sm:block" />

          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white leading-tight">Preview & Configure</h1>
            <p className="text-[10px] text-gray-500">Adjust settings then download your PDF</p>
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="px-5 py-2 rounded-lg bg-gray-100 text-[#0b0d12] font-semibold text-sm hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
        >
          {isGenerating ? (
            <>
              <svg className="w-4 h-4 spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="30 70" /></svg>
              <span className="hidden sm:inline">Generating…</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* ── Mobile tabs (Preview / Config) ── */}
      <div className="flex md:hidden border-b border-[#232833] bg-[#0f1117] shrink-0">
        {(['preview', 'config'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-all uppercase tracking-wide ${
              mobileTab === tab ? 'text-gray-100 border-b-2 border-gray-300 bg-white/5' : 'text-gray-500'
            }`}
          >
            {tab === 'preview' ? '👁 Preview' : '⚙ Config'}
          </button>
        ))}
      </div>

      {/* ── Two-panel layout: Preview (left) + Config (right) ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview */}
        <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[70%] lg:w-[75%] border-r border-[#232833]`}>
          <Preview ref={previewRef} html={html} config={config} />
        </div>

        {/* Config */}
        <div className={`${mobileTab === 'config' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[30%] lg:w-[25%]`}>
          <ConfigPanel config={config} onChange={setConfig} onDownload={handleDownload} isGenerating={isGenerating} />
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl bg-surface border border-[#3a414d] shadow-2xl text-white text-sm font-medium">
          {toast}
        </div>
      )}

      {/* ── Generating overlay ── */}
      {isGenerating && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-surface border border-[#3a414d] rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-12 h-12 border-4 border-gray-700 border-t-gray-200 rounded-full spinner" />
            <div className="text-white font-semibold">Generating your PDF…</div>
            <div className="text-gray-400 text-sm">Matching preview pages to PDF pages</div>
          </div>
        </div>
      )}
    </div>
  );
}


