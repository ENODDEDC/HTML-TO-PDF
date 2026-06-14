import {
  PageConfig,
  PAGE_SIZES,
  MARGIN_PRESETS,
  MarginPreset,
  PageSizeKey,
  Orientation,
} from '../types';

interface ConfigPanelProps {
  config: PageConfig;
  onChange: (config: PageConfig) => void;
  onDownload: () => void;
  isGenerating: boolean;
}

export default function ConfigPanel({ config, onChange, onDownload, isGenerating }: ConfigPanelProps) {
  const update = (partial: Partial<PageConfig>) => {
    onChange({ ...config, ...partial });
  };

  const setMarginPreset = (preset: MarginPreset) => {
    if (preset === 'custom') {
      update({ marginPreset: 'custom' });
    } else {
      update({ marginPreset: preset, margins: { ...MARGIN_PRESETS[preset] } });
    }
  };

  const setMarginValue = (side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    const num = parseFloat(value) || 0;
    update({
      marginPreset: 'custom',
      margins: { ...config.margins, [side]: Math.max(0, num) },
    });
  };

  const pageDim = PAGE_SIZES[config.pageSize];
  const w = config.orientation === 'landscape' ? pageDim.height : pageDim.width;
  const h = config.orientation === 'landscape' ? pageDim.width : pageDim.height;

  const contentW = Math.max(0, w - config.margins.left - config.margins.right);
  const contentH = Math.max(0, h - config.margins.top - config.margins.bottom);

  const scalePercent = Math.round(config.contentScale * 100);

  return (
    <div className="flex flex-col h-full bg-[#0b0d12]">
      {/* Header */}
      <div className="px-4 py-2.5 bg-[#151922] border-b border-[#2a303b] flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Configuration</span>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* File name */}
        <Section title="File Name">
          <div className="relative">
            <input
              type="text"
              value={config.fileName}
              onChange={(e) => update({ fileName: e.target.value })}
              className="w-full pl-3 pr-12 py-2 bg-[#151922] border border-[#2a303b] rounded-lg text-white text-sm focus:outline-none focus:border-gray-400 transition-colors"
              placeholder="document"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">.pdf</span>
          </div>
        </Section>

        {/* Page Size */}
        <Section title="Paper Size">
          <select
            value={config.pageSize}
            onChange={(e) => update({ pageSize: e.target.value as PageSizeKey })}
            className="w-full px-3 py-2 bg-[#151922] border border-[#2a303b] rounded-lg text-white text-sm focus:outline-none focus:border-gray-400 transition-colors appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
          >
            {Object.entries(PAGE_SIZES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </Section>

        {/* Orientation */}
        <Section title="Orientation">
          <div className="grid grid-cols-2 gap-2">
            <OrientationBtn
              active={config.orientation === 'portrait'}
              onClick={() => update({ orientation: 'portrait' as Orientation })}
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="1" width="20" height="30" rx="2" />
                  <line x1="6" y1="6" x2="18" y2="6" strokeWidth="1" opacity="0.4" />
                  <line x1="6" y1="10" x2="18" y2="10" strokeWidth="1" opacity="0.4" />
                  <line x1="6" y1="14" x2="14" y2="14" strokeWidth="1" opacity="0.4" />
                </svg>
              }
              label="Portrait"
            />
            <OrientationBtn
              active={config.orientation === 'landscape'}
              onClick={() => update({ orientation: 'landscape' as Orientation })}
              icon={
                <svg className="w-6 h-4" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="2" width="30" height="20" rx="2" />
                  <line x1="5" y1="7" x2="27" y2="7" strokeWidth="1" opacity="0.4" />
                  <line x1="5" y1="11" x2="27" y2="11" strokeWidth="1" opacity="0.4" />
                  <line x1="5" y1="15" x2="20" y2="15" strokeWidth="1" opacity="0.4" />
                </svg>
              }
              label="Landscape"
            />
          </div>
        </Section>

        {/* ═══ Content Scale ═══ */}
        <Section title="Content Scale">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => update({ contentFit: 'scale' })}
              className={`py-2 rounded-lg text-xs font-medium transition-all ${
                config.contentFit === 'scale'
                  ? 'bg-white/8 text-gray-100 border border-gray-500/60'
                  : 'bg-[#151922] text-gray-400 hover:text-white border border-[#2a303b]'
              }`}
            >
              Scale
            </button>
            <button
              onClick={() => update({ contentFit: 'paper' })}
              className={`py-2 rounded-lg text-xs font-medium transition-all ${
                config.contentFit === 'paper'
                  ? 'bg-white/8 text-gray-100 border border-gray-500/60'
                  : 'bg-[#151922] text-gray-400 hover:text-white border border-[#2a303b]'
              }`}
            >
              Fit to Paper
            </button>
          </div>
          {/* Scale value display + input */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => update({ contentScale: Math.max(0.25, config.contentScale - 0.01) })}
              disabled={config.contentFit === 'paper'}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#151922] border border-[#2a303b] text-gray-400 hover:text-white hover:border-gray-500/60 transition-all text-base font-bold"
            >
              −
            </button>

            <div className="flex-1 relative">
              <input
                type="range"
                min="25"
                max="200"
                step="1"
                value={scalePercent}
                onChange={(e) => update({ contentScale: parseInt(e.target.value) / 100 })}
                disabled={config.contentFit === 'paper'}
                className="w-full h-1.5 bg-[#2a303b] rounded-lg appearance-none cursor-pointer accent-gray-300"
              />
            </div>

            <button
              onClick={() => update({ contentScale: Math.min(3, config.contentScale + 0.01) })}
              disabled={config.contentFit === 'paper'}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#151922] border border-[#2a303b] text-gray-400 hover:text-white hover:border-gray-500/60 transition-all text-base font-bold"
            >
              +
            </button>

            <div className="flex items-center bg-[#151922] border border-[#2a303b] rounded-lg px-2 py-1 min-w-[60px]">
              <input
                type="number"
                min="25"
                max="300"
                step="1"
                value={scalePercent}
                disabled={config.contentFit === 'paper'}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (!isNaN(v) && v >= 25 && v <= 300) {
                    update({ contentScale: v / 100 });
                  }
                }}
                className="w-8 bg-transparent text-white text-sm text-right focus:outline-none font-mono"
              />
              <span className="text-gray-500 text-xs ml-0.5">%</span>
            </div>
          </div>
        </Section>

        {/* Margins */}
        <Section title="Margins">
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {(['none', 'narrow', 'normal', 'wide'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setMarginPreset(preset)}
                className={`py-1.5 px-1 rounded-md text-xs font-medium transition-all capitalize ${
                  config.marginPreset === preset
                    ? 'bg-gray-100 text-[#0b0d12] shadow-sm'
                    : 'bg-[#151922] text-gray-400 hover:text-white border border-[#2a303b] hover:border-[#3a414d]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Visual margin diagram */}
          <div className="relative bg-[#151922] border border-[#2a303b] rounded-lg p-3 mb-3">
            <div className="flex justify-center">
              <div className="relative" style={{ width: 120, height: config.orientation === 'landscape' ? 85 : 155 }}>
                {/* Page outline */}
                <div className="absolute inset-0 border-2 border-[#3a414d] rounded bg-[#0d1016]">
                  {/* Margin area */}
                  <div
                    className="absolute border border-dashed border-gray-500/60 bg-white/5 rounded-sm"
                    style={{
                      top: `${(config.margins.top / h) * 100}%`,
                      left: `${(config.margins.left / w) * 100}%`,
                      right: `${(config.margins.right / w) * 100}%`,
                      bottom: `${(config.margins.bottom / h) * 100}%`,
                    }}
                  >
                    {/* Content lines (scaled) */}
                    <div
                      className="absolute inset-1 flex flex-col gap-1 overflow-hidden origin-top-left"
                      style={{ transform: config.contentFit === 'paper' ? 'scale(1)' : `scale(${config.contentScale})` }}
                    >
                      <div className="h-1 bg-gray-600/30 rounded w-full shrink-0"></div>
                      <div className="h-1 bg-gray-600/30 rounded w-full shrink-0"></div>
                      <div className="h-1 bg-gray-600/30 rounded w-4/5 shrink-0"></div>
                      <div className="h-1 bg-gray-600/30 rounded w-full shrink-0"></div>
                      <div className="h-1 bg-gray-600/30 rounded w-3/5 shrink-0"></div>
                      <div className="h-1 bg-gray-600/30 rounded w-full shrink-0"></div>
                      <div className="h-1 bg-gray-600/30 rounded w-2/3 shrink-0"></div>
                    </div>
                  </div>
                </div>

                {/* Margin labels */}
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 -translate-y-full text-[10px] text-gray-300 font-mono">
                  {config.margins.top}
                </div>
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 translate-y-full text-[10px] text-gray-300 font-mono">
                  {config.margins.bottom}
                </div>
                <div className="absolute top-1/2 -left-1 -translate-x-full -translate-y-1/2 text-[10px] text-gray-300 font-mono">
                  {config.margins.left}
                </div>
                <div className="absolute top-1/2 -right-1 translate-x-full -translate-y-1/2 text-[10px] text-gray-300 font-mono">
                  {config.margins.right}
                </div>
              </div>
            </div>
          </div>

          {/* Custom margin inputs */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <MarginInput label="Top" value={config.margins.top} onChange={(v) => setMarginValue('top', v)} />
              <MarginInput label="Bottom" value={config.margins.bottom} onChange={(v) => setMarginValue('bottom', v)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MarginInput label="Left" value={config.margins.left} onChange={(v) => setMarginValue('left', v)} />
              <MarginInput label="Right" value={config.margins.right} onChange={(v) => setMarginValue('right', v)} />
            </div>
          </div>
        </Section>

        {/* Info summary */}
        <Section title="Summary">
          <div className="bg-[#151922] border border-[#2a303b] rounded-lg p-3 space-y-2 text-xs">
            <InfoRow label="Page" value={`${w.toFixed(1)} × ${h.toFixed(1)} mm`} />
            <InfoRow label="Margins" value={
              config.marginPreset === 'none' ? 'None' :
              config.margins.top === config.margins.bottom && config.margins.left === config.margins.right && config.margins.top === config.margins.left
                ? `${config.margins.top} mm (all sides)`
                : `${config.margins.top} / ${config.margins.right} / ${config.margins.bottom} / ${config.margins.left} mm`
            } />
            <InfoRow label="Content area" value={`${contentW.toFixed(1)} × ${contentH.toFixed(1)} mm`} />
            <InfoRow label="Content fit" value={config.contentFit === 'paper' ? 'Fit to paper' : `${scalePercent}%`} />
          </div>
        </Section>
      </div>

      {/* Download button at bottom */}
      <div className="p-4 border-t border-[#2a303b] bg-[#151922]">
        <button
          onClick={onDownload}
          disabled={isGenerating}
          className="w-full py-3 rounded-lg bg-gray-100 text-[#0b0d12] font-semibold text-sm hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          {isGenerating ? (
            <>
              <svg className="w-4 h-4 spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="30 70" />
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ----- sub-components ----- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">{title}</h3>
      {children}
    </div>
  );
}

function OrientationBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 py-3 rounded-lg text-xs font-medium transition-all ${
        active
          ? 'bg-white/8 text-gray-100 border border-gray-500/60 shadow-inner'
          : 'bg-[#151922] text-gray-400 hover:text-white border border-[#2a303b] hover:border-[#3a414d]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MarginInput({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 bg-[#151922] border border-[#2a303b] rounded-lg px-2.5 py-1.5">
      <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wide w-8 shrink-0">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step="1"
        min="0"
        className="w-full bg-transparent text-white text-sm text-right focus:outline-none"
      />
      <span className="text-[10px] text-gray-600 shrink-0">mm</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 font-mono">{value}</span>
    </div>
  );
}



