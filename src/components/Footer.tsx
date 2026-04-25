import { getGeneralWhatsappUrl } from "../utils/whatsapp";

export default function Footer() {
  return (
    <div className="mt-auto flex flex-col items-start gap-6 border-t border-dashed border-slate-800 pt-10 sm:flex-row sm:items-center sm:gap-12">
      <a
        href={getGeneralWhatsappUrl()}
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-green-400/40 bg-green-400/10 px-5 py-3 text-sm font-black uppercase tracking-widest text-green-300 transition hover:bg-green-400 hover:text-ink"
      >
        Написать в WhatsApp
      </a>
      <div className="text-left sm:text-right">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-1">Global Presence</div>
        <div className="text-xl font-bold text-sky/80">14 Countries</div>
      </div>
      <div className="text-left sm:text-right">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-1">Sustainability Score</div>
        <div className="text-xl font-bold text-sky">99% TRACEABLE</div>
      </div>
      <div className="text-left sm:ml-auto sm:text-right">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Copyright 2026</div>
        <div className="text-sm font-medium tracking-tighter opacity-50">FLOWERBOOM® DESIGN SYSTEM</div>
      </div>
    </div>
  );
}
