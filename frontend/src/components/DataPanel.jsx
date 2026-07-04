function DataPanel({ title, icon, action, children, className = "" }) {
  return (
    <section className={`overflow-hidden rounded-lg border border-slate-200/80 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur ${className}`}>
      <div className="flex min-h-14 items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-green-50/45 px-5 py-4">
        <div className="flex items-center gap-3">
          {icon && <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-700 text-white shadow-sm">{icon}</span>}
          <h2 className="text-base font-bold text-slate-950">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default DataPanel;
