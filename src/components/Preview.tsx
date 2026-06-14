import {
  useState,
  useRef,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import { PageConfig, PAGE_SIZES } from '../types';

const MM_TO_PX = 3.7795275591;
const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.25, 1.5, 2];

/* ──────── Public handle for PDF generation ──────── */
export interface PreviewHandle {
  getMeasureDocument: () => Document | null;
  /** The width at which content is laid out (before CSS scale) */
  getLayoutWPx: () => number;
  /** The visible content area height per page in px */
  getContentHPx: () => number;
  /** Total content height after scale is applied */
  getScaledContentHeight: () => number;
  getNumPages: () => number;
  getContentScale: () => number;
  getContentScaleX: () => number;
  getContentScaleY: () => number;
  /** The visible content area width per page in px */
  getContentWPx: () => number;
}

interface PreviewProps {
  html: string;
  config: PageConfig;
}

/* ──────── HTML helpers ──────── */
function parseUserHtml(html: string) {
  const styleBlocks = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
  const linkTags = html.match(/<link[^>]*>/gi) || [];
  const styles = [...linkTags, ...styleBlocks].join('\n');

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let bodyContent: string;
  if (bodyMatch) {
    bodyContent = bodyMatch[1];
  } else {
    bodyContent = html
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<html[^>]*>/gi, '')
      .replace(/<\/html>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<\/?body[^>]*>/gi, '');
  }
  bodyContent = bodyContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  bodyContent = bodyContent.replace(/<link[^>]*>/gi, '');
  return { styles, bodyContent: bodyContent.trim() };
}

function buildMeasureHtml(styles: string, bodyContent: string) {
  return `<!DOCTYPE html><html><head>
<style>*,*::before,*::after{box-sizing:border-box}html,body{margin:0!important;padding:0!important;background:white!important}</style>
${styles}
</head><body>${bodyContent}</body></html>`;
}

function buildPageHtml(
  styles: string,
  bodyContent: string,
  offsetUnscaled: number,
  contentScale: number,
  contentScaleY: number,
  layoutW: number,
) {
  // The wrapper is laid out at the unscaled (layout) width,
  // offset to show the right slice, then CSS-scaled to fit
  // inside the actual content area.
  return `<!DOCTYPE html><html><head>
<style>
*,*::before,*::after{box-sizing:border-box}
html{overflow:hidden!important;height:100%!important}
body{margin:0!important;padding:0!important;overflow:hidden!important;background:white!important}
#__pdf_scale_wrap{
  transform-origin:top left;
  transform:scale(${contentScale}, ${contentScaleY});
  width:${layoutW}px;
}
#__pdf_offset_wrap{
  position:relative;
  top:${-offsetUnscaled}px;
}
</style>
${styles}
</head><body><div id="__pdf_scale_wrap"><div id="__pdf_offset_wrap">${bodyContent}</div></div></body></html>`;
}

/* ──────── Main component ──────── */
const Preview = forwardRef<PreviewHandle, PreviewProps>(({ html, config }, ref) => {
  const measureRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rawContentH, setRawContentH] = useState(800);
  const [rawContentW, setRawContentW] = useState(800);
  const [zoom, setZoom] = useState(0.55);

  const isFitPaper = config.contentFit === 'paper';
  const cs = config.contentScale;

  // ── Page geometry (px) ──
  const size = PAGE_SIZES[config.pageSize];
  const pageWMm = config.orientation === 'landscape' ? size.height : size.width;
  const pageHMm = config.orientation === 'landscape' ? size.width : size.height;
  const pageWPx = pageWMm * MM_TO_PX;
  const pageHPx = pageHMm * MM_TO_PX;
  const mTop = config.margins.top * MM_TO_PX;
  const mRight = config.margins.right * MM_TO_PX;
  const mBottom = config.margins.bottom * MM_TO_PX;
  const mLeft = config.margins.left * MM_TO_PX;
  const contentWPx = Math.max(1, pageWPx - mLeft - mRight);
  const contentHPx = Math.max(1, pageHPx - mTop - mBottom);

  const layoutWPx = isFitPaper ? contentWPx : contentWPx / cs;
  const contentScaleX = isFitPaper ? contentWPx / Math.max(1, rawContentW) : cs;
  const contentScaleY = isFitPaper ? contentHPx / Math.max(1, rawContentH) : cs;
  const scaledContentH = rawContentH * contentScaleY;
  // How many pages we need
  const numPages = Math.max(1, Math.ceil(scaledContentH / contentHPx));
  const displayPages = Math.min(numPages, 50);
  // Unscaled content height that fits in one page
  const unscaledPageH = contentHPx / contentScaleY;

  // ── Parsed HTML ──
  const parsed = useMemo(() => parseUserHtml(html), [html]);

  // ── Measure content height in hidden iframe at LAYOUT width ──
  useEffect(() => {
    const iframe = measureRef.current;
    if (!iframe) return;
    iframe.style.width = `${layoutWPx}px`;

    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(buildMeasureHtml(parsed.styles, parsed.bodyContent));
    doc.close();

    const measure = () => {
      const b = doc.body;
      const d = doc.documentElement;
      if (b) {
        const h = Math.max(
          b.scrollHeight || 0,
          b.offsetHeight || 0,
          d?.scrollHeight || 0,
          d?.offsetHeight || 0,
        );
        if (h > 0) setRawContentH(h);
        const width = Math.max(
          b.scrollWidth || 0,
          b.offsetWidth || 0,
          d?.scrollWidth || 0,
          d?.offsetWidth || 0,
        );
        if (width > 0) setRawContentW(width);
      }
    };
    const t1 = setTimeout(measure, 100);
    const t2 = setTimeout(measure, 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [parsed, layoutWPx]);

  // ── Auto-fit to width on mount / page-size change ──
  const fitWidth = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const available = el.getBoundingClientRect().width - 56;
    setZoom(Math.max(0.15, Math.min(2, available / pageWPx)));
  }, [pageWPx]);

  const fitPage = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const zW = (r.width - 56) / pageWPx;
    const zH = (r.height - 56) / pageHPx;
    setZoom(Math.max(0.15, Math.min(zW, zH, 2)));
  }, [pageWPx, pageHPx]);

  useEffect(() => { fitWidth(); }, [fitWidth]);

  const zoomIn = () => {
    const idx = ZOOM_STEPS.findIndex((z) => z >= zoom);
    setZoom(ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, (idx < 0 ? ZOOM_STEPS.length - 1 : idx) + 1)]);
  };
  const zoomOut = () => {
    const idx = ZOOM_STEPS.findIndex((z) => z >= zoom);
    setZoom(ZOOM_STEPS[Math.max(0, (idx < 0 ? 0 : idx) - 1)]);
  };

  // ── Expose to parent for PDF generation ──
  useImperativeHandle(
    ref,
    () => ({
      getMeasureDocument: () => measureRef.current?.contentDocument ?? null,
      getLayoutWPx: () => layoutWPx,
      getContentWPx: () => contentWPx,
      getContentHPx: () => contentHPx,
      getScaledContentHeight: () => scaledContentH,
      getNumPages: () => numPages,
      getContentScale: () => cs,
      getContentScaleX: () => contentScaleX,
      getContentScaleY: () => contentScaleY,
    }),
    [layoutWPx, contentWPx, contentHPx, scaledContentH, numPages, cs, contentScaleX, contentScaleY],
  );

  return (
    <div className="flex flex-col h-full">
      {/* ── Header with zoom controls ── */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#151922] border-b border-[#2a303b] shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preview</span>
          <span className="hidden sm:inline ml-1 text-[10px] text-gray-600 font-mono">
            {displayPages} pg{displayPages !== 1 && 's'} · {isFitPaper ? 'fit paper' : `${Math.round(cs * 100)}% scale`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <ZBtn onClick={zoomOut} title="Zoom out">−</ZBtn>
          <span className="text-[11px] text-gray-400 w-11 text-center font-mono select-none">{Math.round(zoom * 100)}%</span>
          <ZBtn onClick={zoomIn} title="Zoom in">+</ZBtn>
          <div className="w-px h-4 bg-[#2a303b] mx-1" />
          <ZBtn onClick={fitWidth} title="Fit width" wide>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 3H3M21 21H3M12 7v10M8 11l4-4 4 4M8 13l4 4 4-4" /></svg>
          </ZBtn>
          <ZBtn onClick={fitPage} title="Fit page" wide>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" opacity={0.3} /></svg>
          </ZBtn>
        </div>
      </div>

      {/* ── Hidden measurement iframe (at layoutWPx width) ── */}
      <iframe
        ref={measureRef}
        style={{ position: 'fixed', left: -99999, top: 0, width: layoutWPx, height: 1, border: 'none', visibility: 'hidden' }}
        sandbox="allow-same-origin"
        title="measure"
      />

      {/* ── Pages container ── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto py-6 px-4"
        style={{ background: '#0b0d12' }}
      >
        <div className="flex flex-col items-center" style={{ gap: 24 * zoom }}>
          {Array.from({ length: displayPages }).map((_, i) => (
            <PageSheet
              key={`${config.pageSize}-${config.orientation}-${config.margins.top}-${config.margins.left}-${config.margins.bottom}-${config.margins.right}-${contentScaleX}-${contentScaleY}-${i}`}
              styles={parsed.styles}
              bodyContent={parsed.bodyContent}
              pageIndex={i}
              pageWPx={pageWPx}
              pageHPx={pageHPx}
              contentWPx={contentWPx}
              contentHPx={contentHPx}
              mTop={mTop}
              mLeft={mLeft}
              layoutWPx={layoutWPx}
              rawContentH={rawContentH}
              contentScale={contentScaleX}
              contentScaleY={contentScaleY}
              unscaledPageH={unscaledPageH}
              totalPages={displayPages}
              zoom={zoom}
            />
          ))}
        </div>
        {numPages > displayPages && (
          <p className="text-center text-xs text-gray-500 mt-4">
            Showing {displayPages} of {numPages} pages. Content continues…
          </p>
        )}
      </div>
    </div>
  );
});

Preview.displayName = 'Preview';
export default Preview;

/* ──────── Page sheet (one paper page) ──────── */
interface PageSheetProps {
  styles: string;
  bodyContent: string;
  pageIndex: number;
  pageWPx: number;
  pageHPx: number;
  contentWPx: number;
  contentHPx: number;
  mTop: number;
  mLeft: number;
  layoutWPx: number;
  rawContentH: number;
  contentScale: number;
  contentScaleY: number;
  unscaledPageH: number;
  totalPages: number;
  zoom: number;
}

function PageSheet({
  styles,
  bodyContent,
  pageIndex,
  pageWPx,
  pageHPx,
  contentWPx,
  contentHPx,
  mTop,
  mLeft,
  layoutWPx,
  rawContentH,
  contentScale,
  contentScaleY,
  unscaledPageH,
  totalPages,
  zoom,
}: PageSheetProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Each page shows a slice of unscaled content starting at this offset
  const offsetUnscaled = pageIndex * unscaledPageH;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(buildPageHtml(styles, bodyContent, offsetUnscaled, contentScale, contentScaleY, layoutWPx));
    doc.close();
  }, [styles, bodyContent, offsetUnscaled, contentScale, contentScaleY, layoutWPx]);

  return (
    <div
      style={{
        width: pageWPx * zoom,
        height: pageHPx * zoom,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: pageWPx,
          height: pageHPx,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          background: '#fff',
          position: 'relative',
          boxShadow: '0 1px 12px rgba(0,0,0,0.35), 0 0 40px rgba(0,0,0,0.15)',
          borderRadius: 2,
        }}
      >
        {/* content area inside margins, clips overflow */}
        <div
          style={{
            position: 'absolute',
            top: mTop,
            left: mLeft,
            width: contentWPx,
            height: contentHPx,
            overflow: 'hidden',
          }}
        >
          {/* Iframe renders at full layoutW inside, with CSS scale applied */}
          <iframe
            ref={iframeRef}
            sandbox="allow-same-origin"
            title={`page-${pageIndex}`}
            style={{
              width: contentWPx,
              height: rawContentH * contentScaleY,
              border: 'none',
              display: 'block',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Page number label */}
        <span
          style={{
            position: 'absolute',
            bottom: Math.min(mTop * 0.25, 12) + 2,
            right: 10,
            fontSize: 9,
            color: '#c0c0c0',
            fontFamily: 'sans-serif',
            userSelect: 'none',
          }}
        >
          {pageIndex + 1} / {totalPages}
        </span>
      </div>
    </div>
  );
}

/* ──────── Zoom button ──────── */
function ZBtn({
  children,
  onClick,
  title,
  wide,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  wide?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center h-7 rounded-md bg-[#171b24] border border-[#2a303b] text-gray-400 hover:text-white hover:border-gray-500 transition-all text-sm font-mono ${
        wide ? 'w-8' : 'w-7'
      }`}
    >
      {children}
    </button>
  );
}


