const SEGMENTS = [
  ["Type", "R"],
  ["HQ", "H"],
  ["Hi-Tech", "H"],
  ["Plant", "cP"],
  ["Dept", "Rd"],
  ["Sec", "D"],
  ["Sub", "D"],
  ["Line", "XX"],
  ["Model", "W"],
  ["Serial", "0001"],
  ["Ver", "000"],
] as const;

export function CompressorPlate() {
  return (
    <figure className="plate relative overflow-hidden rounded-xl border border-border p-5 sm:p-6">
      <figcaption className="mb-4 flex items-baseline justify-between gap-3">
        <span className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          Naming specimen
        </span>
        <span className="font-mono text-[11px] text-primary">HHcP</span>
      </figcaption>
      <svg viewBox="0 0 560 250" className="h-auto w-full" role="img" aria-label="Reciprocating compressor schematic">
        <g fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M48 78 v-28 h26" className="stroke-steel" />
          <path d="M48 172 v28 h26" className="stroke-steel" />
          <rect x="36" y="70" width="22" height="110" className="stroke-copper" />
          <rect x="58" y="86" width="176" height="78" className="stroke-steel" />
          <line x1="58" y1="102" x2="234" y2="102" className="stroke-steel" strokeWidth="0.6" />
          <line x1="58" y1="148" x2="234" y2="148" className="stroke-steel" strokeWidth="0.6" />
          <rect x="132" y="100" width="42" height="50" className="stroke-copper" />
          <line x1="140" y1="108" x2="166" y2="108" className="stroke-copper" strokeWidth="0.8" />
          <line x1="140" y1="142" x2="166" y2="142" className="stroke-copper" strokeWidth="0.8" />
          <path d="M174 125 H286" className="stroke-copper oil-path" />
          <circle cx="318" cy="148" r="34" className="stroke-steel" />
          <circle cx="318" cy="148" r="5" className="fill-copper stroke-copper" />
          <path d="M318 114 v-16 M318 182 v16 M284 148 h-12 M352 148 h12" className="stroke-steel" strokeWidth="0.8" />
          <path d="M352 148 H470" className="stroke-steel" />
          <rect x="392" y="132" width="18" height="32" className="stroke-steel" />
          <rect x="448" y="132" width="18" height="32" className="stroke-steel" />
          <path d="M470 148 h42" className="stroke-copper oil-path" />
          <path d="M36 210 H250" className="stroke-steel" strokeWidth="0.7" />
          <path d="M36 204 v12 M250 204 v12" className="stroke-steel" strokeWidth="0.7" />
        </g>
      </svg>
      <div className="mt-5 grid grid-cols-4 gap-x-2 gap-y-3 sm:grid-cols-6">
        {SEGMENTS.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <div className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              {label}
            </div>
            <div className="truncate font-mono text-sm text-foreground">{value}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-sm tracking-wide text-primary sm:text-base">
        RHHcPRdDDXXW0001_000
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Template from the SOP. The title is stored beside the file, never inside the name.
      </p>
    </figure>
  );
}
