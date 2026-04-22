export default function Footer() {
  return (
    <div className="mt-auto flex flex-col md:flex-row items-center gap-12 pt-12 border-t border-slate-800 border-dashed">
      <div className="text-right">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-1">Global Presence</div>
        <div className="text-xl font-bold text-sky/80">14 Countries</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-1">Sustainability Score</div>
        <div className="text-xl font-bold text-sky">99% TRACEABLE</div>
      </div>
      <div className="ml-auto text-right">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Copyright 2026</div>
        <div className="text-sm font-medium tracking-tighter opacity-50">FLOWERBOOM® DESIGN SYSTEM</div>
      </div>
    </div>
  );
}
